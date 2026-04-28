const API = "http://localhost:5000/api";

// ===== AUTOCOMPLETE CONSTANTS (MUST BE AT TOP) =====
const PREDEFINED_COMPANIES = [
    "Google",
    "Amazon",
    "Microsoft",
    "Apple",
    "Meta",
    "Netflix",
    "Adobe",
    "Oracle",
    "Salesforce",
    "IBM",
    "TCS",
    "Infosys",
    "Wipro",
    "Accenture",
    "Deloitte",
    "Capgemini",
    "Cognizant",
    "HCL",
    "Zoho",
    "Flipkart",
    "Swiggy",
    "Zomato",
    "PhonePe",
    "Paytm",
    "Uber",
    "Ola",
    "Barclays"
];

const PREDEFINED_ROLES = [
    "Software Engineer",
    "SDE",
    "SDE Intern",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Engineer",
    "Business Analyst",
    "QA Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Machine Learning Engineer",
    "AI Engineer",
    "Product Manager",
    "UI/UX Designer",
    "Support Engineer",
    "System Engineer",
    "Cybersecurity Analyst"
];

// ===== STATE =====
let currentUser = null;
let allPosts = [];
let currentTab = "explore";
let currentEditingPostId = null;
let currentViewMode = "listing";
let currentDetailsPostId = null;
let currentListingTab = "explore";
let currentListingScrollY = 0;

const SHARE_AUTOCOMPLETE_STATE = {
    shareCompany: { activeIndex: -1 },
    shareRole: { activeIndex: -1 }
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatExperienceDate(post) {
    const sourceDate = post?.date || post?.createdAt;
    if (!sourceDate) return "Recently";

    const parsedDate = new Date(sourceDate);
    if (Number.isNaN(parsedDate.getTime())) return "Recently";

    return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function getCompanyInitials(company) {
    if (!company) return "IH";
    return company
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function getOutcomeClass(outcome) {
    if (outcome?.includes("✅")) return "outcome-selected";
    if (outcome?.includes("❌")) return "outcome-rejected";
    return "outcome-pending";
}

function getSimilarityScore(basePost, candidatePost) {
    let score = 0;

    if (!basePost || !candidatePost || basePost._id === candidatePost._id) {
        return -1;
    }

    const baseCompany = (basePost.company || "").toLowerCase();
    const candidateCompany = (candidatePost.company || "").toLowerCase();
    const baseRole = (basePost.role || "").toLowerCase();
    const candidateRole = (candidatePost.role || "").toLowerCase();

    if (baseCompany && candidateCompany && baseCompany === candidateCompany) score += 6;
    if (baseRole && candidateRole && baseRole === candidateRole) score += 4;
    if (baseRole && candidateRole && (baseRole.includes(candidateRole) || candidateRole.includes(baseRole))) score += 2;

    const baseTopics = new Set((basePost.topics || []).map(topic => topic.toLowerCase()));
    (candidatePost.topics || []).forEach(topic => {
        if (baseTopics.has(topic.toLowerCase())) score += 2;
    });

    if (basePost.difficulty && candidatePost.difficulty && basePost.difficulty === candidatePost.difficulty) score += 1;
    if (basePost.type && candidatePost.type && basePost.type === candidatePost.type) score += 1;

    return score;
}

function renderCompactTopicChips(topics = [], maxVisible = 4) {
    const visibleTopics = (topics || []).slice(0, maxVisible);
    const remainingCount = Math.max((topics || []).length - visibleTopics.length, 0);
    const topicHtml = visibleTopics.map(topic => `<span class="topic-chip">${escapeHtml(topic)}</span>`).join("");
    const moreHtml = remainingCount > 0 ? `<span class="topic-chip topic-chip-more">+${remainingCount} more</span>` : "";
    return `${topicHtml}${moreHtml}`;
}

function setActiveListingView(tabName) {
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));

    const tab = document.getElementById(tabName === "my-posts" ? "myPostsTab" : tabName === "profile" ? "profileTab" : "exploreTab");
    if (tab) tab.classList.add("active-tab");

    const navTabs = document.querySelectorAll(".nav-tab");
    if (tabName === "explore" && navTabs[0]) navTabs[0].classList.add("active");
    if (tabName === "my-posts" && navTabs[1]) navTabs[1].classList.add("active");
    if (tabName === "profile" && navTabs[2]) navTabs[2].classList.add("active");
}

function renderExperienceRecommendations(basePost) {
    const list = document.getElementById("recommendationsList");
    if (!list) return;

    const recommendations = (allPosts || [])
        .map(post => ({ post, score: getSimilarityScore(basePost, post) }))
        .filter(item => item.score >= 0)
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const upvotesA = a.post.upvotes || 0;
            const upvotesB = b.post.upvotes || 0;
            if (upvotesB !== upvotesA) return upvotesB - upvotesA;
            const dateA = new Date(a.post.createdAt || 0).getTime();
            const dateB = new Date(b.post.createdAt || 0).getTime();
            return dateB - dateA;
        })
        .slice(0, 4);

    if (!recommendations.length) {
        list.innerHTML = `<div class="recommendation-empty">No similar experiences yet.</div>`;
        return;
    }

    list.innerHTML = recommendations.map(({ post }) => {
        const outcomeClass = getOutcomeClass(post.outcome);
        return `
            <button class="recommendation-card-item" onclick="viewPost('${post._id || post.id}')">
                <div class="recommendation-card-head">
                    <span class="recommendation-company">${post.company || "N/A"}</span>
                    <span class="outcome-badge ${outcomeClass}">${post.outcome || "Pending"}</span>
                </div>
                <div class="recommendation-role">${post.role || "N/A"}</div>
                <div class="recommendation-meta">${post.difficulty || "Medium"} • ${post.rounds || "-"} rounds</div>
            </button>
        `;
    }).join("");
}

