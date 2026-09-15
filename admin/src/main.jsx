import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store";


const appenv = import.meta.env.VITE_APP_ENV || "development"
switch (appenv) {
  case "production":
    document.title = "Shyam Sahayak (Admin Portal)";
    break;

  case "quality":
    document.title = "Shyam Sahayak (Admin Portal)-QAS";
    break;

  case "development":
    document.title = "Shyam Sahayak (Admin Portal)-DEV";
    break;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter basename="/admin">
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
