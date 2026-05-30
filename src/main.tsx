import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/pt-serif/400.css";
import "@fontsource/pt-serif/400-italic.css";
import "@fontsource/pt-serif/700.css";
import "@fontsource/pt-sans/400.css";
import "@fontsource/pt-sans/700.css";
import "@fontsource/pt-mono/400.css";
import { Deck } from "./presentation/Deck";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck />
  </StrictMode>
);
