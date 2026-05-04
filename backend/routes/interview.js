const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { protect } = require("../middleware/auth");
const Interview = require("../models/Interview");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST/api/interview/start
router.post("/start", protect, async (req, res) => {
  const { domain, difficulty = "medium", interviewType = "technical" } = req.body;
  try {
    const systemPrompt = `You are an experienced ${interviewType} interviewer at a top Indian tech company. 
You are conducting a ${difficulty} level ${interviewType} interview for a ${domain} role.
Start with a warm greeting, introduce yourself as "Alex from MentorMap Interviews", and ask the first interview question.
Keep responses concise. After each answer, give brief feedback (2-3 lines), score it 1-10, then ask the next question.
Format your response as: [FEEDBACK: your feedback] [SCORE: X/10] [NEXT: your next question]
For the first message, just greet and ask first question without feedback/score.`;

    const firstMessage = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Start the interview" },
      ],
      max_tokens: 500,
    });

    const aiResponse = firstMessage.choices[0].message.content;

    const interview = await Interview.create({
      user: req.user._id,
      domain,
      difficulty,
      interviewType,
      messages: [{ role: "assistant", content: aiResponse }],
    });

    res.status(201).json(interview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start interview session" });
  }
});

// @POST /api/interview/:id/message
router.post("/:id/message", protect, async (req, res) => {
  const { content } = req.body;
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    if (interview.isCompleted) return res.status(400).json({ error: "Interview is already completed" });

    interview.messages.push({ role: "user", content });

    const systemPrompt = `You are an experienced ${interview.interviewType} interviewer at a top Indian tech company.
You are conducting a ${interview.difficulty} level interview for ${interview.domain} role.
Give feedback on the candidate's answer, score it 1-10, then ask the next question.
Format: [FEEDBACK: brief feedback 2-3 lines] [SCORE: X/10] [NEXT: next question]
After 8-10 questions, end the interview with [END_INTERVIEW] and provide overall assessment.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...interview.messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 600,
    });

    const aiResponse = completion.choices[0].message.content;

    // Extract score if present
    const scoreMatch = aiResponse.match(/\[SCORE:\s*(\d+)\/10\]/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

    interview.messages.push({ role: "assistant", content: aiResponse, score });

    if (aiResponse.includes("[END_INTERVIEW]")) {
      interview.isCompleted = true;
      const scores = interview.messages.filter((m) => m.score).map((m) => m.score);
      interview.overallScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }

    await interview.save();
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/interview/my
router.get("/my", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/interview/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ error: "Not found" });
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;