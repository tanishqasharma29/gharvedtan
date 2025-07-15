// --- Firebase Auth Modal ---
function openModal(mode) {
  document.getElementById("authMode").value = mode;
  document.getElementById("authTitle").textContent = mode === "signup" ? "Sign Up" : "Log In";
  document.getElementById("authModal").classList.remove("hidden");

  const show = mode === "signup" ? "block" : "none";
  document.getElementById("nameInput").style.display = show;
  document.getElementById("phoneInput").style.display = show;
  document.getElementById("cityInput").style.display = show;
  document.getElementById("roleInput").style.display = show;
}

function closeModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function submitAuth() {
  const mode = document.getElementById("authMode").value;
  const name = document.getElementById("nameInput").value.trim();
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();
  const phone = document.getElementById("phoneInput").value.trim();
  const city = document.getElementById("cityInput").value.trim();
  const role = document.getElementById("roleInput").value;

  if (!email || !password || (mode === "signup" && (!name || !phone || !city || !role))) {
    alert("Please fill in all required fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  if (mode === "signup") {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        const uid = userCredential.user.uid;
        return firebase.firestore().collection("users").doc(uid).set({
          name, email, phone, city, role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
          sessionStorage.setItem("userName", name);
          sessionStorage.setItem("userEmail", email);
          displayUser(name, email);
          closeModal();
          redirectToDashboard(role);
        });
      })
      .catch(err => {
        if (err.code === 'auth/email-already-in-use') {
          alert("Account already exists. Please log in.");
        } else {
          alert("Sign up failed: " + err.message);
        }
      });
  } else {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        const uid = firebase.auth().currentUser.uid;
        firebase.firestore().collection("users").doc(uid).get()
          .then(doc => {
            const userData = doc.data();
            const name = userData?.name || email.split('@')[0];
            sessionStorage.setItem("userName", name);
            sessionStorage.setItem("userEmail", email);
            displayUser(name, email);
            closeModal();
            redirectToDashboard(userData?.role);
          });
      })
      .catch(error => {
        alert("Login failed: " + error.message);
      });
  }
}

function redirectToDashboard(role) {
  if (role === "Buyer") {
    window.location.href = "buyer-dashboard.html";
  } else if (role === "Seller") {
    window.location.href = "seller-dashboard.html";
  } else {
    alert("Invalid role or missing user info.");
  }
}

function displayUser(name, email) {
  document.getElementById("userInfo").innerHTML = `
    <hr style="margin: 10px 0;" />
    <p><strong>${name}</strong></p>
    <p>${email}</p>
    <p><a href="#" onclick="logoutUser()" style="color: #c94c1c; font-style: italic;"><strong>Logout</strong></a></p>
  `;
}

function logoutUser() {
  firebase.auth().signOut().then(() => {
    sessionStorage.clear();
    document.getElementById("userInfo").innerHTML = `
      <button onclick="openModal('signup')">Sign Up</button>
      <button onclick="openModal('login')">Log In</button>
    `;
    window.location.href = "index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const name = sessionStorage.getItem("userName");
  const email = sessionStorage.getItem("userEmail");
  if (name && email) {
    displayUser(name, email);
  }
  showSingleImage(0);
});

// --- Sidebar + Navigation ---
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.style.display = sidebar.style.display === "block" ? "none" : "block";
}
function hideSidebar() {
  document.getElementById("sidebar").style.display = "none";
}
function openZipModal() {
  document.getElementById("zipModal").classList.remove("hidden");
  hideSidebar();
}
function closeZipModal() {
  document.getElementById("zipModal").classList.add("hidden");
}
function findShefs() {
  const zip = document.getElementById("zipInput").value;
  if (!zip) return alert("Please enter a zip code.");
  closeZipModal();
  alert(`Searching for shefs near ${zip}`);
}
function loadSidebarPage(pageName) {
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h1>${pageName}</h1>
      <p>This is the <strong>${pageName}</strong> page. You can display user info, orders, address, or any content dynamically here.</p>
      <br>
      <button onclick="location.reload()">← Back to Home</button>
    </div>
  `;
}
function loadFooterPage(pageName) {
  document.body.innerHTML = `
    <div style="padding: 40px; text-align: center;">
      <h1>${pageName}</h1>
      <p>This is the content for <strong>${pageName}</strong>. You can write details about your policy, your mission, your story, or anything relevant here.</p>
      <br>
      <button onclick="location.reload()">← Back to Home</button>
    </div>
  `;
}

// --- Image Carousel ---
const singleImageSet = [
  "images/Screenshot 2025-07-09 115706.png",
  "images/Screenshot 2025-07-09 115727.png",
  "images/Screenshot 2025-07-09 115833.png",
  "images/Screenshot 2025-07-09 115858.png",
];

function showSingleImage(index) {
  const container = document.getElementById("imageContainer");
  if (!container) return;
  container.innerHTML = "";
  const img = document.createElement("img");
  img.src = singleImageSet[index] + "?v=" + new Date().getTime();
  img.alt = `Image ${index + 1}`;
  img.classList.add("slide-image");
  container.appendChild(img);
  document.querySelectorAll(".slider-nav span").forEach((el, i) => {
    el.classList.toggle("active", i === index);
  });
}
