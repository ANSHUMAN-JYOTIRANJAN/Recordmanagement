document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("staffSetupForm");
  const message = document.getElementById("staffSetupMessage");
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.textContent = "";
    message.style.display = "none";
    submitButton.disabled = true;

    try {
      await window.apiRequest("/auth/setup-staff", {
        method: "POST",
        headers: {
          "X-Staff-Setup-Secret":
            document.getElementById("setupSecret").value,
        },
        body: JSON.stringify({
          name: document.getElementById("name").value.trim(),
          email: document.getElementById("email").value.trim(),
          password: document.getElementById("password").value,
        }),
      });
      message.textContent =
        "Academic Office account created. Log in using Academic Office as your role.";
      message.style.color = "#166534";
      message.style.display = "block";
      form.reset();
    } catch (error) {
      console.error("Initial staff setup failed:", error);
      message.textContent = error.message || "Unable to create staff account.";
      message.style.color = "#b91c1c";
      message.style.display = "block";
    } finally {
      submitButton.disabled = false;
    }
  });
});
