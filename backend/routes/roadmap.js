const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const Roadmap = require("../models/Roadmap");
const User = require("../models/User");

// POST /api/roadmap/generate
router.post("/generate", protect, async (req, res) => {
  const { degree, skills, careerGoal, targetRole, domain, experience, durationWeeks = 12 } = req.body;

  if (!domain || !careerGoal || !targetRole) {
    return res.status(400).json({ error: "Domain, career goal, and target role are required" });
  }

  // Check API  exists
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-your_openai_api_key_here") {
    return res.status(500).json({ error: "OpenAI API key not configured in .env file" });
  }

  try {
    // Dynamically import openai to andle missing key gracefully
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a career guidance expert for Indian students. Generate a detailed ${durationWeeks}-week career roadmap.

Student Profile:
- Degree: ${degree || "Not specified"}
- Current Skills: ${skills?.join(", ") || "Fresher, no prior skills"}
- Career Goal: ${careerGoal}
- Target Role: ${targetRole}
- Domain: ${domain}
- Experience Level: ${experience || "fresher"}

Return ONLY valid JSON (no markdown, no backticks, no explanation) in this exact format:
{
  "title": "Roadmap title here",
  "milestones": [
    {
      "week": 1,
      "title": "Week title",
      "description": "What to focus on this week",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "resources": [
        {"title": "Resource name", "url": "https://example.com", "type": "video"}
      ],
      "points": 10
    }
  ]
}

Generate exactly ${durationWeeks} milestone objects. Make tasks specific and actionable for the Indian job market.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const rawContent = completion.choices[0].message.content.trim();

    // Strep any accidental markdown fences
    const jsonStr = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let roadmapData;
    try {
      roadmapData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message);
      console.error("Raw AI response:", rawContent.substring(0, 500));
      return res.status(500).json({ error: "AI returned invalid format. Please try again." });
    }

    if (!roadmapData.milestones || !Array.isArray(roadmapData.milestones)) {
      return res.status(500).json({ error: "AI response missing milestones. Please try again." });
    }

    // Deactivate old roadmaps
    await Roadmap.updateMany({ user: req.user._id }, { isActive: false });

    const roadmap = await Roadmap.create({
      user: req.user._id,
      title: roadmapData.title || `${targetRole} Roadmap`,
      domain,
      goal: careerGoal,
      currentSkills: skills || [],
      targetRole,
      durationWeeks,
      milestones: roadmapData.milestones,
      aiGenerated: true,
    });

    res.status(201).json(roadmap);

  } catch (err) {
    console.error("Roadmap generation error:", err?.message || err);

    // Specific OpenAI error messages
    if (err?.status === 401 || err?.code === "invalid_api_key") {
      return res.status(500).json({ error: "Invalid OpenAI API key. Check your .env file." });
    }
    if (err?.status === 429) {
      return res.status(500).json({ error: "OpenAI rate limit or no credits. " });
    }
    if (err?.status === 402) {
      return res.status(500).json({ error: "OpenAI account has no credits." });
    }
    if (err?.code === "ENOTFOUND" || err?.code === "ECONNREFUSED") {
      return res.status(500).json({ error: "Cannot reach OpenAI. Check your internet connection." });
    }

    res.status(500).json({ error: err?.message || "Failed to generate roadmap. Please try again." });
  }
});

// @GET /api/roadmap/my
router.get("/my", protect, async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id, isActive: true });
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @GET /api/roadmap/history
router.get("/history", protect, async (req, res) => {
  try {
    const roadmaps = await Roadmap.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @PUT /api/roadmap/milestone/:roadmapId/:milestoneIndex
router.put("/milestone/:roadmapId/:milestoneIndex", protect, async (req, res) => {
  try {
    const { roadmapId, milestoneIndex } = req.params;
    const roadmap = await Roadmap.findOne({ _id: roadmapId, user: req.user._id });
    if (!roadmap) return res.status(404).json({ error: "Roadmap not found" });

    const idx = parseInt(milestoneIndex);
    roadmap.milestones[idx].isCompleted = !roadmap.milestones[idx].isCompleted;
    if (roadmap.milestones[idx].isCompleted) {
      roadmap.milestones[idx].completedAt = new Date();
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalPoints: roadmap.milestones[idx].points || 10 },
      });
    } else {
      roadmap.milestones[idx].completedAt = undefined;
    }

    const completed = roadmap.milestones.filter((m) => m.isCompleted).length;
    roadmap.overallProgress = Math.round((completed / roadmap.milestones.length) * 100);

    await roadmap.save();
    res.json(roadmap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;