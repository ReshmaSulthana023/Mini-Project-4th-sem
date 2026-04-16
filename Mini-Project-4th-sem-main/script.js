const API = "http://localhost:5000/api";

// ===== STATE =====
let currentUser = null;
let allPosts = [];
let currentTab = "explore";
let currentEditingPostId = null;

// ===== AUTH FUNCTIONS =====
async function handleSignup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    // Validation
    if (!name || !email || !password || !confirm) {
        return showToast("Please fill all fields", "error");
    }
    
    if (name.length < 3) {
        return showToast("Name must be at least 3 characters", "error");
    }

    if (!email.includes("@")) {
        return showToast("Please enter a valid email", "error");
    }
    
    if (password.length < 6) {
        return showToast("Password must be at least 6 characters", "error");
    }
    
    if (password !== confirm) {
        return showToast("Passwords don't match", "error");
    }

    try {
        showToast("Creating account...", "");
        
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            if (data.user) {
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("userEmail", data.user.email);
            }
            currentUser = data.user;
            closeModal();
            showToast(`Welcome, ${data.user.name}! 🎉`, "success");
            setTimeout(() => enterDashboard(), 500);
        } else {
            showToast(data.msg || data.error || "Signup failed", "error");
        }
    } catch (err) {
        console.error("Signup error:", err);
        showToast("Connection error. Make sure the server is running on http://localhost:5000", "error");
    }
}

async function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        return showToast("Please fill all fields", "error");
    }

    if (!email.includes("@")) {
        return showToast("Please enter a valid email", "error");
    }

    try {
        showToast("Logging in...", "");
        
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            if (data.user) {
                localStorage.setItem("userName", data.user.name);
                localStorage.setItem("userEmail", data.user.email);
            }
            currentUser = data.user;
            closeLogin();
            showToast(`Welcome back, ${data.user.name}! 👋`, "success");
            setTimeout(() => enterDashboard(), 500);
        } else {
            showToast(data.msg || data.error || "Login failed", "error");
        }
    } catch (err) {
        console.error("Login error:", err);
        showToast("Connection error. Make sure the server is running on http://localhost:5000", "error");
    }
}

window.onload = () => {
    console.log("Page loaded, initializing...");
    
    const params = new URLSearchParams(window.location.search);
    
    // Handle Google OAuth redirect
    const token = params.get("token");
    const name = decodeURIComponent(params.get("name") || "");
    const email = decodeURIComponent(params.get("email") || "");
    const error = params.get("error");
    
    if (error) {
        showToast("Google login failed. Please try again.", "error");
        history.replaceState({}, "", window.location.pathname);
        return;
    }
    
    if (token) {
        try {
            localStorage.setItem("token", token);
            if (name) localStorage.setItem("userName", name);
            if (email) localStorage.setItem("userEmail", email);
            
            // Decode and set current user
            const payload = JSON.parse(atob(token.split(".")[1]));
            currentUser = { 
                name: payload.name || name || "User", 
                email: payload.email || email || "user@example.com" 
            };
            
            document.getElementById("landingPage").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
            
            showTab("explore");
            loadPosts();
            showToast("Google login successful! 🎉", "success");
            
            // Clean URL
            history.replaceState({}, "", window.location.pathname);
        } catch (err) {
            console.error("Token processing error:", err);
            localStorage.removeItem("token");
            showToast("Error processing login. Please try again.", "error");
        }
        return;
    }

    // Check for existing token
    const savedToken = localStorage.getItem("token");
    
    if (savedToken) {
        try {
            const payload = JSON.parse(atob(savedToken.split(".")[1]));
            currentUser = { 
                name: payload.name || localStorage.getItem("userName") || "User", 
                email: payload.email || localStorage.getItem("userEmail") || "user@example.com"
            };
            
            console.log("✅ User logged in:", currentUser);
            
            document.getElementById("landingPage").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
            
            showTab("explore");
            loadPosts();
        } catch (err) {
            console.log("Saved token invalid, clearing...");
            localStorage.removeItem("token");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
        }
    } else {
        console.log("No saved token, showing landing page");
    }
};

function logout() {
    localStorage.removeItem("token");
    currentUser = null;
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("landingPage").style.display = "block";
    clearSignupForm();
    clearLoginForm();
    showToast("Logged out successfully");
}

