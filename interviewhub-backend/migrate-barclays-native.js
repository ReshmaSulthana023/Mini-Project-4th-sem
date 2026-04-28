const { MongoClient } = require("mongodb");
require("dotenv").config();

const updateBarclays = async () => {
  const client = new MongoClient(process.env.MONGO_URI || "mongodb://localhost:27017/interview_hub");

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB (native client)");

    const db = client.db("test");  // Explicitly use "test" database
    const postsCollection = db.collection("posts");

    // First, let's see what we're looking for
    console.log("\n🔍 Current posts with companies containing 'Barclay':");
    const currentPosts = await postsCollection.find({ company: /Barclay/ }).toArray();
    console.log(`   Found: ${currentPosts.length} posts`);
    currentPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. ID: ${post._id}, Company: "${post.company}"`);
    });

    // Now update
    if (currentPosts.length > 0) {
      const result = await postsCollection.updateMany(
        { company: /Barclay/ },
        { $set: { company: "Barclays" } }
      );
      console.log(`\n✅ Update result:`);
      console.log(`   Matched: ${result.matchedCount}`);
      console.log(`   Modified: ${result.modifiedCount}`);
    } else {
      console.log("\n⚠️  Let's check ALL companies in database:");
      const allCompanies = await postsCollection.distinct("company");
      console.log(`   All unique companies: ${allCompanies.map(c => `"${c}"`).join(", ")}`);
    }

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

updateBarclays();
