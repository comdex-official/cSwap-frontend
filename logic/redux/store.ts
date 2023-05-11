import { configureStore } from '@reduxjs/toolkit';
import themeSlice from './slices/themeSlice';
import configSlice from './slices/configSlice';
import accountSlice from './slices/accountSlice';
import oracleSlice from './slices/oracleSlice';
import assetSlice from './slices/assetSlice';
import swapSlice from './slices/swapSlice';
import liquiditySlice from './slices/liquidity';

const store = configureStore({
  reducer: {
    theme: themeSlice,
    config: configSlice,
    account: accountSlice,
    asset: assetSlice,
    liquidity:liquiditySlice,
    oracle: oracleSlice,
    swap: swapSlice,
  },
  // devTools: process.env.NODE_ENV !== "production",
});

export default store;
