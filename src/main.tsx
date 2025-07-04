import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Restore route after GitHub Pages redirect from 404.html
if (sessionStorage.redirect) {
  const redirectPath = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.history.replaceState(null, "", redirectPath);
}

// ✅ Mount the app
createRoot(document.getElementById("root")!).render(<App />);

