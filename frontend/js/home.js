const BASE_URL = "http://localhost:1337";

// GET with optional auth
const getData = async (url, token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (e) {
    console.error("Error fetching data:", e.response?.data || e);
    return null;
  }
};

// Get user from session
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
  } catch {
    sessionStorage.clear();
    window.location.href = "login.html";
    return null;
  }
};

// Render books
const renderPage = async () => {
  const booksContainer = document.querySelector("#book-list");
  const token = sessionStorage.getItem("token");
  const user = getUserData();
  if (!user) return;

  const booksRes = await getData(`${BASE_URL}/api/books?populate=cover`, token);
  const ratingsRes = await getData(`${BASE_URL}/api/users/me?populate=ratings.book`, token);

  if (!booksRes?.data) {
    booksContainer.innerHTML = "<p>Failed to load books.</p>";
    return;
  }

  const alreadyRatedBookIds = new Set(
      (ratingsRes?.ratings || []).map(r => r.book?.id).filter(Boolean)
  );

  booksContainer.innerHTML = "";

  booksRes.data.forEach((book) => {
    const div = document.createElement("div");
    div.className = "book-card";
    div.style.position = "relative";

    const coverUrl =
        book.cover?.formats?.thumbnail?.url ||
        book.cover?.url ||
        "/uploads/default-cover.jpg";

    const img = document.createElement("img");
    img.src = `${BASE_URL}${coverUrl}`;
    div.appendChild(img);

    const h2 = document.createElement("h2");
    h2.innerText = book.title || "Unknown Title";
    div.appendChild(h2);

    [
      { label: "Author", value: book.author },
      { label: "Pages", value: book.pages },
      { label: "Published", value: book.publishedDate },
      { label: "Genre", value: book.genre },
      { label: "Price", value: `$${book.price}` },
    ].forEach(({ label, value }) => {
      const p = document.createElement("p");
      p.innerText = `${label}: ${value ?? "N/A"}`;
      div.appendChild(p);
    });

    const avg = book.average_rating ?? 0;
    const avgP = document.createElement("p");
    avgP.className = "star-rating";
    avgP.innerHTML = `Average Rating: ${
        "⭐".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg))
    } (${avg}/5)`;
    div.appendChild(avgP);

    // Rating stars
    const userStars = document.createElement("div");
    userStars.className = "user-rating";
    const label = document.createElement("span");
    label.innerText = "Choose your rating: ";
    label.style.fontWeight = "600";
    label.style.marginRight = "6px";
    userStars.appendChild(label);

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement("span");
      star.textContent = "☆";
      star.dataset.value = i;
      star.style.cursor = "pointer";
      star.style.fontSize = "1.2rem";
      star.style.marginRight = "3px";

      star.addEventListener("mouseover", () => {
        userStars.querySelectorAll("span[data-value]").forEach((s) => {
          s.style.color = +s.dataset.value <= i ? "#ffc107" : "";
        });
      });

      star.addEventListener("mouseout", () => {
        userStars.querySelectorAll("span[data-value]").forEach((s) => {
          s.style.color = "";
        });
      });

      star.addEventListener("click", async () => {
        if (alreadyRatedBookIds.has(book.id)) {
          alert("You already rated this book.");
          return;
        }

        try {
          await axios.post(
              `${BASE_URL}/api/ratings`,
              {
                data: {
                  rating: i,
                  book: book.id,
                },
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
          );

          alert(`You rated this book ${i} star${i > 1 ? "s" : ""}!`);
          alreadyRatedBookIds.add(book.id);
          userStars.querySelectorAll("span[data-value]").forEach((s) => {
            s.style.color = +s.dataset.value <= i ? "#ffc107" : "";
          });
        } catch (err) {
          console.error("Rating failed:", err.response?.data || err);
          alert("Failed to submit rating.");
        }
      });

      userStars.appendChild(star);
    }

    div.appendChild(userStars);

    // Add to My List Button
    const btn = document.createElement("button");
    btn.innerText = "Add to My List";
    Object.assign(btn.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      padding: "0.4rem 0.8rem",
      cursor: "pointer",
      fontSize: "0.9rem",
      zIndex: 2,
    });

    btn.addEventListener("click", async () => {
      try {
        await axios.put(
            `${BASE_URL}/api/users/${user.id}`,
            { books: { connect: [book.id] } },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Book added to your list!");
      } catch (e) {
        console.error("Add to list failed:", e.response?.data || e);
        alert("Could not save book.");
      }
    });

    div.appendChild(btn);
    booksContainer.appendChild(div);
  });
};

// Init
document.addEventListener("DOMContentLoaded", () => {
  const user = getUserData();
  if (user) renderPage();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
});