function renderExperienceDetails(post) {
    if (!post) return;

    document.getElementById("detailsCompanyMark").textContent = getCompanyInitials(post.company);
    document.getElementById("detailsCompany").textContent = post.company || "N/A";
    document.getElementById("detailsRole").textContent = post.role || "N/A";
    document.getElementById("detailsType").textContent = post.type || "N/A";
    document.getElementById("detailsDifficulty").textContent = post.difficulty || "N/A";
    document.getElementById("detailsRounds").textContent = post.rounds || "N/A";
    document.getElementById("detailsPostedBy").textContent = post.postedBy || "Anonymous";
    document.getElementById("detailsOutcome").textContent = post.outcome || "Pending";
    document.getElementById("detailsOutcome").className = `outcome-badge ${getOutcomeClass(post.outcome)}`;
    document.getElementById("detailsDate").textContent = formatExperienceDate(post);
    document.getElementById("detailsUpvotesCount").textContent = post.upvotes || 0;

    document.getElementById("detailsRoundDetails").textContent = post.roundDetails || "-";
    document.getElementById("detailsTips").textContent = post.tips || "-";

    const topicsContainer = document.getElementById("detailsTopics");
    if (topicsContainer) {
        topicsContainer.innerHTML = (post.topics || []).length
            ? (post.topics || []).map(topic => `<span class="topic-chip">${topic}</span>`).join("")
            : `<span class="recommendation-empty">No topics listed.</span>`;
    }

    const resourcesContainer = document.getElementById("detailsResources");
    if (resourcesContainer) {
        resourcesContainer.innerHTML = post.resources && post.resources.trim()
            ? escapeHtml(post.resources).replace(/\n/g, "<br>")
            : "-";
    }

    renderExperienceRecommendations(post);
}

function openExperienceDetails(postId) {
    const post = allPosts.find(p => (p._id || p.id) === postId);
    if (!post) return;

    currentDetailsPostId = postId;
    currentListingTab = currentTab || "explore";
    currentListingScrollY = window.scrollY || 0;
    currentViewMode = "details";

    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.getElementById("experienceDetailsPage")?.classList.add("active-tab");
    renderExperienceDetails(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function backToListing() {
    currentViewMode = "listing";
    document.getElementById("experienceDetailsPage")?.classList.remove("active-tab");
    setActiveListingView(currentListingTab);

    window.scrollTo({ top: currentListingScrollY || 0, behavior: "smooth" });
}

function closeShareAutocomplete(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.innerHTML = "";
        dropdown.style.display = "none";
    }

    if (inputId && SHARE_AUTOCOMPLETE_STATE[inputId]) {
        SHARE_AUTOCOMPLETE_STATE[inputId].activeIndex = -1;
    }
}

function updateShareAutocompleteActive(dropdownId, activeIndex) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const items = Array.from(dropdown.querySelectorAll(".autocomplete-item"));
    items.forEach((item, index) => {
        item.classList.toggle("active", index === activeIndex);
        if (index === activeIndex) {
            item.scrollIntoView({ block: "nearest" });
        }
    });
}

function filterShareAutocomplete(inputId, dropdownId, sourceList, showOnEmpty = false) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) {
        return;
    }

    const searchTerm = input.value.toLowerCase().trim();
    const matches = searchTerm
        ? sourceList.filter(item => item.toLowerCase().includes(searchTerm))
        : (showOnEmpty ? sourceList.slice() : []);

    SHARE_AUTOCOMPLETE_STATE[inputId] = {
        activeIndex: -1,
        items: matches,
        dropdownId
    };

    if (!searchTerm && !showOnEmpty) {
        closeShareAutocomplete(dropdownId, inputId);
        return;
    }

    if (!matches.length) {
        dropdown.innerHTML = '<div class="autocomplete-empty">No matches found</div>';
        dropdown.style.display = "block";
        return;
    }

    dropdown.innerHTML = matches.map((item, index) =>
        `<div class="autocomplete-item" data-value="${escapeHtml(item)}" data-index="${index}" onmousedown="selectShareAutocomplete(event, '${inputId}', '${dropdownId}', this)">${escapeHtml(item)}</div>`
    ).join("");
    dropdown.style.display = "block";
}

function filterShareCompanyAutocomplete(inputId, dropdownId, showOnEmpty = false) {
    filterShareAutocomplete(inputId, dropdownId, PREDEFINED_COMPANIES, showOnEmpty);
}

function filterShareRoleAutocomplete(inputId, dropdownId, showOnEmpty = false) {
    filterShareAutocomplete(inputId, dropdownId, PREDEFINED_ROLES, showOnEmpty);
}

function selectShareAutocomplete(event, inputId, dropdownId, element) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const input = document.getElementById(inputId);
    if (input) {
        input.value = element.getAttribute("data-value") || element.textContent.trim();
    }
    closeShareAutocomplete(dropdownId, inputId);
}

function handleShareAutocompleteKeydown(event, inputId, dropdownId) {
    const state = SHARE_AUTOCOMPLETE_STATE[inputId];
    const dropdown = document.getElementById(dropdownId);
    if (!state || !dropdown) {
        return;
    }

    const items = Array.from(dropdown.querySelectorAll(".autocomplete-item"));
    if (!items.length) {
        if (event.key === "Escape") {
            closeShareAutocomplete(dropdownId, inputId);
        }
        return;
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = (state.activeIndex + 1) % items.length;
        state.activeIndex = nextIndex;
        updateShareAutocompleteActive(dropdownId, nextIndex);
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = state.activeIndex <= 0 ? items.length - 1 : state.activeIndex - 1;
        state.activeIndex = nextIndex;
        updateShareAutocompleteActive(dropdownId, nextIndex);
    } else if (event.key === "Enter") {
        if (state.activeIndex >= 0 && items[state.activeIndex]) {
            event.preventDefault();
            selectShareAutocomplete(null, inputId, dropdownId, items[state.activeIndex]);
        }
    } else if (event.key === "Escape") {
        closeShareAutocomplete(dropdownId, inputId);
    }
}

