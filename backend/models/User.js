const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["mentee", "mentor", "both"], default: "mentee" },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 500 },
    degree: { type: String, default: "" },
    skills: [{ type: String }],
    interests: [{ type: String }],
    careerGoal: { type: String, default: "" },
    experience: { type: String, enum: ["fresher", "0-1yr", "1-3yr", "3-5yr", "5+yr"], default: "fresher" },
    domain: { type: String, default: "" },
    linkedIn: { type: String, default: "" },
    github: { type: String, default: "" },
    isProfileComplete: { type: Boolean, default: false },
    mentorProfile: {
      expertise: [{ type: String }],
      yearsOfExperience: { type: Number, default: 0 },
      company: { type: String, default: "" },
      designation: { type: String, default: "" },
      availableSlots: { type: Number, default: 3 },
      sessionPrice: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      isVerified: { type: Boolean, default: false },
    },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);