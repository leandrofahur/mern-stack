const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route   GET api/posts
// @desc    Fetch all posts
// @access  Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });

    res.status(200).json({
      posts,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      error: error.message,
    });
  }
});

// @route   GET api/posts/:post_id
// @desc    Fetch post by ID
// @access  Private

router.get("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
});

// @route   POST api/posts
// @desc    Create or Update a post
// @access  Public

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.status(200).json({
        post,
      });
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

// @route   DELETE api/posts/:post_id
// @desc    Delete post by ID
// @access  Private

router.delete("/:post_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // Check on the user:
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({
        message: "User not authorized!",
      });
    }

    await post.remove();

    res.status(200).json({
      message: "Post removed",
    });
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