function initializeShareAutocomplete() {
    [
        { inputId: "shareCompany", dropdownId: "shareCompanyDropdown" },
        { inputId: "shareRole", dropdownId: "shareRoleDropdown" }
    ].forEach(({ inputId, dropdownId }) => {
        const input = document.getElementById(inputId);
        if (!input) {
            return;
        }

        input.addEventListener("keydown", event => handleShareAutocompleteKeydown(event, inputId, dropdownId));
        input.addEventListener("blur", () => {
            setTimeout(() => closeShareAutocomplete(dropdownId, inputId), 150);
        });
    });
}

// Initialize autocomplete after page loads
document.addEventListener("DOMContentLoaded", initializeShareAutocomplete);

function clampShareRoundsInput() {
    const roundsInput = document.getElementById("shareRounds");
    if (!roundsInput) {
        return;
    }

    const numericValue = parseInt(roundsInput.value, 10);
    const maxValue = parseInt(roundsInput.max || "15", 10);

    if (Number.isNaN(numericValue) || numericValue < 1) {
        roundsInput.value = 1;
        return;
    }

    roundsInput.value = Math.min(numericValue, Number.isNaN(maxValue) ? 15 : maxValue);
}

function handleShareRoundsKeydown(event) {
    const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "Home",
        "End",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown"
    ];

    const roundsInput = document.getElementById("shareRounds");

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        if (!roundsInput) {
            return;
        }

        const currentValue = parseInt(roundsInput.value, 10);
        const maxValue = parseInt(roundsInput.max || "15", 10);
        const safeCurrent = Number.isNaN(currentValue) ? 1 : currentValue;
        const nextValue = event.key === "ArrowUp" ? safeCurrent + 1 : safeCurrent - 1;
        roundsInput.value = Math.min(Math.max(nextValue, 1), Number.isNaN(maxValue) ? 15 : maxValue);
        return;
    }

    if (allowedKeys.includes(event.key)) {
        return;
    }

    if (event.ctrlKey || event.metaKey) {
        return;
    }

    if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const roundsInput = document.getElementById("shareRounds");
    if (!roundsInput) {
        return;
    }

    roundsInput.addEventListener("keydown", handleShareRoundsKeydown);
    roundsInput.addEventListener("blur", clampShareRoundsInput);
    roundsInput.addEventListener("change", clampShareRoundsInput);
});