function enterDashboard() {
    try {
        document.getElementById("landingPage").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
        showTab("explore");
        loadPosts();
    } catch (err) {
        console.error("Error entering dashboard:", err);
        showToast("Error loading dashboard", "error");
    }
}

// ===== MODAL FUNCTIONS =====
function clearSignupForm() {
    document.getElementById("signupName").value = "";
    document.getElementById("signupEmail").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupConfirm").value = "";
}

function clearLoginForm() {
    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";
}

function openModal() { 
    clearSignupForm();
    document.getElementById("signupModal").style.display = "block"; 
}
function closeModal() { document.getElementById("signupModal").style.display = "none"; }

function openLogin() { 
    clearLoginForm();
    document.getElementById("loginModal").style.display = "block"; 
}
function closeLogin() { document.getElementById("loginModal").style.display = "none"; }

function switchToLogin() {
    document.getElementById("signupModal").style.display = "none";
    clearLoginForm();
    document.getElementById("loginModal").style.display = "block";
}

function switchToSignup() {
    document.getElementById("loginModal").style.display = "none";
    clearSignupForm();
    document.getElementById("signupModal").style.display = "block";
}

function openPostModal() { document.getElementById("postModal").style.display = "block"; }
function closePostModal() { document.getElementById("postModal").style.display = "none"; }

function closeViewModal() { document.getElementById("viewModal").style.display = "none"; }

// ===== EDIT MODAL FUNCTIONS =====
function openEditModal(postId) {
    const post = allPosts.find(p => p._id === postId);
    if (!post) return;

    // Only allow editing own posts
    if (post.userId !== currentUser.email) {
        showToast("You can only edit your own posts", "error");
        return;
    }

    currentEditingPostId = postId;

    // Populate form with post data
    document.getElementById("editCompany").value = post.company || "";
    document.getElementById("editRole").value = post.role || "";
    document.getElementById("editType").value = post.type || "";
    document.getElementById("editDifficulty").value = post.difficulty || "";
    document.getElementById("editOutcome").value = post.outcome || "";
    document.getElementById("editRounds").value = post.rounds || "";
    document.getElementById("editRoundDetails").value = post.roundDetails || "";
    document.getElementById("editQuestions").value = post.questions || "";
    document.getElementById("editTips").value = post.tips || "";

    // Set topics
    document.querySelectorAll("#editTopicTags .tag").forEach(tag => tag.classList.remove("active"));
    (post.topics || []).forEach(topic => {
        const tag = [...document.querySelectorAll("#editTopicTags .tag")].find(t => t.textContent === topic);
        if (tag) tag.classList.add("active");
    });

    document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditingPostId = null;
}

function getEditActiveTags() {
    return [...document.querySelectorAll("#editTopicTags .tag.active")].map(t => t.textContent);
}

async function submitEditPost() {
    if (!currentEditingPostId) {
        showToast("No post selected for editing", "error");
        return;
    }

    const postData = {
        company: document.getElementById("editCompany").value,
        role: document.getElementById("editRole").value,
        type: document.getElementById("editType").value,
        difficulty: document.getElementById("editDifficulty").value,
        outcome: document.getElementById("editOutcome").value,
        topics: getEditActiveTags(),
        rounds: document.getElementById("editRounds").value,
        roundDetails: document.getElementById("editRoundDetails").value,
        questions: document.getElementById("editQuestions").value,
        tips: document.getElementById("editTips").value
    };

    if (!postData.company || !postData.role || !postData.roundDetails) {
        return showToast("Please fill Company, Role, and Round Details", "error");
    }

    try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/posts/${currentEditingPostId}`, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(postData)
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Post updated successfully ✅", "success");
            closeEditModal();
            loadPosts();
        } else {
            showToast(data.msg || "Failed to update post", "error");
        }
    } catch (err) {
        console.error("Error updating post:", err);
        showToast("Connection error", "error");
    }
}

async function deletePost() {
    if (!currentEditingPostId) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/posts/${currentEditingPostId}`, {
            method: "DELETE",
            headers: headers
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Post deleted successfully 🗑️", "success");
            closeEditModal();
            loadPosts();
        } else {
            showToast(data.msg || "Failed to delete post", "error");
        }
    } catch (err) {
        console.error("Error deleting post:", err);
        showToast("Connection error", "error");
    }
}

