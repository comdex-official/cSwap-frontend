import * as PropTypes from "prop-types";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { setDarkTheme } from "../../actions/theme";
import { SvgIcon } from "../common";

const ThemeToggle = ({ isDarkMode, setDarkTheme }) => {
  useEffect(() => {
    const initialTheme = () => {
      if (localStorage.getItem("isDarkMode") === "false") {
        document.body.classList.remove("dark-mode");
        setDarkTheme(false);
      } else {
        document.body.classList.add("dark-mode");
      }
    };

    initialTheme();
  }, [setDarkTheme]);

  const checkboxHandle = () => {
    if (isDarkMode) {
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
    }

    setDarkTheme(!isDarkMode);
    localStorage.setItem("isDarkMode", !isDarkMode);
  };

  return (
    <div className="theme-toogle">
      <div onClick={checkboxHandle} className="theme-icons">
        <SvgIcon
          name={
            localStorage.getItem("isDarkMode") === "false"
              ? "dark-theme"
              : "light-theme"
          }
        />
      </div>
    </div>
  );
};

ThemeToggle.propTypes = {
  setDarkTheme: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
  lang: PropTypes.string.isRequired,
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    isDarkMode: state.theme.theme.darkThemeEnabled,
  };
};

const actionsToProps = {
  setDarkTheme,
};

export default connect(stateToProps, actionsToProps)(ThemeToggle);
