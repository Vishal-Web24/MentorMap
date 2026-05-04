const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, maxlength: 1000 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    tags: [{ type: String }],
    category: {
      type: String,
      enum: ["question", "achievement", "resource", "discussion", "advice"],
      default: "discussion",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    views: { type: Number, default: 0 },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);