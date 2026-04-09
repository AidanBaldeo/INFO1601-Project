async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  if (!navbarContainer) {
    return;
  }

  try {
    const response = await fetch("navbar.html");
    if (!response.ok) {
      throw new Error("Failed to load navbar.");
    }

    navbarContainer.innerHTML = await response.text();
    document.dispatchEvent(new Event("navbar:loaded"));
  } catch (error) {
    navbarContainer.innerHTML = "";
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);
