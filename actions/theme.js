import { TOGGLE_DARK_THEME } from "../constants/theme";

export const setDarkTheme = (value) => {
  return {
    type: TOGGLE_DARK_THEME,
    value,
  };
};
