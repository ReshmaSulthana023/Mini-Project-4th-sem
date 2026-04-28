const mongoose = require("mongoose");
require("dotenv").config();

const checkDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/interview_hub");
    console.log("✅ Connected to MongoDB");
    
    // Get database name
    const dbName = conn.connection.name;
    console.log(`📊 Database: ${dbName}`);

    // Get all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`\n📋 Collections in database:`);
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });

    // Count posts in the posts collection
    const postCount = await conn.connection.db.collection("posts").countDocuments();
    console.log(`\n📝 Documents in 'posts' collection: ${postCount}`);

    if (postCount > 0) {
      const posts = await conn.connection.db.collection("posts").find({}).toArray();
      console.log("\n📌 Posts with their companies:");
      posts.forEach((post, index) => {
        console.log(`   ${index + 1}. Company: "${post.company}" | Role: "${post.role}"`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

checkDatabase();
