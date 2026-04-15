<<<<<<< HEAD
// ===== STATE =====
let currentUser = null;
let allPosts = getSamplePosts();

// ===== SAMPLE DATA =====
function getSamplePosts() {
    return [
        {
            id: 1,
            company: "Google",
            role: "Software Engineer",
            type: "Off-Campus",
            difficulty: "Hard",
            outcome: "Selected ✅",
            topics: ["DSA", "System Design", "HR"],
            rounds: 5,
            roundDetails: "Round 1 (Online Test): 2 coding problems on arrays and trees, 60 mins.\nRound 2 (Technical 1): Deep dive into DSA - arrays, graphs, dynamic programming.\nRound 3 (Technical 2): System Design - design a URL shortener at scale.\nRound 4 (Behavioral): Leadership principles, STAR method questions.\nRound 5 (HR): Offer discussion, joining date.",
            questions: "1. Find the longest palindromic substring\n2. Design a distributed cache\n3. Tell me about a time you disagreed with your manager",
            tips: "Focus heavily on graph algorithms and dynamic programming. Practice system design on Grokking. Know your resume deeply.",
            postedBy: "Rahul K.",
            upvotes: 142,
            date: "Mar 2026",
            userId: "sample"
        },
        {
            id: 2,
            company: "Amazon",
            role: "SDE-1",
            type: "On-Campus",
            difficulty: "Medium",
            outcome: "Selected ✅",
            topics: ["DSA", "OOP", "HR"],
            rounds: 4,
            roundDetails: "Round 1 (Online Coding): 2 LeetCode Medium problems on arrays and strings.\nRound 2 (Technical): Solved a tree problem on whiteboard, discussed OOP concepts.\nRound 3 (Bar Raiser): Mix of DSA and behavioral questions using Leadership Principles.\nRound 4 (HR): Standard HR questions, CTC discussion.",
            questions: "1. Two Sum variants\n2. LRU Cache implementation\n3. Describe a time you took ownership",
            tips: "Amazon focuses a lot on Leadership Principles (LP). Prepare STAR stories for each LP. LeetCode medium DSA is key.",
            postedBy: "Priya M.",
            upvotes: 98,
            date: "Feb 2026",
            userId: "sample"
        },
        {
            id: 3,
            company: "Microsoft",
            role: "Software Engineer II",
            type: "Referral",
            difficulty: "Medium",
            outcome: "Pending ⏳",
            topics: ["DSA", "System Design", "DBMS"],
            rounds: 3,
            roundDetails: "Round 1 (Online Coding): 3 problems - 1 easy, 2 medium. 90 mins.\nRound 2 (Technical + Design): Solved graph problem, then designed a notification system.\nRound 3 (As-Appropriate): Senior engineer asked deep technical questions about concurrency and DBMS.",
            questions: "1. Serialize and deserialize binary tree\n2. Design a notification system\n3. Explain ACID properties with examples",
            tips: "Practice concurrency problems. Know your DBMS fundamentals - transactions, indexing. Microsoft values clean code.",
            postedBy: "Arjun S.",
            upvotes: 67,
            date: "Jan 2026",
            userId: "sample"
        },
        {
            id: 4,
            company: "Flipkart",
            role: "SDE-1",
            type: "On-Campus",
            difficulty: "Easy",
            outcome: "Selected ✅",
            topics: ["DSA", "OOP"],
            rounds: 3,
            roundDetails: "Round 1 (Coding Test): 2 problems on arrays and linked lists.\nRound 2 (Technical): Discussion on OOP concepts, asked to design a parking lot.\nRound 3 (HR + Managerial): Situational questions, project discussion.",
            questions: "1. Merge two sorted arrays\n2. Design a parking lot system\n3. Explain polymorphism with a real-world example",
            tips: "Focus on basic DSA and OOP. Low pressure interview. Be confident and clear in communication.",
            postedBy: "Sneha R.",
            upvotes: 45,
            date: "Dec 2025",
            userId: "sample"
        },
        {
            id: 5,
            company: "TCS",
            role: "System Engineer",
            type: "On-Campus",
            difficulty: "Easy",
            outcome: "Selected ✅",
            topics: ["Aptitude", "HR", "OOP"],
            rounds: 3,
            roundDetails: "Round 1 (NQT): Aptitude, reasoning, verbal ability, coding section.\nRound 2 (Technical): Basic questions on C, Java, OOPS, DBMS.\nRound 3 (HR): Tell me about yourself, strengths, weakness, why TCS.",
            questions: "1. What is polymorphism?\n2. Explain normalization\n3. Write a program to check palindrome",
            tips: "Practice TCS NQT pattern. Know basic OOPS and DBMS. Communication matters a lot in HR round.",
            postedBy: "Vikram N.",
            upvotes: 33,
            date: "Nov 2025",
            userId: "sample"
        },
        {
            id: 6,
            company: "Infosys",
            role: "Systems Engineer",
            type: "Off-Campus",
            difficulty: "Easy",
            outcome: "Rejected ❌",
            topics: ["Aptitude", "HR"],
            rounds: 2,
            roundDetails: "Round 1 (InfyTQ + Written Test): Online aptitude and reasoning test. Coding section with 2 basic problems.\nRound 2 (HR): Lost here - couldn't clearly explain my projects. Communication was the issue.",
            questions: "1. Explain your final year project\n2. Why Infosys?\n3. Where do you see yourself in 5 years?",
            tips: "Prepare your projects very well. Practice mock HR interviews. Be clear and structured in communication.",
            postedBy: "Divya P.",
            upvotes: 28,
            date: "Oct 2025",
            userId: "sample"
        }
    ];
}

