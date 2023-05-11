import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  address: string;
  accountName: string;
  balances:[],

  assetBalance: number;
  poolBalance: any;
  balanceRefetch: null;
};

const initialState: StateProps = {
  address: '',
  accountName: '',
  balances:[],
  assetBalance: 0,
  poolBalance: [],
  balanceRefetch: null,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccountAddress: (state: StateProps, action: any) => {
      state.address = action?.payload;
    },
    setAccountName: (state: StateProps, action: any) => {
      state.accountName = action?.payload;
    },
    setAccountBalances: (state: StateProps, action: any) => {
      
      state.balances = action?.payload;
    },
    setAssetBalance: (state: StateProps, action: any) => {
      state.assetBalance = action?.payload;
    },
    setPoolBalance: (state: StateProps, action: any) => {
      state.poolBalance = action?.payload;
    },
    setBalanceRefresh: (state: StateProps, action: any) => {
      state.balanceRefetch = action?.payload;
    },
  },
});

export const {
  setAccountAddress,
  setAccountName,
  setAccountBalances,
  setAssetBalance,
  setPoolBalance,
  setBalanceRefresh,
} = accountSlice.actions;
export default accountSlice.reducer;
