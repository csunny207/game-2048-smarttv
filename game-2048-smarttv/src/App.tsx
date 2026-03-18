import React from "react";
import { Route, Routes } from "react-router-dom";
import Splash from "./pages/Splash";
import Game from "./pages/Game";
import "./assets/styles/index.scss";

const App: React.FunctionComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="Game" element={<Game />} />
    </Routes>
  );
};

export default App;
