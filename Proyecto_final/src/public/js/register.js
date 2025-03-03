document.addEventListener("DOMContentLoaded", () => {
  const formRegister = document.getElementById("registerForm");

  formRegister.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/sessions/register", {
        method: "POST",
        header: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.log(error);
    }
  });
});