// ===== AUTH FUNCTIONS =====
function handleSignup() {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!name || !email || !password) return showToast("Please fill all fields", "error");
    if (password !== confirm) return showToast("Passwords don't match", "error");
    if (password.length < 6) return showToast("Password must be at least 6 characters", "error");

    currentUser = { name, email };
    closeModal();
    enterDashboard();
    showToast(`Welcome, ${name}! 🎉`, "success");
}

function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) return showToast("Please fill all fields", "error");

    const name = email.split("@")[0];
    currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
    closeLogin();
    enterDashboard();
    showToast(`Welcome back, ${currentUser.name}! 👋`, "success");
}

function handleGoogleLogin() {
    currentUser = { name: "Google User", email: "user@gmail.com" };
    closeLogin();
    enterDashboard();
    showToast("Logged in with Google 🎉", "success");
}

function logout() {
    currentUser = null;
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("landingPage").style.display = "block";
    showToast("Logged out successfully");
}

function enterDashboard() {
    document.getElementById("landingPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("userGreeting").textContent = `Hi, ${currentUser.name}`;
    renderPosts();
    renderMyPosts();
    showTab("explore", document.querySelector(".nav-tab"));
}

// ===== MODAL FUNCTIONS =====
function openModal() { document.getElementById("signupModal").style.display = "block"; }
function closeModal() { document.getElementById("signupModal").style.display = "none"; }

function openLogin() { document.getElementById("loginModal").style.display = "block"; }
=======
const API = "http://localhost:5000/api";
// ===== STATE =====
let currentUser = null;
let allPosts = []; // Initialize as empty array

// // ===== SAMPLE DATA =====
// function getSamplePosts() {
//     return [
//         {
//             id: 1,
//             company: "Google",
//             role: "Software Engineer",
//             type: "Off-Campus",
//             difficulty: "Hard",
//             outcome: "Selected ✅",
//             topics: ["DSA", "System Design", "HR"],
//             rounds: 5,
//             roundDetails: "Round 1 (Online Test): 2 coding problems on arrays and trees, 60 mins.\nRound 2 (Technical 1): Deep dive into DSA - arrays, graphs, dynamic programming.\nRound 3 (Technical 2): System Design - design a URL shortener at scale.\nRound 4 (Behavioral): Leadership principles, STAR method questions.\nRound 5 (HR): Offer discussion, joining date.",
//             questions: "1. Find the longest palindromic substring\n2. Design a distributed cache\n3. Tell me about a time you disagreed with your manager",
//             tips: "Focus heavily on graph algorithms and dynamic programming. Practice system design on Grokking. Know your resume deeply.",
//             postedBy: "Rahul K.",
//             upvotes: 142,
//             date: "Mar 2026",
//             userId: "sample"
//         },
//         {
//             id: 2,
//             company: "Amazon",
//             role: "SDE-1",
//             type: "On-Campus",
//             difficulty: "Medium",
//             outcome: "Selected ✅",
//             topics: ["DSA", "OOP", "HR"],
//             rounds: 4,
//             roundDetails: "Round 1 (Online Coding): 2 LeetCode Medium problems on arrays and strings.\nRound 2 (Technical): Solved a tree problem on whiteboard, discussed OOP concepts.\nRound 3 (Bar Raiser): Mix of DSA and behavioral questions using Leadership Principles.\nRound 4 (HR): Standard HR questions, CTC discussion.",
//             questions: "1. Two Sum variants\n2. LRU Cache implementation\n3. Describe a time you took ownership",
//             tips: "Amazon focuses a lot on Leadership Principles (LP). Prepare STAR stories for each LP. LeetCode medium DSA is key.",
//             postedBy: "Priya M.",
//             upvotes: 98,
//             date: "Feb 2026",
//             userId: "sample"
//         },
//         {
//             id: 3,
//             company: "Microsoft",
//             role: "Software Engineer II",
//             type: "Referral",
//             difficulty: "Medium",
//             outcome: "Pending ⏳",
//             topics: ["DSA", "System Design", "DBMS"],
//             rounds: 3,
//             roundDetails: "Round 1 (Online Coding): 3 problems - 1 easy, 2 medium. 90 mins.\nRound 2 (Technical + Design): Solved graph problem, then designed a notification system.\nRound 3 (As-Appropriate): Senior engineer asked deep technical questions about concurrency and DBMS.",
//             questions: "1. Serialize and deserialize binary tree\n2. Design a notification system\n3. Explain ACID properties with examples",
//             tips: "Practice concurrency problems. Know your DBMS fundamentals - transactions, indexing. Microsoft values clean code.",
//             postedBy: "Arjun S.",
//             upvotes: 67,
//             date: "Jan 2026",
//             userId: "sample"
//         },
//         {
//             id: 4,
//             company: "Flipkart",
//             role: "SDE-1",
//             type: "On-Campus",
//             difficulty: "Easy",
//             outcome: "Selected ✅",
//             topics: ["DSA", "OOP"],
//             rounds: 3,
//             roundDetails: "Round 1 (Coding Test): 2 problems on arrays and linked lists.\nRound 2 (Technical): Discussion on OOP concepts, asked to design a parking lot.\nRound 3 (HR + Managerial): Situational questions, project discussion.",
//             questions: "1. Merge two sorted arrays\n2. Design a parking lot system\n3. Explain polymorphism with a real-world example",
//             tips: "Focus on basic DSA and OOP. Low pressure interview. Be confident and clear in communication.",
//             postedBy: "Sneha R.",
//             upvotes: 45,
//             date: "Dec 2025",
//             userId: "sample"
//         },
//         {
//             id: 5,
//             company: "TCS",
//             role: "System Engineer",
//             type: "On-Campus",
//             difficulty: "Easy",
//             outcome: "Selected ✅",
//             topics: ["Aptitude", "HR", "OOP"],
//             rounds: 3,
//             roundDetails: "Round 1 (NQT): Aptitude, reasoning, verbal ability, coding section.\nRound 2 (Technical): Basic questions on C, Java, OOPS, DBMS.\nRound 3 (HR): Tell me about yourself, strengths, weakness, why TCS.",
//             questions: "1. What is polymorphism?\n2. Explain normalization\n3. Write a program to check palindrome",
//             tips: "Practice TCS NQT pattern. Know basic OOPS and DBMS. Communication matters a lot in HR round.",
//             postedBy: "Vikram N.",
//             upvotes: 33,
//             date: "Nov 2025",
//             userId: "sample"
//         },
//         {
//             id: 6,
//             company: "Infosys",
//             role: "Systems Engineer",
//             type: "Off-Campus",
//             difficulty: "Easy",
//             outcome: "Rejected ❌",
//             topics: ["Aptitude", "HR"],
//             rounds: 2,
//             roundDetails: "Round 1 (InfyTQ + Written Test): Online aptitude and reasoning test. Coding section with 2 basic problems.\nRound 2 (HR): Lost here - couldn't clearly explain my projects. Communication was the issue.",
//             questions: "1. Explain your final year project\n2. Why Infosys?\n3. Where do you see yourself in 5 years?",
//             tips: "Prepare your projects very well. Practice mock HR interviews. Be clear and structured in communication.",
//             postedBy: "Divya P.",
//             upvotes: 28,
//             date: "Oct 2025",
//             userId: "sample"
//         }
//     ];
// }

// ===== AUTH FUNCTIONS =====
// function handleSignup() {
//     const name = document.getElementById("signupName").value.trim();
//     const email = document.getElementById("signupEmail").value.trim();
//     const password = document.getElementById("signupPassword").value;
//     const confirm = document.getElementById("signupConfirm").value;

//     if (!name || !email || !password) return showToast("Please fill all fields", "error");
//     if (password !== confirm) return showToast("Passwords don't match", "error");
//     if (password.length < 6) return showToast("Password must be at least 6 characters", "error");

//     currentUser = { name, email };
//     closeModal();
//     enterDashboard();
//     showToast(`Welcome, ${name}! 🎉`, "success");
// }

// function handleLogin() {
//     const email = document.getElementById("loginEmail").value.trim();
//     const password = document.getElementById("loginPassword").value;

//     if (!email || !password) return showToast("Please fill all fields", "error");

//     const name = email.split("@")[0];
//     currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
//     closeLogin();
//     enterDashboard();
//     showToast(`Welcome back, ${currentUser.name}! 👋`, "success");
// }

// function handleGoogleLogin() {
//     currentUser = { name: "Google User", email: "user@gmail.com" };
//     closeLogin();
//     enterDashboard();
//     showToast("Logged in with Google 🎉", "success");
// }


// const API = "http://localhost:5000/api";

async function handleSignup() {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    if (!name || !email || !password || !confirm) {
        return showToast("Please fill all fields", "error");
    }
    
    if (password !== confirm) {
        return showToast("Passwords don't match", "error");
    }

    const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
        // Auto-login after successful signup
        localStorage.setItem("token", data.token);
        currentUser = data.user;
        closeModal();
        showToast(`Welcome, ${data.user.name}! 🎉`, "success");
        enterDashboard();
    } else {
        showToast(data.msg || "Error", "error");
    }
}


