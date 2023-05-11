import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  config: any;
  AssetList:any,
};

const initialState: StateProps = {
  config: null,
  AssetList:null
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    configResult: (state: StateProps, action: any) => {
      state.config = action?.payload?.envConfig;
    },
    AssetList: (state: StateProps, action: any) => {
      state.AssetList = action?.payload?.tokens;
    },
  },
});

export const { configResult,AssetList } = configSlice.actions;
export default configSlice.reducer;
