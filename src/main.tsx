import { createRoot } from "react-dom/client";
import { RefreshProvider } from "@/contexts/RefreshContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <RefreshProvider>
    <App />
  </RefreshProvider>
);