async function handleLogin() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        return showToast("Please fill all fields", "error");
    }

    const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.token);
        currentUser = data.user;
        closeLogin();
        showToast(`Welcome back, ${data.user.name}! 👋`, "success");
        enterDashboard();
    } else {
        showToast(data.msg || "Login failed", "error");
    }
}

function handleGoogleLogin() {
    window.location.href = "http://localhost:5000/api/auth/google";
}

// On page load — restore session
window.onload = () => {
  // Handle Google OAuth redirect
  const params = new URLSearchParams(window.location.search);
  if (params.get("token")) {
    localStorage.setItem("token", params.get("token"));
    history.replaceState({}, "", "/");
  }

  const token = localStorage.getItem("token");
  
  if (token) {
    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUser = { name: payload.name, email: payload.email };
      document.getElementById("landingPage").style.display = "none";
      enterDashboard();
    } catch (err) {
      console.log("Token decode error:", err);
      localStorage.removeItem("token");
    }
  }
};

async function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  localStorage.removeItem("userEmail");
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
        showTab("explore", document.querySelector(".nav-tab"));
        loadPosts(); // Load posts after showing dashboard
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

function openForgot() {
    document.getElementById("loginModal").style.display = "none";
    document.getElementById("forgotModal").style.display = "block";
}
function closeForgot() { document.getElementById("forgotModal").style.display = "none"; }

