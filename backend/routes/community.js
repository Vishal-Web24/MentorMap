const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Post = require("../models/Post");

// GET /api/community/posts
router.get("/posts", protect, async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag] };

    const posts = await Post.find(filter)
      .populate("user", "name avatar role domain mentorProfile")
      .populate("comments.user", "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(filter);
    res.json({ posts, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/posts
router.post("/posts", protect, async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;
    const post = await Post.create({ user: req.user._id, title, content, tags, category });
    await post.populate("user", "name avatar role domain");
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/community/posts/:id/like
router.put("/posts/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);

    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/community/posts/:id/comment
router.post("/posts/:id/comment", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: req.user._id, content: req.body.content });
    await post.save();
    await post.populate("comments.user", "name avatar");
    res.json(post.comments[post.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/community/posts/:id
router.delete("/posts/:id", protect, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ error: "Post not found or unauthorized" });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;