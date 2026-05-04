const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const MentorRequest = require("../models/MentorRequest");

// @GET /api/mentors
router.get("/", protect, async (req, res) => {
  try {
    const { domain, search } = req.query;
    const filter = { role: { $in: ["mentor", "both"] } };
    if (domain) filter.domain = { $regex: domain, $options: "i" };
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { domain: { $regex: search, $options: "i" } }];

    const mentors = await User.find(filter).select("-password").limit(20);
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @POST /api/mentors/request
router.post("/request", protect, async (req, res) => {
  try {
    const { mentorId, message, goals } = req.body;
    const existing = await MentorRequest.findOne({ mentee: req.user._id, mentor: mentorId, status: "pending" });
    if (existing) return res.status(400).json({ error: "Request already sent to this mentor" });

    const request = await MentorRequest.create({ mentee: req.user._id, mentor: mentorId, message, goals });
    await request.populate(["mentee", "mentor"]);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/mentors/requests/my
router.get("/requests/my", protect, async (req, res) => {
  try {
    const requests = await MentorRequest.find({ mentee: req.user._id })
      .populate("mentor", "name avatar domain mentorProfile")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentors/requests/incoming
router.get("/requests/incoming", protect, async (req, res) => {
  try {
    const requests = await MentorRequest.find({ mentor: req.user._id })
      .populate("mentee", "name avatar degree careerGoal skills")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @PT /api/mentors/requests/:id
router.put("/requests/:id", protect, async (req, res) => {
  try {
    const { status, sessionDate, sessionNotes } = req.body;
    const request = await MentorRequest.findOne({ _id: req.params.id, mentor: req.user._id });
    if (!request) return res.status(404).json({ error: "Request not found" });

    request.status = status;
    if (sessionDate) request.sessionDate = sessionDate;
    if (sessionNotes) request.sessionNotes = sessionNotes;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;