// ===== AUTH FUNCTIONS =====
async function handleSignup() {
    console.log("🔵 Signup clicked");
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("signupConfirm").value;

    console.log("Form values:", { name, email, password, confirm });

    // Validation
    if (!name || !email || !password || !confirm) {
        const msg = "Please fill all fields";
        console.error("❌ " + msg);
        alert(msg);
        return;
    }
    
    if (name.length < 3) {
        const msg = "Name must be at least 3 characters";
        alert(msg);
        return;
    }

    if (!email.includes("@")) {
        const msg = "Please enter a valid email";
        alert(msg);
        return;
    }
    
    if (password.length < 6) {
        const msg = "Password must be at least 6 characters";
        alert(msg);
        return;
    }
    
    if (password !== confirm) {
        const msg = "Passwords do not match";
        alert(msg);
        return;
    }
    
    try {
        console.log("📡 Sending signup request to", `${API}/auth/signup`);
        const res = await fetch(`${API}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        console.log("✅ Response received:", data);

        if (res.ok) {
            console.log("✅ Signup successful");
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
            console.error("❌ Signup failed:", data);
            showToast(data.msg || data.error || "Signup failed", "error");
        }
    } catch (err) {
        console.error("Connection error:", err);
        showToast("Connection error. Make sure the server is running", "error");
    }
}

async function handleLogin() {
    console.log("🔵 Login clicked");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    console.log("Login email:", email);

    if (!email || !password) {
        const msg = "Please fill all fields";
        alert(msg);
        return;
    }

    if (!email.includes("@")) {
        const msg = "Please enter a valid email";
        alert(msg);
        return;
    }

    try {
        console.log("📡 Sending login request to", `${API}/auth/login`);
        
        const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        console.log("✅ Response received:", data);

        if (res.ok) {
            console.log("✅ Login successful");
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
            console.error("❌ Login failed:", data);
            showToast(data.msg || data.error || "Login failed", "error");
        }
    } catch (err) {
        console.error("Connection error:", err);
        showToast("Connection error. Make sure the server is running", "error");
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

function openPostModal() {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    
    if (token && currentUser) {
        // User is authenticated - navigate to Share Experience page
        navigateToShareExperience();
    } else {
        // User is not authenticated - show signup modal
        showToast("Please log in to share your experience", "info");
        openModal();
    }
}
function closePostModal() { 
    document.getElementById("postModal").style.display = "none";
    // Clear autocomplete dropdowns
    document.getElementById("postCompanyDropdown").classList.remove("active");
    document.getElementById("postRoleDropdown").classList.remove("active");
}

// ===== SHARE EXPERIENCE PAGE FUNCTIONS =====
function navigateToShareExperience() {
    // Hide dashboard and show share experience page
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("shareExperiencePage").style.display = "block";
    // Reset form fields
    resetShareExperienceForm();
}

function backToDashboard() {
    // Hide share experience page and show dashboard
    document.getElementById("shareExperiencePage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    // Ensure we're on the explore tab
    showTab("explore");
    showToast("Returned to dashboard", "info");
}

function resetShareExperienceForm() {
    // Reset input and select fields
    ["shareCompany","shareRole","shareRounds","shareRoundDetails","shareTips","shareResources"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    const roundsInput = document.getElementById("shareRounds");
    if (roundsInput) roundsInput.value = 1;
    ["shareType","shareDifficulty","shareOutcome"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });
    // Reset tags
    document.querySelectorAll("#shareTopicTags .tag").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#shareRoundTags .tag").forEach(t => t.classList.remove("active"));
    // Reset file input
    const fileInput = document.getElementById("shareResume");
    if (fileInput) fileInput.value = "";
} 

async function submitShareExperience() {
    // Collect form data from the Share Experience page
    const postData = {
        company: document.getElementById("shareCompany").value.trim(),
        role: document.getElementById("shareRole").value.trim(),
        type: document.getElementById("shareType").value,
        difficulty: document.getElementById("shareDifficulty").value,
        outcome: document.getElementById("shareOutcome").value,
        topics: getActiveShareTags(),
        roundsFaced: getActiveShareRounds(),
        resources: document.getElementById("shareResources").value,
        rounds: document.getElementById("shareRounds").value,
        roundDetails: document.getElementById("shareRoundDetails").value,
        questions: document.getElementById("shareRoundDetails").value,
        tips: document.getElementById("shareTips").value,
        postedBy: currentUser.name,
        userId: currentUser.email.toLowerCase()  // Normalize to lowercase
    }; 

    console.log("📤 Submitting share experience with userId:", postData.userId, "postedBy:", postData.postedBy);

    // Validation
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
            console.log("✅ Experience posted successfully!");
            showToast("Your experience has been shared! 🎉", "success");
            resetShareExperienceForm();
            // Redirect back to dashboard after 1 second
            setTimeout(() => {
                backToDashboard();
                loadPosts();  // Refresh posts to show the new one
            }, 1000);
        } else {
            showToast(data.msg || "Failed to share your experience", "error");
        }
    } catch (err) {
        console.error("Error sharing experience:", err);
        showToast("Connection error. Please try again.", "error");
    }
}

function getActiveShareTags() {
    return Array.from(document.querySelectorAll("#shareTopicTags .tag.active")).map(tag => tag.textContent);
}

function getActiveShareRounds() {
    return Array.from(document.querySelectorAll("#shareRoundTags .tag.active")).map(tag => tag.textContent);
}

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
    document.getElementById("editResources").value = post.resources || "";

    // Set topics
    document.querySelectorAll("#editTopicTags .tag").forEach(tag => tag.classList.remove("active"));
    (post.topics || []).forEach(topic => {
        const tag = [...document.querySelectorAll("#editTopicTags .tag")].find(t => t.textContent === topic);
        if (tag) tag.classList.add("active");
    });

    document.getElementById("editModal").style.display = "block";
    // Clear autocomplete dropdowns
    document.getElementById("editCompanyDropdown").classList.remove("active");
    document.getElementById("editRoleDropdown").classList.remove("active");
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    currentEditingPostId = null;
    // Clear autocomplete dropdowns
    document.getElementById("editCompanyDropdown").classList.remove("active");
    document.getElementById("editRoleDropdown").classList.remove("active");
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
        resources: document.getElementById("editResources").value,
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
        resources: document.getElementById("postResources").value,
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
    ["postCompany","postRole","postRounds","postRoundDetails","postQuestions","postTips","postResources"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
    ["postType","postDifficulty","postOutcome"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
    });
    document.querySelectorAll("#topicTags .tag").forEach(t => t.classList.remove("active"));
}

// ===== TEST DATA FUNCTION =====
function createTestPosts() {
    allPosts = [
        {
            _id: "test1",
            company: "Google",
            role: "SDE",
            type: "On-Campus",
            difficulty: "Hard",
            outcome: "Selected ✅",
            topics: ["DSA", "System Design"],
            rounds: 4,
            roundDetails: "4 technical rounds, HR round",
            questions: "LeetCode hard problems",
            tips: "Practice coding daily",
            postedBy: "Test User",
            userId: "test@example.com",
            upvotes: 15,
            upvotedBy: [],
            createdAt: new Date()
        },
        {
            _id: "test2",
            company: "Amazon",
            role: "SDE",
            type: "Off-Campus",
            difficulty: "Medium",
            outcome: "Selected ✅",
            topics: ["DSA"],
            rounds: 3,
            roundDetails: "3 coding rounds, 1 bar raiser",
            questions: "Tree and graph problems",
            tips: "Focus on DS",
            postedBy: "Test User 2",
            userId: "test2@example.com",
            upvotes: 8,
            upvotedBy: [],
            createdAt: new Date()
        },
        {
            _id: "test3",
            company: "Microsoft",
            role: "SDE",
            type: "Referral",
            difficulty: "Easy",
            outcome: "Pending ⏳",
            topics: ["DSA", "OOP"],
            rounds: 2,
            roundDetails: "2 technical rounds",
            questions: "Basic DSA",
            tips: "Read CLRS",
            postedBy: "Test User 3",
            userId: "test3@example.com",
            upvotes: 5,
            upvotedBy: [],
            createdAt: new Date()
        },
        {
            _id: "test4",
            company: "Barclays",
            role: "Data Analyst",
            type: "On-Campus",
            difficulty: "Medium",
            outcome: "Rejected ❌",
            topics: ["DBMS", "SQL"],
            rounds: 2,
            roundDetails: "SQL test, HR",
            questions: "Complex SQL queries",
            tips: "Master SQL joins",
            postedBy: "Test User 4",
            userId: "test4@example.com",
            upvotes: 3,
            upvotedBy: [],
            createdAt: new Date()
        }
    ];
    
    console.log("✅ Test posts created! Total:", allPosts.length);
    renderPosts(allPosts);
    renderMyPosts();
}

console.log("💡 DEBUGGING TIPS:");
console.log("  • quickTest()       ← Start here! Quick overview");
console.log("  • debugInfo()       ← Detailed info on posts & tabs");
console.log("  • testAPI()         ← Check what backend returns");
console.log("  • loadPosts()       ← Force reload from server");
console.log("  • createTestPosts() ← Load test data");
console.log("");

function debugInfo() {
    console.clear();
    console.log("====== 🔍 DEBUG INFO ======");
    console.log("\n📑 ACTIVE TAB:", currentTab);
    console.log("👤 Current User:", currentUser ? `${currentUser.name} (${currentUser.email})` : "NOT LOGGED IN");
    console.log("\n📊 POSTS IN MEMORY:");
    console.log("  Total in allPosts:", allPosts.length);
    if (allPosts.length > 0) {
        console.log("  Companies: ", [...new Set(allPosts.map(p => p.company))].join(", "));
        console.log("  Sample posts:");
        allPosts.slice(0, 5).forEach((p, i) => {
            const isOwn = currentUser && p.userId && currentUser.email && 
                          p.userId.toLowerCase() === currentUser.email.toLowerCase();
            console.log(`    [${i+1}] ${p.company} - ${p.role} by ${p.userId} ${isOwn ? '✓ YOUR POST' : '✗ OTHER USER'}`);
        });
        if (allPosts.length > 5) {
            console.log(`    ... and ${allPosts.length - 5} more`);
        }
    }
    
    console.log("\n🎨 WHAT'S BEING DISPLAYED:");
    const exploreTab = document.getElementById("exploreTab");
    const myPostsTab = document.getElementById("myPostsTab");
    const postsGrid = document.getElementById("postsGrid");
    const myPostsGrid = document.getElementById("myPostsGrid");
    
    const exploreVisible = exploreTab && exploreTab.classList.contains("active-tab");
    const myPostsVisible = myPostsTab && myPostsTab.classList.contains("active-tab");
    
    console.log("  Explore Tab visible:", exploreVisible);
    if (postsGrid) {
        const cards = postsGrid.querySelectorAll(".post-card");
        console.log("    Posts displayed: " + cards.length);
        if (cards.length > 0) {
            console.log("    Companies shown:", [...new Set([...cards].map(c => c.querySelector(".company-badge")?.textContent))].join(", "));
        }
    }
    
    console.log("  My Posts Tab visible:", myPostsVisible);
    if (myPostsGrid) {
        const cards = myPostsGrid.querySelectorAll(".post-card");
        console.log("    Posts displayed: " + cards.length);
    }
    
    console.log("\n✅ END DEBUG INFO =====\n");
}

function reloadAllPosts() {
    console.log("🔄 Reloading all posts from API...");
    loadPosts();
    setTimeout(() => {
        console.log("✅ Posts reloaded!");
        debugInfo();
    }, 1000);
}

async function testAPI() {
    console.log("\n🧪 TESTING API ENDPOINTS:");
    try {
        // Test: Get ALL posts
        console.log("\n1️⃣  Testing GET /api/posts (ALL POSTS)");
        const allRes = await fetch(`${API}/posts`);
        const allData = await allRes.json();
        console.log("   Response status:", allRes.status);
        console.log("   Posts count:", Array.isArray(allData) ? allData.length : "NOT AN ARRAY");
        if (Array.isArray(allData) && allData.length > 0) {
            const companies = [...new Set(allData.map(p => p.company))];
            console.log("   Companies:", companies.join(", "));
            console.log("   First 3 posts:");
            allData.slice(0, 3).forEach(p => {
                console.log(`     - ${p.company} - ${p.role} by ${p.userId}`);
            });
        } else {
            console.log("   ❌ No posts returned!");
        }
        
        // Test: Get user's posts
        if (currentUser && currentUser.email) {
            console.log("\n2️⃣  Testing GET /api/posts/my/" + currentUser.email);
            const userRes = await fetch(`${API}/posts/my/${currentUser.email}`);
            const userData = await userRes.json();
            console.log("   Response status:", userRes.status);
            console.log("   Your posts count:", Array.isArray(userData) ? userData.length : "NOT AN ARRAY");
        }
        
        console.log("\n✅ API test complete\n");
    } catch (err) {
        console.error("❌ API test error:", err);
    }
}

function quickTest() {
    console.clear();
    console.log("🧪 QUICK TEST - Check these values:");
    console.log("\n1. How many posts are loaded?");
    console.log("   allPosts.length =", allPosts.length);
    
    console.log("\n2. What's the active tab?");
    console.log("   currentTab =", currentTab);
    
    console.log("\n3. Sample posts loaded:");
    if (allPosts.length > 0) {
        allPosts.slice(0, 3).forEach(p => {
            console.log(`   - ${p.company} - ${p.role}`);
        });
    } else {
        console.log("   (No posts loaded - try: loadPosts() or createTestPosts())");
    }
    
    console.log("\n📌 Next steps:");
    if (allPosts.length === 0) {
        console.log("   → Run: loadPosts()");
    } else {
        console.log("   → Try selecting a company from the dropdown");
        console.log("   → Check console for filter logs");
    }
}

// ===== LOAD AND RENDER POSTS =====
async function loadPosts() {
    try {
        console.log("📥 Loading posts from API:", `${API}/posts`);
        const res = await fetch(`${API}/posts`);
        
        if (!res.ok) {
            console.error("❌ Posts API error:", res.status, res.statusText);
            showToast("Failed to load posts from server", "error");
            renderPosts([]);
            return;
        }
        
        const data = await res.json();
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
            console.error("❌ API returned non-array data:", data);
            allPosts = [];
        } else {
            allPosts = data;
        }
        
        // Sort all posts by latest date (newest first)
        allPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;  // Newest first
        });
        
        // Debug: Log all posts with their details
        console.log("✅ Posts loaded successfully!");
        console.log("📊 Total posts from API:", allPosts.length);
        console.log("👤 Current User:", currentUser);
        
        if (allPosts.length > 0) {
            console.log("📋 All posts from database (NOT filtered by user):");
            allPosts.forEach((p, i) => {
                const isOwn = currentUser && p.userId && currentUser.email && 
                              p.userId.toLowerCase() === currentUser.email.toLowerCase();
                console.log(`  [${i+1}] ${p.company} - ${p.role} by ${p.userId} ${isOwn ? '(YOUR POST)' : '(OTHER USER)'}`);
            });
        } else {
            console.warn("⚠️ No posts found in database - API might be down or database is empty");
        }
        
        // Render all posts in Explore tab
        renderPosts(allPosts);
        
        // Render only user's posts in My Posts tab
        renderMyPosts();
    } catch (err) {
        console.error("❌ Error loading posts:", err);
        showToast("Connection error. Make sure the server is running", "error");
        renderPosts([]);
    }
}

function renderPosts(posts) {
    const grid = document.getElementById("postsGrid");
    if (!grid) return;
    
    if (!posts || posts.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3><p>Be the first to share your interview experience!</p></div>`;
        return;
    }
    
    grid.innerHTML = posts.map(post => createPostCard(post, false)).join("");
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
        
        let myPosts = allPosts.filter(p => p.userId && p.userId.toLowerCase() === currentUser.email.toLowerCase());
        
        // Sort by latest date (newest first)
        myPosts.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;  // Newest first
        });
        
        const grid = document.getElementById("myPostsGrid");
        
        if (!grid) return;
        
        if (myPosts.length === 0) {
            grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>No posts yet</h3><p>Share your first interview experience!</p></div>`;
            return;
        }
        
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
        const outcomeClass = getOutcomeClass(post.outcome);
        const topicsHtml = renderCompactTopicChips(post.topics || [], 4);
        const dateStr = formatExperienceDate(post);
        const companyInitials = getCompanyInitials(post.company);
        const metadataHtml = `
            <div class="post-meta-row">
                <span class="meta-pill"><i class="fas fa-map-marker-alt"></i><span>${escapeHtml(post.type || "N/A")}</span></span>
                <span class="meta-pill"><i class="fas fa-redo"></i><span>${escapeHtml(`${post.rounds || "N/A"} Rounds`)}</span></span>
            </div>
            <div class="post-meta-row post-meta-row-secondary">
                <span class="meta-pill"><i class="fas fa-chart-line"></i><span>${escapeHtml(`${post.difficulty || "N/A"} Difficulty`)}</span></span>
                <span class="meta-pill"><i class="fas fa-calendar-alt"></i><span>${escapeHtml(dateStr)}</span></span>
            </div>`;

        // Check if current user already upvoted
        const hasUpvoted = currentUser && post.upvotedBy && post.upvotedBy.includes(currentUser.email);

        // Check if current user is the post creator - very explicit check
        let isOwnPost = false;
        if (currentUser && currentUser.email && post.userId) {
            const userEmail = currentUser.email.toLowerCase().trim();
            const postEmail = post.userId.toLowerCase().trim();
            isOwnPost = (userEmail === postEmail);
            
            // Additional check: if isMyPosts is true, this is definitely own post
            if (isMyPosts) {
                isOwnPost = true;
            }
        }
        
        console.log(`🔍 Post ID: ${postId}, Posted by: ${post.postedBy}, userId: ${post.userId}, Current user: ${currentUser?.email}, isOwnPost: ${isOwnPost}, isMyPosts: ${isMyPosts}`);
        
        // Show action buttons ONLY in My Posts section and only for own posts
        const actionButtons = (isMyPosts && isOwnPost) ? `
            <div class="post-row-actions" onclick="event.stopPropagation();">
                <button class="action-btn edit-btn" onclick="openEditModal('${postId}')" title="Edit post">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="action-btn delete-btn" onclick="deletePostQuick('${postId}')" title="Delete post">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        ` : "";

        return `
        <div class="post-card" onclick="viewPost('${postId}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewPost('${postId}')}"
            aria-label="View interview experience for ${escapeHtml(post.company || 'N/A')}">
            <div class="post-card-main">
                <div class="post-left">
                    <div class="post-company-block">
                        <div class="company-avatar">${companyInitials}</div>
                        <div>
                            <div class="post-company-name">${post.company || "N/A"}</div>
                            <div class="post-role">${post.role || "N/A"}</div>
                        </div>
                    </div>
                </div>

                <div class="post-mid">
                    <div class="post-meta-block">
                        ${metadataHtml}
                    </div>
                    <div class="post-topics">${topicsHtml}</div>
                </div>

                <div class="post-right">
                    <div class="post-right-top">
                        <span class="outcome-badge ${outcomeClass}">${post.outcome || "Pending"}</span>
                        <div class="post-upvotes">
                            <i class="fas fa-arrow-up"></i>
                            <span>${post.upvotes || 0}</span>
                        </div>
                    </div>
                    <div class="post-right-bottom">
                        <button class="post-cta" type="button" tabindex="-1" onclick="event.stopPropagation(); viewPost('${postId}')">
                            <span>View Details</span>
                            <i class="fas fa-arrow-right"></i>
                        </button>
                        <span class="posted-by">by ${post.postedBy || "Anonymous"}</span>
                    </div>
                </div>
            </div>
            ${actionButtons}
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

// ===== FILTER POSTS =====
function filterPosts() {
    // Safety check: make sure we have posts loaded
    if (!allPosts || allPosts.length === 0) {
        console.warn("⚠️ No posts loaded yet. Loading from API...");
        loadPosts();
        return;
    }

    const searchInput = document.getElementById("searchInput");
    const companySelect = document.getElementById("filterCompany");
    const roleSelect = document.getElementById("filterRole");
    const difficultySelect = document.getElementById("filterDifficulty");
    const topicSelect = document.getElementById("filterTopic");
    const sortSelect = document.getElementById("sortBy");
    
    const search = (searchInput ? searchInput.value.trim().toLowerCase() : "");
    const company = (companySelect ? companySelect.value.trim().toLowerCase() : "");
    const role = (roleSelect ? roleSelect.value.trim().toLowerCase() : "");
    const difficulty = (difficultySelect ? difficultySelect.value.trim().toLowerCase() : "");
    const topic = (topicSelect ? topicSelect.value.trim().toLowerCase() : "");
    const sortBy = (sortSelect ? sortSelect.value : "latest");

    console.log("🔍 Filtering with:", { search, company, role, difficulty, topic, sortBy });
    console.log("📋 Total posts to filter:", allPosts.length);

    const filtered = allPosts.filter(p => {
        // Search filter (case-insensitive, searches across multiple fields)
        const matchSearch = !search ||
            (p.company || "").toLowerCase().includes(search) ||
            (p.role || "").toLowerCase().includes(search) ||
            (p.topics || []).some(t => t.toLowerCase().includes(search)) ||
            (p.roundDetails || "").toLowerCase().includes(search);

        // Company filter (case-insensitive: Google, google, GOOGLE all match)
        const matchCompany = !company || (p.company || "").trim().toLowerCase() === company;
        
        // Role filter (case-insensitive: SDE, sde, SDE all match)
        const matchRole = !role || (p.role || "").trim().toLowerCase() === role;
        
        // Difficulty filter (case-insensitive comparison)
        const matchDiff = !difficulty || (p.difficulty || "").trim().toLowerCase() === difficulty;
        
        // Topic filter (case-insensitive - check if topic exists in array)
        const matchTopic = !topic || (p.topics || []).some(t => t.trim().toLowerCase() === topic);

        const matches = matchSearch && matchCompany && matchRole && matchDiff && matchTopic;
        
        if (matches) {
            console.log(`  ✅ ${p.company} - ${p.role} (${p.difficulty})`);
        }

        return matches;
    });

    console.log("📊 Results: " + filtered.length + " posts match out of " + allPosts.length);
    
    // Apply sorting based on selected sort option
    filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        const upvotesA = a.upvotes || 0;
        const upvotesB = b.upvotes || 0;

        if (sortBy === "highest") {
            // Sort by highest votes first, then by newest date for ties
            if (upvotesB !== upvotesA) {
                return upvotesB - upvotesA;  // Highest votes first
            }
            return dateB - dateA;  // If same upvotes, show newer first
        } else if (sortBy === "oldest") {
            // Sort by oldest date first
            return dateA - dateB;
        } else {
            // Default: "latest" - sort by newest date first
            return dateB - dateA;
        }
    });
    
    if (sortBy === "highest") {
        console.log("   Sorted by highest votes: " + filtered.map(p => p.company + " (" + (p.upvotes || 0) + " votes)").join(", "));
    } else if (sortBy === "oldest") {
        console.log("   Sorted by oldest date: " + filtered.map(p => p.company + " (" + new Date(p.createdAt).toLocaleDateString() + ")").join(", "));
    } else {
        console.log("   Sorted by latest date: " + filtered.map(p => p.company + " (" + new Date(p.createdAt).toLocaleDateString() + ")").join(", "));
    }
    
    renderPosts(filtered);
}

