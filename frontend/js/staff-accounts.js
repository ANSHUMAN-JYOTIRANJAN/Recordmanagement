document.addEventListener("DOMContentLoaded", function () {
  if (!window.protectPage()) return;

  const user = window.getCurrentUser();
  if (!user || user.role !== "Academic Office") {
    window.location.replace("dashboard.html");
    return;
  }

  const form = document.getElementById("staffAccountForm");
  const message = document.getElementById("staffAccountMessage");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.textContent = "";
    message.style.display = "none";
    submitButton.disabled = true;

    try {
      await window.apiRequest("/auth/staff", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          role: document.getElementById("role").value,
          password: document.getElementById("password").value,
        }),
      });
      message.textContent = "Staff account created successfully.";
      message.style.color = "#166534";
      message.style.display = "block";
      form.reset();
    } catch (error) {
      console.error("Staff account creation failed:", error);
      message.textContent = error.message || "Unable to create staff account.";
      message.style.color = "#b91c1c";
      message.style.display = "block";
    } finally {
      submitButton.disabled = false;
    }
  });
});
