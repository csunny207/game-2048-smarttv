import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SPLASH_TIME } from "../../constants/appConstant";
import "./splash.scss";

const Splash: React.FunctionComponent = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/Game");
    }, SPLASH_TIME);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash">
      <div className="splash__title">2048</div>
      <div className="splash__subtitle">Smart TV Edition</div>
      <div className="splash__loading">Loading...</div>
    </div>
  );
};

export default Splash;
