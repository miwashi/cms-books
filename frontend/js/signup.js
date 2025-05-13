// js/signup.js
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("signup-btn").addEventListener("click", handleSignUp);
});

async function handleSignUp() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await axios.post("http://localhost:1337/api/auth/local/register", {
            username,
            email,
            password,
        });

        if (response.status === 200) {
            alert("🎉 Registration successful! Please log in.");
            window.location.href = "login.html";  // Redirect to login page after successful signup
        }
    } catch (error) {
        console.error("Registration failed:", error.response?.data || error.message);
        alert(`Registration failed: ${error.response?.data?.error?.message || "Unknown error"}`);
    }
}
