const BASE_URL = "http://localhost:1337";

// GET request with token
const getData = async (url, token) => {
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error(" Error fetching data:", {
      url,
      status: error.response?.status,
      message: error.response?.data?.error?.message,
    });
    return null;
  }
};

// Get logged-in user from session
const getUserData = () => {
  const token = sessionStorage.getItem("token");
  const userRaw = sessionStorage.getItem("user");

  if (!token || !userRaw) {
    alert("Login is required.");
    window.location.href = "login.html";
    return null;
  }

  try {
    const user = JSON.parse(userRaw);
    document.getElementById("username").innerText = user.username;
    document.getElementById("email").innerText = user.email;
    return user;
  } catch (err) {
    console.error(" Failed to parse user data:", err);
    sessionStorage.clear();
    window.location.href = "login.html";
    return null;
  }
};

// Remove a saved book
const removeBookFromSaved = async (bookId, token) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userId = user?.id;
  if (!userId) return false;

  try {
    await axios.put(
        `${BASE_URL}/api/users/${userId}`,
        { books: { disconnect: [bookId] } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
    );
    return true;
  } catch (error) {
    console.error("Failed to disconnect book from user:", error.response?.data || error);
    return false;
  }
};

// Fetch saved books
const getSavedBooks = async (token) => {
  const url = `${BASE_URL}/api/users/me?populate=books.cover`;
  const data = await getData(url, token);
  return data?.books || [];
};

// Fetch rated books
const getRatedBooks = async (token) => {
  const url = `${BASE_URL}/api/users/me?populate[ratings][populate]=book.cover`;
  const data = await getData(url, token);

  if (!data || !Array.isArray(data.ratings)) return [];

  const seen = new Set();
  return data.ratings.map((rating) => {
    const book = rating.book;
    if (!book || !book.id) return null;
    const key = book.documentId || book.id;
    if (seen.has(key)) return null;
    seen.add(key);
    return {
      ...book,
      user_rating: rating.rating,
      rating_id: rating.id,
      cover: book.cover?.formats?.thumbnail || book.cover || null,
    };
  }).filter(Boolean);
};

// Sort books
const sortBooks = (books, sortBy) => {
  return [...books].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "author":
        return (a.author || "").localeCompare(b.author || "");
      case "rating-high":
        return (b.user_rating || 0) - (a.user_rating || 0);
      case "rating-low":
        return (a.user_rating || 0) - (b.user_rating || 0);
      default:
        return 0;
    }
  });
};

// Render saved books
const renderSavedBooks = async () => {
  const container = document.querySelector("#saved-books-list");
  const token = sessionStorage.getItem("token");
  const sortBy = document.getElementById("sort-saved-books")?.value || "title";
  if (!token) return;

  const books = await getSavedBooks(token);
  const seen = new Set();
  const uniqueBooks = books.filter((book) => {
    const key = book.documentId || book.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueBooks.length === 0) {
    container.innerHTML = "<li>No saved books.</li>";
    return;
  }

  const sorted = sortBooks(uniqueBooks, sortBy);
  container.innerHTML = "";

  sorted.forEach((book) => {
    const div = document.createElement("div");
    div.classList.add("book-card");

    const img = document.createElement("img");
    img.src = `${BASE_URL}${book.cover?.url || "/uploads/default-cover.jpg"}`;
    div.appendChild(img);

    div.innerHTML += `
      <h2>${book.title || "Untitled"}</h2>
      <p>Author: ${book.author || "Unknown"}</p>
      <p>Published: ${book.publishedDate || "N/A"}</p>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Remove "${book.title}" from your saved list?`)) {
        const success = await removeBookFromSaved(book.id, token);
        if (success) div.remove();
      }
    });

    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
};

// Render rated books
const renderRatedBooks = async () => {
  const container = document.querySelector("#rated-books-list");
  const token = sessionStorage.getItem("token");
  const sortBy = document.getElementById("sort-rated-books")?.value || "rating-high";
  if (!token) return;

  const books = await getRatedBooks(token);
  if (books.length === 0) {
    container.innerHTML = "<li>No rated books.</li>";
    return;
  }

  const sorted = sortBooks(books, sortBy);
  container.innerHTML = "";

  sorted.forEach((book) => {
    const div = document.createElement("div");
    div.classList.add("book-card");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "space-between";

    const img = document.createElement("img");
    img.src = `${BASE_URL}${book.cover?.url || "/uploads/default-cover.jpg"}`;
    img.style.width = "40px";
    img.style.height = "auto";
    img.style.marginRight = "10px";
    img.style.borderRadius = "4px";

    const info = document.createElement("div");
    info.innerHTML = `
      <h3>${book.title}</h3>
      <p>Author: ${book.author || "Unknown"}</p>
      <p>Your Rating: ${book.user_rating}</p>
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete Rating";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Delete your rating for "${book.title}"?`)) {
        try {
          await axios.delete(`${BASE_URL}/api/ratings/${book.rating_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          div.remove();
        } catch (err) {
          console.error("Failed to delete rating:", err.response?.data || err);
          alert("Failed to delete rating.");
        }
      }
    });

    div.appendChild(img);
    div.appendChild(info);
    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
};

// Init
document.getElementById("sort-saved-books")?.addEventListener("change", renderSavedBooks);
document.getElementById("sort-rated-books")?.addEventListener("change", renderRatedBooks);
document.getElementById("logout-btn").addEventListener("click", () => {
  sessionStorage.clear();
  localStorage.setItem("isLoggedIn", "false");
  window.location.href = "index.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  const user = getUserData();
  if (user) {
    await renderSavedBooks();
    await renderRatedBooks();
  }
});