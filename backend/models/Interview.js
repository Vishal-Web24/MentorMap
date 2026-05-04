const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  feedback: { type: String, default: "" },
  score: { type: Number, min: 0, max: 10 },
});

const interviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    domain: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    interviewType: { type: String, enum: ["technical", "hr", "behavioral", "system-design"], default: "technical" },
    messages: [messageSchema],
    overallScore: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    isCompleted: { type: Boolean, default: false },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Interview || mongoose.model("Interview", interviewSchema);