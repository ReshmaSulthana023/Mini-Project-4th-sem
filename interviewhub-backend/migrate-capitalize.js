// Migration script to capitalize company names and roles
const mongoose = require("mongoose");
require("dotenv").config();

const Post = require("./models/Post");

// Capitalize mapping for common companies
const companyMap = {
    "google": "Google",
    "amazon": "Amazon",
    "microsoft": "Microsoft",
    "flipkart": "Flipkart",
    "tcs": "TCS",
    "infosys": "Infosys",
    "wipro": "Wipro",
    "barclays": "Barclays",
};

// Capitalize mapping for common roles
const roleMap = {
    "sde": "SDE",
    "software engineer": "Software Engineer",
    "senior software engineer": "Senior Software Engineer",
    "frontend developer": "Frontend Developer",
    "backend developer": "Backend Developer",
    "full stack developer": "Full Stack Developer",
    "data analyst": "Data Analyst",
    "devops engineer": "DevOps Engineer",
    "ml engineer": "ML Engineer",
    "qa engineer": "QA Engineer",
    "qa": "QA",
};

// Function to capitalize string using the map or default title case
function capitalizeCompany(company) {
    if (!company) return company;
    const lower = company.trim().toLowerCase();
    return companyMap[lower] || company.charAt(0).toUpperCase() + company.slice(1).toLowerCase();
}

function capitalizeRole(role) {
    if (!role) return role;
    const lower = role.trim().toLowerCase();
    return roleMap[lower] || role.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");
}

async function migrateData() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        console.log("\n📊 Fetching all posts...");
        const posts = await Post.find();
        console.log(`📋 Found ${posts.length} posts to migrate`);

        if (posts.length === 0) {
            console.log("⚠️  No posts found. Exiting...");
            await mongoose.disconnect();
            return;
        }

        console.log("\n🔄 Migrating posts...\n");

        let updatedCount = 0;
        let noChangesCount = 0;

        for (let post of posts) {
            const originalCompany = post.company;
            const originalRole = post.role;

            const newCompany = capitalizeCompany(post.company);
            const newRole = capitalizeRole(post.role);

            const changed = originalCompany !== newCompany || originalRole !== newRole;

            if (changed) {
                post.company = newCompany;
                post.role = newRole;
                await post.save();
                updatedCount++;
                console.log(`✅ Updated: "${originalCompany}" → "${newCompany}" | "${originalRole}" → "${newRole}"`);
            } else {
                noChangesCount++;
                console.log(`⏭️  Skipped: "${originalCompany}" - "${originalRole}" (already correct)`);
            }
        }

        console.log("\n" + "=".repeat(70));
        console.log("✅ Migration Complete!");
        console.log(`   📝 Updated: ${updatedCount} posts`);
        console.log(`   ⏭️  Skipped: ${noChangesCount} posts`);
        console.log("=".repeat(70));

        await mongoose.disconnect();
        console.log("\n✅ Disconnected from MongoDB");

    } catch (err) {
        console.error("❌ Migration Error:", err);
        process.exit(1);
    }
}

// Run migration
migrateData();