function backToLogin() {
    document.getElementById("forgotModal").style.display = "none";

    clearLoginForm();

    document.getElementById("loginModal").style.display = "block";
}

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

// Close modals on outside click
window.onclick = function(e) {
    const modals = ["signupModal","loginModal","forgotModal","postModal","viewModal"];
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

function submitPost() {
    const company = document.getElementById("postCompany").value.trim();
    const role = document.getElementById("postRole").value.trim();
    const type = document.getElementById("postType").value;
    const difficulty = document.getElementById("postDifficulty").value;
    const outcome = document.getElementById("postOutcome").value;
    const rounds = document.getElementById("postRounds").value;
    const roundDetails = document.getElementById("postRoundDetails").value.trim();
    const questions = document.getElementById("postQuestions").value.trim();
    const tips = document.getElementById("postTips").value.trim();
    const topics = getActiveTags();

    if (!company || !role || !roundDetails) {
        return showToast("Please fill Company, Role, and Round Details", "error");
    }

    const newPost = {
        id: Date.now(),
        company, role, type, difficulty, outcome,
        topics: topics.length ? topics : ["General"],
        rounds: parseInt(rounds) || 1,
        roundDetails, questions, tips,
        postedBy: currentUser.name,
        upvotes: 0,
        date: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        userId: currentUser.email
    };

    allPosts.unshift(newPost);
    closePostModal();
    resetPostForm();
    renderPosts();
    renderMyPosts();
    showToast("Experience shared successfully! 🚀", "success");
    showTab("explore", document.querySelector(".nav-tab"));

async function submitPost() {
    const postData = {
        company: postCompany.value,
        role: postRole.value,
        type: postType.value,
        difficulty: postDifficulty.value,
        outcome: postOutcome.value,
        topics: getActiveTags(),
        rounds: postRounds.value,
        roundDetails: postRoundDetails.value,
        questions: postQuestions.value,
        tips: postTips.value,
        postedBy: currentUser.name,
        userId: currentUser.email
    };

    const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
    });

    if (res.ok) {
        showToast("Posted successfully 🚀", "success");
        closePostModal();
        loadPosts();   // 🔥 important
    }
}

