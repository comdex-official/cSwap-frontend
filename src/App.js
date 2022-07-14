import React from "react";
import Router from "./Router";
import SvgSprite from "./utils/SvgSpriteLoader";

import "./app.less";

import NavigationBar from "./containers/NavigationBar";
import SideBar from "./containers/SideBar";
import svgFile from "./assets/images/svg/svg-sprite.svg";
import {message} from 'antd';

message.config({
    maxCount: 2,
});

const App = () => {
  return (
    <>
      <SvgSprite url={svgFile} />
      <div className="main_wrapper">
        <SideBar />
        <div className="main-container">
          <NavigationBar />
          <Router />
        </div>
      </div>
    </>
  );
};

export default App;
