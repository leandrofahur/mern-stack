const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const { check, validationResult } = require("express-validator/check");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

// @route   GET api/profile/me
// @desc    Fetch current user
// @access  Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        error: "There is no profile for this user",
      });
    }

    res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    if (!profiles) {
      return res.status(400).json({
        error: "There is no profile for this user",
      });
    }

    res.status(200).json({
      profiles,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({
        error: "Profile not found",
      });
    }

    res.status(200).json({
      profile,
    });
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        error: "Profile not found",
      });
    }
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private

router.post(
  "/",
  [
    auth,
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skills is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build a profile object:
    const profileFields = {};
    profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;

    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build social object:
    profileFields.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (twitter) profileFields.twitter = twitter;
    if (facebook) profileFields.facebook = facebook;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.status(200).json({
          profile,
        });
      }

      // Create:
      profile = new Profile(profileFields);

      await profile.save();
      res.status(200).json({
        profile,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

// @route   DELETE api/profile/
// @desc    Delete profile, user & posts
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    // Remore profile:
    await Profile.findOneAndRemove({ user: req.user.id });

    // @todo - Remove usr posts:

    // Remore user:
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({
      message: "User deleted!",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
