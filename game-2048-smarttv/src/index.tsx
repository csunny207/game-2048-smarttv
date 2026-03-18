import React from "react";
import ReactDOM from "react-dom/client";
import { store } from "./store";
import { HashRouter } from "react-router-dom";
import App from "./App";
import Provider from "react-redux/es/components/Provider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
try {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <HashRouter>
          <App />
        </HashRouter>
      </Provider>
    </React.StrictMode>
  );
} catch (error: any) {
  window.onerror?.(error.message, "ReactRoot", 0, 0, error);
}