// Close modals on outside click
window.onclick = function(e) {
    const modals = ["signupModal","loginModal","postModal","viewModal","editModal"];
    modals.forEach(id => {
        const m = document.getElementById(id);
        if (e.target === m) m.style.display = "none";
    });
};

// ===== TOPIC TAGS =====
function toggleTag(el) {
    el.classList.toggle("active");
}

function getActiveTags() {
    return [...document.querySelectorAll("#topicTags .tag.active")].map(t => t.textContent);
}

// ===== POST SUBMISSION =====
async function submitPost() {
    const postData = {
        company: document.getElementById("postCompany").value,
        role: document.getElementById("postRole").value,
        type: document.getElementById("postType").value,
        difficulty: document.getElementById("postDifficulty").value,
        outcome: document.getElementById("postOutcome").value,
        topics: getActiveTags(),
        rounds: document.getElementById("postRounds").value,
        roundDetails: document.getElementById("postRoundDetails").value,
        questions: document.getElementById("postQuestions").value,
        tips: document.getElementById("postTips").value,
        postedBy: currentUser.name,
        userId: currentUser.email.toLowerCase()  // Normalize to lowercase
    };

    console.log("📤 Submitting post with userId:", postData.userId, "postedBy:", postData.postedBy);

    if (!postData.company || !postData.role || !postData.roundDetails) {
        return showToast("Please fill Company, Role, and Round Details", "error");
    }

    try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/posts`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(postData)
        });

        const data = await res.json();

        if (res.ok) {
            console.log("✅ Post created successfully!");
            showToast("Posted successfully 🚀", "success");
            closePostModal();
            resetPostForm();
            loadPosts();
        } else {
            showToast(data.msg || "Failed to post", "error");
        }
    } catch (err) {
        console.error("Error posting:", err);
        showToast("Connection error", "error");
    }
}

function resetPostForm() {
    ["postCompany","postRole","postRounds","postRoundDetails","postQuestions","postTips"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    ["postType","postDifficulty","postOutcome"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });
    document.querySelectorAll("#topicTags .tag").forEach(t => t.classList.remove("active"));
}

// ===== LOAD AND RENDER POSTS =====
async function loadPosts() {
    try {
        const res = await fetch(`${API}/posts`);
        if (!res.ok) {
            console.error("Posts API error:", res.status);
            renderPosts([]);
            return;
        }
        const data = await res.json();
        allPosts = data || [];
        
        // Debug: Log all posts with their userIds
        console.log("📋 All Posts loaded:", allPosts.length);
        console.log("👤 Current User:", currentUser);
        allPosts.forEach(p => {
            console.log(`  - ${p.company} (${p.role}) by userId: "${p.userId}"`);
        });
        
        renderPosts(data);
    } catch (err) {
        console.error("Error loading posts:", err);
        renderPosts([]);
    }
}

function renderPosts(posts) {
    const grid = document.getElementById("postsGrid");
    if (!grid) {
        console.error("postsGrid element not found");
        return;
    }

    const list = posts || allPosts;

    if (!list || !list.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No experiences found</h3><p>Try adjusting your filters or search term.</p></div>`;
        return;
    }

    try {
        grid.innerHTML = list.map(post => createPostCard(post, false)).join("");
    } catch (err) {
        console.error("Error rendering posts:", err);
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error loading posts</h3></div>`;
    }
}

async function renderMyPosts() {
    try {
        if (!currentUser || !currentUser.email) {
            console.warn("⚠️ currentUser not set or email missing:", currentUser);
            const grid = document.getElementById("myPostsGrid");
            if (grid) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>Please log in</h3><p>You need to be logged in to view your posts.</p></div>`;
            return;
        }

        console.log("📥 Loading my posts for:", currentUser.email);
        const res = await fetch(`${API}/posts/my/${currentUser.email}`);
        if (!res.ok) {
            const grid = document.getElementById("myPostsGrid");
            if (grid) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>No posts yet</h3><p>Share your first interview experience!</p></div>`;
            return;
        }
        
        const myPosts = await res.json();
        const grid = document.getElementById("myPostsGrid");
        if (!grid) return;

        if (!myPosts || !myPosts.length) {
            grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>No posts yet</h3><p>Share your first interview experience!</p></div>`;
            return;
        }

        console.log("✅ Loaded", myPosts.length, "posts. Current user:", currentUser.email);
        grid.innerHTML = myPosts.map(post => createPostCard(post, true)).join("");
    } catch (err) {
        console.error("Error loading my posts:", err);
        const grid = document.getElementById("myPostsGrid");
        if (grid) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error loading posts</h3></div>`;
    }
}

function createPostCard(post, isMyPosts = false) {
    try {
        const postId = post._id || post.id;
        const outcomeClass = post.outcome?.includes("✅") ? "outcome-selected"
            : post.outcome?.includes("❌") ? "outcome-rejected" : "outcome-pending";

        const diffColor = post.difficulty === "Hard" ? "#ef4444" : post.difficulty === "Medium" ? "#f59e0b" : "#22c55e";

        const topicsHtml = (post.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join("");
        
        let dateStr = post.date || new Date(post.createdAt).toLocaleDateString();

        // Check if current user already upvoted
        const hasUpvoted = currentUser && post.upvotedBy && post.upvotedBy.includes(currentUser.email);
        const upvoteButtonStyle = hasUpvoted ? "color: #ff6b6b;" : "";

        // Check if current user is the post creator
        const isOwnPost = currentUser && post.userId && currentUser.email && 
                         post.userId.toLowerCase() === currentUser.email.toLowerCase();
        
        // Show action buttons ONLY in My Posts section and only for own posts
        const actionButtons = (isMyPosts && isOwnPost) ? `
            <div class="post-actions">
                <button class="action-btn edit-btn" onclick="openEditModal('${postId}')" title="Edit post">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deletePostQuick('${postId}')" title="Delete post">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        ` : "";

        return `
        <div class="post-card" onclick="viewPost('${postId}')">
            <div class="post-card-top">
                <div class="post-company-row">
                    <span class="company-badge">${post.company || "N/A"}</span>
                    ${post.outcome ? `<span class="outcome-badge ${outcomeClass}">${post.outcome}</span>` : ""}
                </div>
                <div class="post-role">${post.role || "N/A"}</div>
                <div class="post-meta">
                    ${post.type ? `<span><i class="fas fa-briefcase"></i> ${post.type}</span>` : ""}
                    ${post.difficulty ? `<span style="color:${diffColor}"><i class="fas fa-signal"></i> ${post.difficulty}</span>` : ""}
                    ${post.rounds ? `<span><i class="fas fa-layer-group"></i> ${post.rounds} Rounds</span>` : ""}
                    <span><i class="fas fa-calendar"></i> ${dateStr}</span>
                </div>
                <div class="post-topics">${topicsHtml}</div>
            </div>
            ${actionButtons}
            <div class="post-card-bottom">
                <span class="posted-by">by ${post.postedBy || "Anonymous"}</span>
                <button class="upvote-btn" onclick="upvote(event, '${postId}')" style="${upvoteButtonStyle}" title="${hasUpvoted ? 'Remove upvote' : 'Upvote this experience'}">
                    <i class="fas fa-arrow-up"></i> ${post.upvotes || 0}
                </button>
            </div>
        </div>`;
    } catch (err) {
        console.error("Error creating post card:", err, post);
        return "";
    }
}

