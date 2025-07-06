import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import Nav from "./Nav";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Nav />
    <App />
  </StrictMode>
);
