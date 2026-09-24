import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
// import { BrowserRouter } from "react-router-dom";
// import { store } from "./redux/store";
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import { setupInterceptors } from './config/axiosInstance.js';

setupInterceptors(store);

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
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