// Quick delete without opening edit modal
async function deletePostQuick(postId) {
    event.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${API}/posts/${postId}`, {
            method: "DELETE",
            headers: headers
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Post deleted successfully 🗑️", "success");
            loadPosts();
        } else {
            showToast(data.msg || "Failed to delete post", "error");
        }
    } catch (err) {
        console.error("Error deleting post:", err);
        showToast("Connection error", "error");
    }
}

// ===== VIEW EXPERIENCE =====
function viewPost(id) {
    const post = allPosts.find(p => p._id === id || p.id === id);
    if (!post) {
        console.error("Post not found:", id);
        return;
    }

    try {
        const outcomeClass = post.outcome?.includes("✅") ? "outcome-selected"
            : post.outcome?.includes("❌") ? "outcome-rejected" : "outcome-pending";

        let dateStr = post.date || new Date(post.createdAt).toLocaleDateString();

        document.getElementById("viewModalContent").innerHTML = `
            <span class="close" onclick="closeViewModal()">&times;</span>
            <div class="view-company">${post.company || "N/A"}</div>
            <div class="view-role">${post.role || "N/A"}</div>
            <div class="view-badges">
                ${post.outcome ? `<span class="outcome-badge ${outcomeClass}">${post.outcome}</span>` : ""}
                ${post.difficulty ? `<span class="outcome-badge" style="background:#f1f5f9;color:#475569">${post.difficulty}</span>` : ""}
                ${post.type ? `<span class="outcome-badge" style="background:#ede9fe;color:#7c3aed">${post.type}</span>` : ""}
                ${(post.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join("")}
            </div>
            <div class="view-section">
                <h4>📋 Interview Rounds (${post.rounds || 0} total)</h4>
                <pre>${post.roundDetails || "No details provided"}</pre>
            </div>
            ${post.questions ? `<div class="view-section"><h4>❓ Questions Asked</h4><pre>${post.questions}</pre></div>` : ""}
            ${post.tips ? `<div class="view-section"><h4>💡 Preparation Tips</h4><pre>${post.tips}</pre></div>` : ""}
            <div style="color:#94a3b8;font-size:13px;margin-top:16px;">Shared by <strong>${post.postedBy || "Anonymous"}</strong> · ${dateStr}</div>
        `;
        document.getElementById("viewModal").style.display = "block";
    } catch (err) {
        console.error("Error displaying post:", err);
        showToast("Error loading post details", "error");
    }
}

// ===== UPVOTE/UNUPVOTE =====
async function upvote(e, id) {
    e.stopPropagation();
    
    if (!currentUser || !currentUser.email) {
        showToast("Please login to upvote", "error");
        return;
    }

    try {
        const res = await fetch(`${API}/posts/${id}/upvote?email=${currentUser.email}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (res.ok) {
            const message = data.upvoted ? "Upvoted successfully! 👍" : "Upvote removed";
            showToast(message, "success");
            loadPosts();
        } else {
            showToast(data.msg || "Failed to update upvote", "error");
        }
    } catch (err) {
        console.error("Error upvoting:", err);
        showToast("Error updating upvote", "error");
    }
}

