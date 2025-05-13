// admin.js

const fetchTheme = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/site-setting`);
    const theme = res.data?.data?.attributes?.theme;
    return theme || "light";
  } catch (err) {
    console.error("Failed to fetch theme:", err);
    return "light";
  }
};

// Update the theme in Strapi

const updateTheme = async (newTheme) => {
  try {
    const res = await axios.put(`${BASE_URL}/api/site-setting`, {
      data: {
        theme: newTheme,
        publishedAt: new Date().toISOString() 
      }
    }, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      }
    });

    console.log(" Theme updated:", res.data);
    alert(" Theme saved and published!");
  } catch (err) {
    console.error(" Failed to update theme:", err);
    alert("Failed to update theme.");
  }
};


// DOM init
window.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const token = sessionStorage.getItem("token");
  const roleName = user?.role?.name?.trim().toLowerCase();

  if (!user || !token) {
    return (window.location.href = "login.html");
  }

  if (roleName !== "super_admin") {
    alert("Access denied. Super Admins only.");
    return (window.location.href = "home.html");
  }

  document.getElementById("username").innerText = user.username;
  document.getElementById("email").innerText = user.email;

  const adminInfo = document.getElementById("admin-info");
  adminInfo.innerHTML = `
    <p>Welcome, ${user.username}!</p>
    <p>Your role: ${user.role.name}</p>
  `;

  // Set current theme
  const themeSelect = document.getElementById("theme-select");
  const currentTheme = await fetchTheme();
  if (themeSelect) themeSelect.value = currentTheme;

  // Spara till servern när temat ändras
  themeSelect?.addEventListener("change", async (e) => {
    const newTheme = e.target.value;
    await updateTheme(newTheme);
  });

  document.getElementById("logout-btn")?.addEventListener("click", () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "index.html";
  });
});
