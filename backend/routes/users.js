const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// @GET /api/users/leaderboard
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const users = await User.find({ totalPoints: { $gt: 0 } })
      .select("name avatar totalPoints domain streak")
      .sort({ totalPoints: -1 })
      .limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/users/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;