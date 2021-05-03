const express = require("express");
const { check, validationResult } = require("express-validator/check");

const router = express.Router();

// @route   POST api/users
// @desc    Register user
// @access  Public

router.post(
  "/",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    res.status(200).json({
      data: req.body,
    });
  }
);

module.exports = router;
