const mongoose = require("mongoose");
const Post = require("./models/Post");
require("dotenv").config();

const checkCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/interview_hub");
    console.log("✅ Connected to MongoDB");

    // Get all unique companies
    const companies = await Post.distinct("company");
    console.log("\n📋 All unique companies in database:");
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. "${company}"`);
    });

    // Also show all posts with company info
    const posts = await Post.find({}, { company: 1, role: 1, postedBy: 1, createdAt: 1 }).sort({ createdAt: -1 });
    console.log(`\n📝 Total posts: ${posts.length}`);
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. ${post.company} - ${post.role} (by ${post.postedBy})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkCompanies();
