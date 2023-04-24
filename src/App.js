import { message } from "antd";
import React from "react";
import svgFile from "./assets/images/svg/svg-sprite.svg";
import NavigationBar from "./containers/NavigationBar";
import Router from "./Router";
import SvgSprite from "./utils/SvgSpriteLoader";

message.config({
  maxCount: 2,
});

const App = () => {
  return (
    <>
      <SvgSprite url={svgFile} />
      <div className="main_wrapper">
        <div className="main-container">
          <NavigationBar />
          <Router />
        </div>
      </div>
    </>
  );
};

export default App;
