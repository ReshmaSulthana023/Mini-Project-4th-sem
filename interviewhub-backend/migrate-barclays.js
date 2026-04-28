const mongoose = require("mongoose");
const Post = require("./models/Post");
require("dotenv").config();

const migrateBarclays = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/interview_hub");
    console.log("✅ Connected to MongoDB");

    // Update all posts with "Barclay's" to "Barclays"
    const result = await Post.updateMany(
      { company: "Barclay's" },
      { $set: { company: "Barclays" } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   Updated: ${result.modifiedCount} posts`);
    console.log(`   Matched: ${result.matchedCount} posts`);

    // Show all updated posts
    const updatedPosts = await Post.find({ company: "Barclays" });
    console.log(`\n📋 Total Barclays posts: ${updatedPosts.length}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
};

migrateBarclays();
