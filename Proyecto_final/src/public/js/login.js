document.addEventListener("DOMContentLoaded", () => {
  const formLogin = document.getElementById("loginForm");

  formLogin.addEventListener("submit", async (e) => {
    //La e es de event (el evento)
    e.preventDefault(); //Previene el comportamiento por defecto del formulario,
    //que sería enviar una solicitud HTTP y recargar la página.

    const formData = new FormData(e.target); //Instancia FormData, que crea un conjunto de pares
    // clave/valor que representan los campos del formulario y sus valores. (fromData es objeto)

    const userData = Object.fromEntries(formData); //Convierte formData a un objeto simple.
    //Sería como "crea objeto a partir de la entradas" del formulario.

    try {
      const response = await fetch("/api/sessions/login", {
        method: "POST", //Envía solicitud POST al endpoint.

        headers: {
          "Content-Type": "application/json",
        }, //En un header Content-Type especifica que el contenido de la solicitud es JSON.

        body: JSON.stringify(userData),
        //Datos del formulario en el cuerpo de la solicitud fetch (convertidos a JSON)
      });

      const data = await response.json();
    } catch (error) {
      console.log(error);
    }
  });
});