// ===== TABS =====
function showTab(tabName) {
    currentTab = tabName;
    currentViewMode = "listing";
    currentDetailsPostId = null;
    document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active-tab"));
    document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));

    if (tabName === "explore") {
        const exploreTab = document.getElementById("exploreTab");
        if (exploreTab) exploreTab.classList.add("active-tab");
        const navTabs = document.querySelectorAll(".nav-tab");
        if (navTabs[0]) navTabs[0].classList.add("active");
        // Reset filters and show all posts
        document.getElementById("searchInput").value = "";
        document.getElementById("filterCompany").value = "";
        document.getElementById("filterRole").value = "";
        document.getElementById("filterDifficulty").value = "";
        document.getElementById("filterTopic").value = "";
        renderPosts(allPosts);  // Show all posts without filters
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
    
    // Generate and display user initials
    const name = currentUser.name || "User";
    const initials = name
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";
    document.getElementById("profileInitials").textContent = initials;
}

// ===== UPVOTE SYSTEM =====
async function upvote(event, postId) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!currentUser || !currentUser.email) {
        showToast("Please log in to upvote", "error");
        return;
    }

    // Check if user is trying to upvote their own post
    const post = allPosts.find(p => p._id === postId);
    if (post && post.userId && post.userId.toLowerCase() === currentUser.email.toLowerCase()) {
        showToast("You cannot upvote your own post", "error");
        return;
    }

    try {
        if (!post) return;

        // Store original state for rollback
        const originalUpvotes = post.upvotes;
        const originalUpvotedBy = post.upvotedBy ? [...post.upvotedBy] : [];
        const wasUpvoted = post.upvotedBy && post.upvotedBy.includes(currentUser.email);
        
        // Optimistic update - update UI immediately
        if (wasUpvoted) {
            post.upvotes -= 1;
            post.upvotedBy = post.upvotedBy.filter(u => u !== currentUser.email);
        } else {
            post.upvotes += 1;
            if (!post.upvotedBy) post.upvotedBy = [];
            post.upvotedBy.push(currentUser.email);
        }

        // Re-render immediately for fast UI
        if (currentTab === "explore") {
            filterPosts();  // Re-apply filters instead of showing all posts
        } else if (currentTab === "my-posts") {
            renderMyPosts();
        }
        if (currentViewMode === "details" && currentDetailsPostId) {
            renderExperienceDetails(allPosts.find(p => (p._id || p.id) === currentDetailsPostId));
        }

        // Send request to server in background
        const res = await fetch(`${API}/posts/${postId}/upvote`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: currentUser.email })
        });

        if (!res.ok) {
            // Revert on error
            post.upvotes = originalUpvotes;
            post.upvotedBy = originalUpvotedBy;
            if (currentTab === "explore") {
                filterPosts();  // Re-apply filters instead of showing all posts
            } else if (currentTab === "my-posts") {
                renderMyPosts();
            }
            if (currentViewMode === "details" && currentDetailsPostId) {
                renderExperienceDetails(allPosts.find(p => (p._id || p.id) === currentDetailsPostId));
            }
            const errorData = await res.json();
            showToast(errorData.msg || "Failed to upvote", "error");
        } else {
            // Show success message
            showToast(wasUpvoted ? "Upvote removed" : "Successfully upvoted! 👍", "success");
        }
    } catch (err) {
        console.error("Error upvoting:", err);
        showToast("Connection error", "error");
    }
}

