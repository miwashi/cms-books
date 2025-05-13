const BASE_URL = "http://localhost:1337";

// Attach login handler
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn")?.addEventListener("click", handleLogin);
});

// Login handler function
async function handleLogin() {
  const email = document.getElementById("login-email")?.value;
  const password = document.getElementById("login-password")?.value;

  if (!email || !password) {
    alert("⚠️ Please fill in both fields.");
    return;
  }

  try {
    // Step 1: Authenticate user
    const res = await axios.post(`${BASE_URL}/api/auth/local`, {
      identifier: email,
      password: password,
    });

    const token = res.data.jwt;

    // Step 2: Fetch user info including role
    const user = await fetchUserInfo(token);
    if (!user) throw new Error("User info fetch failed");

    // Step 3: Save to session
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    console.log("✅ Logged in as:", user.username);
    console.log("🧾 Full user object:", user);

    // Step 4: Extract role name safely
    let rawRole = user.role?.name || user.role?.data?.attributes?.name || "";
    const normalizedRole = rawRole.trim().toLowerCase().replace(/\s+/g, "_");

    console.log("🔍 Raw role:", rawRole);
    console.log("🎯 Normalized role:", normalizedRole);

    // Step 5: Redirect based on normalized role
    if (normalizedRole === "super_admin") {
      console.log("🔐 Redirecting to admin.html...");
      window.location.href = "admin.html";
    } else {
      console.log("👤 Redirecting to home.html...");
      window.location.href = "home.html";
    }
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    alert("Login failed: Check email/password and try again.");
  }
}

// Fetch user info with role populated
async function fetchUserInfo(token) {
  try {
    const res = await axios.get(`${BASE_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        populate: "role",
      },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch user info:", err.response?.data || err.message);
    return null;
  }
}
