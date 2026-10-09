document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.textContent = "";
    message.style.display = "none";
    submitButton.disabled = true;

    try {
      await window.apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
          rollNo: document.getElementById("rollNo").value.trim(),
          address: document.getElementById("address").value.trim(),
          semester: Number(document.getElementById("semester").value),
        }),
      });
      window.location.href = "login.html?registered=1";
    } catch (error) {
      console.error("Registration failed:", error);
      message.textContent = error.message || "Unable to create account.";
      message.style.display = "block";
    } finally {
      submitButton.disabled = false;
    }
  });
});