// ===== VIEW POST =====
async function viewPost(postId) {
    const post = allPosts.find(p => p._id === postId);
    if (!post) return;
    openExperienceDetails(postId);
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

// ===== AUTOCOMPLETE FUNCTIONALITY =====

// Get predefined companies for autocomplete
function getUniqueCompanies() {
    return PREDEFINED_COMPANIES;
}

// Get predefined roles for autocomplete
function getUniqueRoles() {
    return PREDEFINED_ROLES;
}

// Filter and display company suggestions
function filterCompanyAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        console.warn(`❌ Elements not found: input=${inputId}, dropdown=${dropdownId}`);
        return;
    }
    
    const searchTerm = input.value.toLowerCase().trim();
    const companies = getUniqueCompanies();
    
    // Filter companies that contain the search term
    let filtered = [];
    if (searchTerm.length > 0) {
        filtered = companies.filter(company => 
            company.toLowerCase().includes(searchTerm)
        );
    }
    
    console.log(`✅ Company search: "${searchTerm}" -> Found ${filtered.length} matches:`, filtered);
    
    // Update dropdown
    if (filtered.length === 0 || searchTerm.length === 0) {
        dropdown.innerHTML = "";
        dropdown.style.display = "none";
        console.log("📌 Hiding dropdown (no matches or empty search)");
    } else {
        dropdown.innerHTML = filtered.map(company => 
            `<div class="autocomplete-item" data-value="${company}" onclick="selectCompany(this)">${company}</div>`
        ).join("");
        dropdown.style.display = "block";
        console.log("✅ Showing dropdown with HTML:", dropdown.innerHTML);
        console.log("📍 Dropdown computed style:", window.getComputedStyle(dropdown).display);
    }
}

