import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice';
import account from '../../reducer/index';

const store = configureStore({
  reducer: {
    theme: themeSlice,
    account:account,
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
