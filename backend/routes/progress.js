const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Roadmap = require("../models/Roadmap");
const Interview = require("../models/Interview");

// @GET /api/progress/stats
router.get("/stats", protect, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id, isActive: true });
    const interviews = await Interview.find({ user: req.user._id });
    const completedInterviews = interviews.filter((i) => i.isCompleted);
    const avgScore = completedInterviews.length
      ? Math.round(completedInterviews.reduce((a, b) => a + b.overallScore, 0) / completedInterviews.length)
      : 0;

    res.json({
      roadmapProgress: roadmap?.overallProgress || 0,
      completedMilestones: roadmap?.milestones?.filter((m) => m.isCompleted).length || 0,
      totalMilestones: roadmap?.milestones?.length || 0,
      totalInterviews: interviews.length,
      completedInterviews: completedInterviews.length,
      avgInterviewScore: avgScore,
      totalPoints: req.user.totalPoints,
      streak: req.user.streak,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;