// Filter and display role suggestions
function filterRoleAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        console.warn(`❌ Elements not found: input=${inputId}, dropdown=${dropdownId}`);
        return;
    }
    
    const searchTerm = input.value.toLowerCase().trim();
    const roles = getUniqueRoles();
    
    // Filter roles that contain the search term
    let filtered = [];
    if (searchTerm.length > 0) {
        filtered = roles.filter(role => 
            role.toLowerCase().includes(searchTerm)
        );
    }
    
    console.log(`✅ Role search: "${searchTerm}" -> Found ${filtered.length} matches:`, filtered);
    
    // Update dropdown
    if (filtered.length === 0 || searchTerm.length === 0) {
        dropdown.innerHTML = "";
        dropdown.style.display = "none";
        console.log("📌 Hiding dropdown (no matches or empty search)");
    } else {
        dropdown.innerHTML = filtered.map(role => 
            `<div class="autocomplete-item" data-value="${role}" onclick="selectRole(this)">${role}</div>`
        ).join("");
        dropdown.style.display = "block";
        console.log("✅ Showing dropdown with HTML:", dropdown.innerHTML);
        console.log("📍 Dropdown computed style:", window.getComputedStyle(dropdown).display);
    }
}

// Select a company from autocomplete
function selectCompany(element) {
    const value = element.getAttribute("data-value");
    document.getElementById("postCompany").value = value;
    document.getElementById("postCompanyDropdown").style.display = "none";
    document.getElementById("postCompanyDropdown").innerHTML = "";
}

