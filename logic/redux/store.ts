import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice';
import configSlice from './slices/configSlice';
import accountSlice from './slices/accountSlice';
import oracleSlice from './slices/oracleSlice';
import assetSlice from './slices/assetSlice';

const store = configureStore({
  reducer: {
    theme: themeSlice,
    config: configSlice,
    account: accountSlice,
    oracle: oracleSlice,
    asset: assetSlice,
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
