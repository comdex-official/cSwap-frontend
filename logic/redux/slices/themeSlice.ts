import { createSlice } from '@reduxjs/toolkit';

type ThemeStateProps = {
  theme: string;
};

const initialState: ThemeStateProps = {
  theme: 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state: ThemeStateProps) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
