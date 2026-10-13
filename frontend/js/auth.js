async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const message = document.getElementById("loginMessage");

  message.textContent = "";
  message.style.display = "none";

  try {
    const data = await window.apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.user.role !== role) {
      throw new Error("The selected role does not match this account.");
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.user.role);
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Login failed:", error);
    message.textContent = error.message || "Unable to log in.";
    message.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", login);

  const params = new URLSearchParams(window.location.search);
  const message = document.getElementById("loginMessage");
  if (params.get("registered") === "1" && message) {
    message.textContent = "Account created successfully. Please log in.";
    message.style.display = "block";
    message.classList.add("success");
    const role = document.getElementById("role");
    const registeredRole = params.get("role");
    if (role) {
      role.value = registeredRole || "Student";
    }
  }
});
