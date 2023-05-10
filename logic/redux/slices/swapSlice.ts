import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  params: any;
};

const initialState: StateProps = {
  params: {},
};

const swapSlice = createSlice({
  name: 'swap',
  initialState,
  reducers: {
    setParams: (state: StateProps, action: any) => {
      state.params = action?.payload;
    },
  },
});

export const { setParams } = swapSlice.actions;
export default swapSlice.reducer;
