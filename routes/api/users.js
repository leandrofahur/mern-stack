const express = require("express");
const router = express.Router();

const { check, validationResult } = require("express-validator/check");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { name, email, password } = req.body;
    try {
      // See if the user exists:
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({
          errors: [{ message: "User already exists" }],
        });
      }

      // Get users gravatar:
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt the password:
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return the jsonwebtoken:
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecretToken"),
        { expiresIn: 3600000 },
        (error, token) => {
          if (error) throw error;
          res.status(200).json({
            token,
          });
        }
      );
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

module.exports = router;
