import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck } from "./presentation/Deck";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck />
  </StrictMode>
);
