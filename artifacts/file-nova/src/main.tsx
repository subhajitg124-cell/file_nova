import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createHead, UnheadProvider } from "@unhead/react/client";
import App from "./App";
import "./index.css";
import "./styles/eventThemes.css";
import "./lib/errorHandler";

const head = createHead();

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
    <UnheadProvider head={head}>
      <App />
    </UnheadProvider>
  </GoogleOAuthProvider>
);
