const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test auth route
// @access  Public

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

module.exports = router;
