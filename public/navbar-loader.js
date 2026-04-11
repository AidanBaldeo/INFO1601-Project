async function loadNavbar() {
  const navbarContainer = document.getElementById("navbar-container");
  if (!navbarContainer) {
    return;
  }

  try {
    const response = await fetch("navbar.html");
    if (response.ok) {
      navbarContainer.innerHTML = await response.text();
      setupSidebarToggle();
      setupAuthNav();
    }
  } catch (error) {
    navbarContainer.innerHTML = "";
  }
}

function setupSidebarToggle() {
  const sidebar = document.getElementById("site-sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");

  if (!sidebar && sidebarToggle) {
    sidebarToggle.classList.add("d-none");
  }
}

function setupAuthNav() {
  const loginLink = document.getElementById("nav-login-link");
  const signupLink = document.getElementById("nav-signup-link");
  const loginItem = loginLink ? loginLink.closest("li") : null;
  const signupItem = signupLink ? signupLink.closest("li") : null;
  const usernameItem = document.getElementById("nav-username-item");
  const usernameText = document.getElementById("nav-username-text");
  const logoutItem = document.getElementById("nav-logout-item");
  const logoutLink = document.getElementById("nav-logout-link");

  if (!loginLink || !signupLink || !loginItem || !signupItem || !usernameItem || !usernameText || !logoutItem || !logoutLink) {
    return;
  }

  loginItem.classList.add("d-none");
  signupItem.classList.add("d-none");
  usernameItem.classList.add("d-none");
  logoutItem.classList.add("d-none");

  function setGuestNav() {
    loginItem.classList.remove("d-none");
    signupItem.classList.remove("d-none");
    usernameItem.classList.add("d-none");
    usernameText.textContent = "";
    logoutItem.classList.add("d-none");
  }

  function setAuthedNav(username) {
    loginItem.classList.add("d-none");
    signupItem.classList.add("d-none");
    usernameItem.classList.remove("d-none");
    usernameText.textContent = username;
    logoutItem.classList.remove("d-none");
  }

  const client = window.firebaseClient;
  if (!client || !client.isReady()) {
    setGuestNav();
    return;
  }

  client.onAuthStateChanged(async function (user) {
    if (user) {
      let username = "";

      try {
        const doc = await firebase.firestore().collection("users").doc(user.uid).get();
        if (doc.exists) {
          const data = doc.data();
          if (data && data.username) {
            username = data.username;
          }
        }
      } catch (error) {}

      if (!username && user.displayName) {
        username = user.displayName;
      }

      if (!username && user.email) {
        username = user.email.split("@")[0];
      }

      if (!username) {
        username = "Account";
      }

      setAuthedNav(username);
      return;
    }
    setGuestNav();
  });

  logoutLink.onclick = function (event) {
    event.preventDefault();
    client.signOut();
    window.location.href = "index.html";
  };
}

loadNavbar();