// Select a role from autocomplete
function selectRole(element) {
    const value = element.getAttribute("data-value");
    document.getElementById("postRole").value = value;
    document.getElementById("postRoleDropdown").style.display = "none";
    document.getElementById("postRoleDropdown").innerHTML = "";
}

// Also handle edit modal autocomplete
function selectEditCompany(element) {
    const value = element.getAttribute("data-value");
    document.getElementById("editCompany").value = value;
    document.getElementById("editCompanyDropdown").style.display = "none";
    document.getElementById("editCompanyDropdown").innerHTML = "";
}

function selectEditRole(element) {
    const value = element.getAttribute("data-value");
    document.getElementById("editRole").value = value;
    document.getElementById("editRoleDropdown").style.display = "none";
    document.getElementById("editRoleDropdown").innerHTML = "";
}

// Filter for edit modal company
function filterEditCompanyAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        return;
    }
    
    const searchTerm = input.value.toLowerCase().trim();
    const companies = getUniqueCompanies();
    
    let filtered = [];
    if (searchTerm.length > 0) {
        filtered = companies.filter(company => 
            company.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0 || searchTerm.length === 0) {
        dropdown.innerHTML = "";
        dropdown.style.display = "none";
    } else {
        dropdown.innerHTML = filtered.map(company => 
            `<div class="autocomplete-item" data-value="${company}" onclick="selectEditCompany(this)">${company}</div>`
        ).join("");
        dropdown.style.display = "block";
    }
}

// Filter for edit modal role
function filterEditRoleAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    
    if (!input || !dropdown) {
        return;
    }
    
    const searchTerm = input.value.toLowerCase().trim();
    const roles = getUniqueRoles();
    
    let filtered = [];
    if (searchTerm.length > 0) {
        filtered = roles.filter(role => 
            role.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0 || searchTerm.length === 0) {
        dropdown.innerHTML = "";
        dropdown.style.display = "none";
    } else {
        dropdown.innerHTML = filtered.map(role => 
            `<div class="autocomplete-item" data-value="${role}" onclick="selectEditRole(this)">${role}</div>`
        ).join("");
        dropdown.style.display = "block";
    }
}

// Close dropdowns when clicking outside
document.addEventListener("click", function(event) {
    const containers = document.querySelectorAll(".autocomplete-container");
    containers.forEach(container => {
        if (!container.contains(event.target)) {
            const dropdown = container.querySelector(".autocomplete-dropdown");
            if (dropdown) {
                dropdown.innerHTML = "";
                dropdown.style.display = "none";
            }
        }
    });
});

