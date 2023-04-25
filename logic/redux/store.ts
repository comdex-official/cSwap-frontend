import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice';

const store = configureStore({
  reducer: {
    theme: themeSlice,
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
