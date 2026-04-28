const mongoose = require("mongoose");
const Post = require("./models/Post");
require("dotenv").config();

const migrateBarclaysRegex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/interview_hub");
    console.log("✅ Connected to MongoDB");

    // Use regex to find any variation of Barclay's
    const result = await Post.updateMany(
      { company: /Barclay/i },  // Case-insensitive regex for anything with "Barclay"
      { $set: { company: "Barclays" } }
    );

    console.log(`✅ Migration complete!`);
    console.log(`   Updated: ${result.modifiedCount} posts`);
    console.log(`   Matched: ${result.matchedCount} posts`);

    // Verify the change
    const posts = await Post.find({ company: /Barclay/i });
    console.log(`\n📋 Updated posts:`);
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. Company: "${post.company}" | Role: "${post.role}"`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  }
};

migrateBarclaysRegex();
