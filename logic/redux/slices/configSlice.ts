import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  config: any;
};

const initialState: StateProps = {
  config: null,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    configResult: (state: StateProps, action: any) => {
      state.config = action?.payload?.envConfig;
    },
  },
});

export const { configResult } = configSlice.actions;
export default configSlice.reducer;
