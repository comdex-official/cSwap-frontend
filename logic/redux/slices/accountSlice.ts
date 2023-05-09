import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  address: string;
  accountName: string;
  accountBalance: [];
};

const initialState: StateProps = {
  address: '',
  accountName: '',
  accountBalance: [],
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
      state.accountBalance = action?.payload;
    },
  },
});

export const { setAccountAddress, setAccountName, setAccountBalances } =
  accountSlice.actions;
export default accountSlice.reducer;
