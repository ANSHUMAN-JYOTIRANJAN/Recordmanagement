document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const message = document.getElementById("registerMessage");
  const submitButton = form.querySelector('button[type="submit"]');
  const roleSelect = document.getElementById("role");
  const studentFields = form.querySelectorAll(".student-only");
  const rollNoInput = document.getElementById("rollNo");
  const addressInput = document.getElementById("address");
  const semesterInput = document.getElementById("semester");
  const passwordInput = document.getElementById("password");

  const updateStudentFields = function () {
    const isStudent = roleSelect.value === "Student";
    studentFields.forEach(function (field) {
      field.hidden = !isStudent;
    });
    rollNoInput.required = isStudent;
    addressInput.required = false;
    semesterInput.required = false;
    passwordInput.minLength = isStudent ? 6 : 8;
  };

  roleSelect.addEventListener("change", updateStudentFields);
  updateStudentFields();

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
          role: roleSelect.value,
          rollNo: rollNoInput.value.trim(),
          address: addressInput.value.trim(),
          semester: Number(semesterInput.value),
        }),
      });
      window.location.href = `login.html?registered=1&role=${encodeURIComponent(roleSelect.value)}`;
    } catch (error) {
      console.error("Registration failed:", error);
      message.textContent = error.message || "Unable to create account.";
      message.style.display = "block";
    } finally {
      submitButton.disabled = false;
    }
  });
});
