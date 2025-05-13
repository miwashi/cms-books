// js/index.js - main page , Read-only public book display

// GET request
const getData = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch books:", error);
    return null;
  }
};

// Render book list to the DOM
const renderBooks = async () => {
  const booksContainer = document.querySelector("#book-list");

  const response = await getData(
    `${BASE_URL}/api/books?populate[cover]=true&populate[ratings]=true`
  );

  if (!response?.data) {
    booksContainer.innerHTML = "<p>Failed to load books.</p>";
    return;
  }

  booksContainer.innerHTML = "";

  response.data.forEach((book) => {
    const div = document.createElement("div");
    div.className = "book-card";

    // Book cover
    const img = document.createElement("img");
    const coverUrl =
      book.cover?.formats?.thumbnail?.url || "/uploads/default-cover.jpg";
    img.src = `${BASE_URL}${coverUrl}`;
    div.appendChild(img);

    // Title
    const h2 = document.createElement("h2");
    h2.innerText = book.title || "Untitled";
    div.appendChild(h2);

    // Info
    const info = [
      { label: "Author", value: book.author },
      { label: "Pages", value: book.pages },
      { label: "Published", value: book.publishedDate },
      { label: "Genre", value: book.genre },
      { label: "Price", value: `$${book.price}` },
    ];

    info.forEach(({ label, value }) => {
      const p = document.createElement("p");
      p.innerText = `${label}: ${value ?? "N/A"}`;
      div.appendChild(p);
    });

    // Average rating display
    const avg = book.average_rating ?? 0;
    const rating = document.createElement("p");
    rating.className = "star-rating";
    rating.innerHTML = `Average Rating: ${
      "⭐".repeat(Math.round(avg)) + "☆".repeat(5 - Math.round(avg))
    } (${avg}/5)`;
    div.appendChild(rating);

    booksContainer.appendChild(div);
  });
};

// Carousel logic
let currentSlide = 0;
let interval;
const images = document.querySelectorAll(".carousel-img");
const leftBtn = document.querySelector(".carousel-btn.left");
const rightBtn = document.querySelector(".carousel-btn.right");
const stopBtn = document.getElementById("stop-carousel");

function showSlide(index) {
  images.forEach((img, i) => {
    img.classList.toggle("active", i === index);
  });
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % images.length;
  showSlide(currentSlide);
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + images.length) % images.length;
  showSlide(currentSlide);
}

function startCarousel() {
  interval = setInterval(nextSlide, 4000);
}

function stopCarousel() {
  clearInterval(interval);
  stopBtn.textContent = "▶";
}

function resumeCarousel() {
  startCarousel();
  stopBtn.textContent = "⏸";
}

// Init everything
window.addEventListener("DOMContentLoaded", () => {
  renderBooks();
  showSlide(0);
  startCarousel();

  leftBtn?.addEventListener("click", () => {
    prevSlide();
    resumeCarousel();
  });

  rightBtn?.addEventListener("click", () => {
    nextSlide();
    resumeCarousel();
  });

  stopBtn?.addEventListener("click", () => {
    if (interval) {
      stopCarousel();
    } else {
      resumeCarousel();
    }
  });
});
