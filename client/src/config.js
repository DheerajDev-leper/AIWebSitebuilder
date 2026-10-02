const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
export const serverUrl =
  import.meta.env.VITE_SERVER_URL || `http://${host}:8000`;