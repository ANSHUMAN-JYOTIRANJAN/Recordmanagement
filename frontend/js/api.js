(function () {
  const localHostnames = ["localhost", "127.0.0.1", "[::1]"];
  const isLocalFrontend =
    window.location.protocol === "file:" ||
    (localHostnames.includes(window.location.hostname) &&
      window.location.port !== "5000");
  const defaultApiBaseUrl = isLocalFrontend
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`;
  const apiBaseUrl = (window.API_BASE_URL || defaultApiBaseUrl).replace(
    /\/+$/,
    "",
  );

  async function apiRequest(path, options) {
    const requestOptions = options || {};
    const headers = new Headers(requestOptions.headers || {});
    const token = localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (
      requestOptions.body !== undefined &&
      !(requestOptions.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    let response;
    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        ...requestOptions,
        headers,
      });
    } catch (error) {
      throw new Error(
        "Unable to reach the backend. Confirm that the API server is running.",
      );
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error("The backend returned an invalid response.");
    }

    if (!response.ok) {
      if (response.status === 401 && !path.startsWith("/auth/")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        window.location.href = "login.html";
      }

      throw new Error(
        (data && data.message) || `Request failed (${response.status}).`,
      );
    }

    return data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  }

  function protectPage() {
    if (!localStorage.getItem("token")) {
      window.location.href = "login.html";
      return false;
    }

    return true;
  }

  window.apiRequest = apiRequest;
  window.logout = logout;
  window.protectPage = protectPage;
  window.getCurrentUser = function () {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read saved user information:", error);
      return null;
    }
  };
})();
