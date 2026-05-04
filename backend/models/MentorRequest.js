const mongoose = require("mongoose");

const mentorRequestSchema = new mongoose.Schema(
  {
    mentee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, maxlength: 500 },
    goals: [{ type: String }],
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
    sessionDate: { type: Date },
    sessionNotes: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.MentorRequest || mongoose.model("MentorRequest", mentorRequestSchema);