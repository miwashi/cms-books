// js/theme.js

(async () => {
  try {
    const res = await axios.get(`${BASE_URL}/api/site-setting`);
    
    const theme = res.data?.data?.theme?.trim();

    if (!theme) {
      console.warn("⚠️ No theme found, defaulting to 'light'");
      document.body.classList.add("light");
      return;
    }

    console.log("🎨 Applying theme:", theme);

    document.body.classList.remove("light", "middle_light", "dark");
    document.body.classList.add(theme);
  } catch (err) {
    console.error("Failed to fetch theme:", err);
    document.body.classList.add("light");
  }
})();
