import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice';
import configSlice from './slices/configSlice';
import accountSlice from './slices/accountSlice';
import oracleSlice from './slices/oracleSlice';

const store = configureStore({
  reducer: {
    theme: themeSlice,
    config: configSlice,
    account: accountSlice,
    oracle:oracleSlice
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