async function loadPosts() {
    try {
        const res = await fetch(`${API}/posts`);
        if (!res.ok) {
            console.error("Posts API error:", res.status);
            renderPosts([]);
            return;
        }
        const data = await res.json();
        allPosts = data || []; // Store in allPosts
        renderPosts(data);
    } catch (err) {
        console.error("Error loading posts:", err);
        renderPosts([]); // Show empty state on error
    }

}

function resetPostForm() {
    ["postCompany","postRole","postRounds","postRoundDetails","postQuestions","postTips"].forEach(id => {
        document.getElementById(id).value = "";
    });
    ["postType","postDifficulty","postOutcome"].forEach(id => {
        document.getElementById(id).selectedIndex = 0;
    });
    document.querySelectorAll("#topicTags .tag").forEach(t => t.classList.remove("active"));
}

// ===== RENDER POSTS =====
function renderPosts(posts) {
    const grid = document.getElementById("postsGrid");

    const list = posts || allPosts;

    if (!list.length) {

    if (!grid) {
        console.error("postsGrid element not found");
        return;
    }
    
    const list = posts || allPosts;

    if (!list || !list.length) {

        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>No experiences found</h3><p>Try adjusting your filters or search term.</p></div>`;
        return;
    }


    grid.innerHTML = list.map(post => createPostCard(post)).join("");
}

function renderMyPosts() {
    const grid = document.getElementById("myPostsGrid");
    const myPosts = allPosts.filter(p => p.userId === currentUser?.email);

    if (!myPosts.length) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div><h3>You haven't shared yet</h3><p>Share your interview experience and help others in their journey!</p><button class="btn-primary" onclick="openPostModal()">Share Your First Experience</button></div>`;
        return;
    }
    grid.innerHTML = myPosts.map(post => createPostCard(post, true)).join("");
}

function createPostCard(post, isOwn = false) {
    const outcomeClass = post.outcome?.includes("✅") ? "outcome-selected"
        : post.outcome?.includes("❌") ? "outcome-rejected" : "outcome-pending";

    const diffColor = post.difficulty === "Hard" ? "#ef4444" : post.difficulty === "Medium" ? "#f59e0b" : "#22c55e";

    const topicsHtml = (post.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join("");

    return `
    <div class="post-card" onclick="viewPost(${post.id})">
        <div class="post-card-top">
            <div class="post-company-row">
                <span class="company-badge">${post.company}</span>
                ${post.outcome ? `<span class="outcome-badge ${outcomeClass}">${post.outcome}</span>` : ""}
            </div>
            <div class="post-role">${post.role}</div>
            <div class="post-meta">
                ${post.type ? `<span><i class="fas fa-briefcase"></i> ${post.type}</span>` : ""}
                ${post.difficulty ? `<span style="color:${diffColor}"><i class="fas fa-signal"></i> ${post.difficulty}</span>` : ""}
                ${post.rounds ? `<span><i class="fas fa-layer-group"></i> ${post.rounds} Rounds</span>` : ""}
                <span><i class="fas fa-calendar"></i> ${post.date}</span>
            </div>
            <div class="post-topics">${topicsHtml}</div>
        </div>
        <div class="post-card-bottom">
            <span class="posted-by">by ${post.postedBy}</span>
            <button class="upvote-btn" onclick="upvote(event, ${post.id})">
                <i class="fas fa-arrow-up"></i> ${post.upvotes}
            </button>
        </div>
    </div>`;

    try {
        grid.innerHTML = list.map(post => createPostCard(post)).join("");
    } catch (err) {
        console.error("Error rendering posts:", err);
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error loading posts</h3></div>`;
    }
}

async function renderMyPosts() {
    try {
        const res = await fetch(`${API}/posts/my/${currentUser.email}`);
        if (!res.ok) {
            console.error("My posts API error:", res.status);
            const grid = document.getElementById("myPostsGrid");
            if (grid) grid.innerHTML = `<div class="empty-state">No posts yet</div>`;
            return;
        }
        
        const myPosts = await res.json();
        const grid = document.getElementById("myPostsGrid");
        if (!grid) return;

        if (!myPosts || !myPosts.length) {
            grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3><p>Share your first interview experience!</p></div>`;
            return;
        }

        grid.innerHTML = myPosts.map(post => createPostCard(post)).join("");
    } catch (err) {
        console.error("Error loading my posts:", err);
        const grid = document.getElementById("myPostsGrid");
        if (grid) grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Error loading posts</h3></div>`;
    }
}

function createPostCard(post, isOwn = false) {
    try {
        const postId = post._id || post.id;
        const outcomeClass = post.outcome?.includes("✅") ? "outcome-selected"
            : post.outcome?.includes("❌") ? "outcome-rejected" : "outcome-pending";

        const diffColor = post.difficulty === "Hard" ? "#ef4444" : post.difficulty === "Medium" ? "#f59e0b" : "#22c55e";

        const topicsHtml = (post.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join("");
        
        // Format date
        let dateStr = post.date || new Date(post.createdAt).toLocaleDateString();

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
            <div class="post-card-bottom">
                <span class="posted-by">by ${post.postedBy || "Anonymous"}</span>
                <button class="upvote-btn" onclick="upvote(event, '${postId}')">
                    <i class="fas fa-arrow-up"></i> ${post.upvotes || 0}
                </button>
            </div>
        </div>`;
    } catch (err) {
        console.error("Error creating post card:", err, post);
        return "";
    }

}

// ===== VIEW EXPERIENCE =====
function viewPost(id) {

    const post = allPosts.find(p => p.id === id);
    if (!post) return;

    const outcomeClass = post.outcome?.includes("✅") ? "outcome-selected"
        : post.outcome?.includes("❌") ? "outcome-rejected" : "outcome-pending";

    document.getElementById("viewModalContent").innerHTML = `
        <span class="close" onclick="closeViewModal()">&times;</span>
        <div class="view-company">${post.company}</div>
        <div class="view-role">${post.role}</div>
        <div class="view-badges">
            ${post.outcome ? `<span class="outcome-badge ${outcomeClass}">${post.outcome}</span>` : ""}
            ${post.difficulty ? `<span class="outcome-badge" style="background:#f1f5f9;color:#475569">${post.difficulty}</span>` : ""}
            ${post.type ? `<span class="outcome-badge" style="background:#ede9fe;color:#7c3aed">${post.type}</span>` : ""}
            ${(post.topics || []).map(t => `<span class="topic-chip">${t}</span>`).join("")}
        </div>
        <div class="view-section">
            <h4>📋 Interview Rounds (${post.rounds} total)</h4>
            <pre>${post.roundDetails}</pre>
        </div>
        ${post.questions ? `<div class="view-section"><h4>❓ Questions Asked</h4><pre>${post.questions}</pre></div>` : ""}
        ${post.tips ? `<div class="view-section"><h4>💡 Preparation Tips</h4><pre>${post.tips}</pre></div>` : ""}
        <div style="color:#94a3b8;font-size:13px;margin-top:16px;">Shared by <strong>${post.postedBy}</strong> · ${post.date}</div>
    `;
    document.getElementById("viewModal").style.display = "block";
}

// ===== UPVOTE =====
function upvote(e, id) {
    e.stopPropagation();
    const post = allPosts.find(p => p.id === id);
    if (!post) return;
    const btn = e.currentTarget;
    if (btn.classList.contains("voted")) {
        post.upvotes--;
        btn.classList.remove("voted");
    } else {
        post.upvotes++;
        btn.classList.add("voted");
    }
    btn.innerHTML = `<i class="fas fa-arrow-up"></i> ${post.upvotes}`;
}


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

// // ===== UPVOTE =====
// function upvote(e, id) {
//     e.stopPropagation();
//     const post = allPosts.find(p => p.id === id);
//     if (!post) return;
//     const btn = e.currentTarget;
//     if (btn.classList.contains("voted")) {
//         post.upvotes--;
//         btn.classList.remove("voted");
//     } else {
//         post.upvotes++;
//         btn.classList.add("voted");
//     }
//     btn.innerHTML = `<i class="fas fa-arrow-up"></i> ${post.upvotes}`;
// }

async function upvote(e, id) {
    e.stopPropagation();
    try {
        const res = await fetch(`${API}/posts/${id}/upvote`, {
            method: "PUT"
        });

        if (res.ok) {
            loadPosts();
        } else {
            console.error("Upvote failed:", res.status);
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
function showTab(tabName, btn) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));


    document.getElementById(tabName === "explore" ? "exploreTab" : "myPostsTab").classList.add("active-tab");

    if (tabName === "explore") {
        document.getElementById("exploreTab").classList.add("active-tab");
    } else {
        document.getElementById("myPostsTab").classList.add("active-tab");
        renderMyPosts(); // Load my posts when tab is switched
    }
    

    if (btn) btn.classList.add("active");
}

// ===== TOAST =====
function showToast(msg, type = "") {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast " + type;
    setTimeout(() => t.classList.add("show"), 10);
    setTimeout(() => t.classList.remove("show"), 3500);

}

}

