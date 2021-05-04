const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

// @route   GET api/auth
// @desc    Test auth route
// @access  Private

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: error.message,
    });
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter the password").exists(),
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

      if (!user) {
        return res.status(400).json({
          errors: [{ message: "Invalid credentials" }],
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [{ message: "Invalid credentials" }],
        });
      }

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
