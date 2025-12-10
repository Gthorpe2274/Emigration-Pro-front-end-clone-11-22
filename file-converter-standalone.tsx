import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import FileConverter from "@/react-app/pages/FileConverter.tsx";
import "@/react-app/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FileConverter />
  </StrictMode>
);

