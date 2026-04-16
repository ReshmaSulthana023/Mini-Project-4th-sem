// backend/models/Post.js

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ["On-Campus", "Off-Campus", "Referral", "Walk-in"] },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    outcome: { type: String, enum: ["Selected ✅", "Rejected ❌", "Pending ⏳"] },
    topics: [String],
    rounds: { type: Number, min: 0 },
    roundDetails: { type: String, required: true },
    questions: String,
    tips: String,
    postedBy: { type: String, required: true },
    userId: { type: String, required: true },
    upvotes: { type: Number, default: 0, min: 0 },
    upvotedBy: [{ type: String }], // Array of user emails who have upvoted
    createdAt: { type: Date, default: Date.now }
});

// Create index for faster queries
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ company: 1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);