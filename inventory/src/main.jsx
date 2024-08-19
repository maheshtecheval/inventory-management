import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import Footer from "./components/Footer.jsx";

createRoot(document.getElementById("root")).render(
  <>
    <StrictMode>
      <App />
      <Footer />
    </StrictMode>
    <ToastContainer autoClose={1500} closeOnClick />
  </>
);