// ===== FILTER POSTS =====
function filterPosts() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const company = document.getElementById("filterCompany").value;
    const role = document.getElementById("filterRole").value;
    const difficulty = document.getElementById("filterDifficulty").value;
    const topic = document.getElementById("filterTopic").value;

    const filtered = allPosts.filter(p => {
        const matchSearch = !search ||
            p.company.toLowerCase().includes(search) ||
            p.role.toLowerCase().includes(search) ||
            (p.topics || []).some(t => t.toLowerCase().includes(search)) ||
            (p.roundDetails || "").toLowerCase().includes(search);

        const matchCompany = !company || p.company === company;
        const matchRole = !role || p.role === role;
        const matchDiff = !difficulty || p.difficulty === difficulty;
        const matchTopic = !topic || (p.topics || []).includes(topic);

        return matchSearch && matchCompany && matchRole && matchDiff && matchTopic;
    });

    renderPosts(filtered);
}

// ===== TABS =====
function showTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));

    if (tabName === "explore") {
        const exploreTab = document.getElementById("exploreTab");
        if (exploreTab) exploreTab.classList.add("active-tab");
        const navTabs = document.querySelectorAll(".nav-tab");
        if (navTabs[0]) navTabs[0].classList.add("active");
    } else if (tabName === "my-posts") {
        const myPostsTab = document.getElementById("myPostsTab");
        if (myPostsTab) myPostsTab.classList.add("active-tab");
        const navTabs = document.querySelectorAll(".nav-tab");
        if (navTabs[1]) navTabs[1].classList.add("active");
        renderMyPosts();
    } else if (tabName === "profile") {
        const profileTab = document.getElementById("profileTab");
        if (profileTab) profileTab.classList.add("active-tab");
        const navTabs = document.querySelectorAll(".nav-tab");
        if (navTabs[2]) navTabs[2].classList.add("active");
        renderProfile();
    }
}

function renderProfile() {
    if (!currentUser) return;
    
    // Get user's posts
    const userPosts = allPosts.filter(p => p.userId === currentUser.email);
    const totalUpvotes = userPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
    
    // Update profile fields
    document.getElementById("profileUsername").textContent = currentUser.name || "N/A";
    document.getElementById("profileEmail").textContent = currentUser.email || "N/A";
    document.getElementById("profilePostCount").textContent = userPosts.length;
    document.getElementById("profileUpvotes").textContent = totalUpvotes;
    document.getElementById("profileExperiences").textContent = userPosts.length;
}

// ===== TOAST =====
function showToast(msg, type = "") {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast " + type;
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => t.classList.remove("show"), 3500);
}

