const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    url:   { type: String, default: "" },
    type:  { type: String, default: "article" },
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema({
  week:        { type: Number, required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  tasks:       [{ type: String }],
  resources:   [resourceSchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  points:      { type: Number, default: 10 },
});

const roadmapSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:           { type: String, required: true },
    domain:          { type: String, required: true },
    goal:            { type: String, required: true },
    currentSkills:   [{ type: String }],
    targetRole:      { type: String, required: true },
    durationWeeks:   { type: Number, default: 12 },
    milestones:      [milestoneSchema],
    overallProgress: { type: Number, default: 0 },
    isActive:        { type: Boolean, default: true },
    aiGenerated:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema);