import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
  pairs: {};
  appAssetMap: {};
  assetDenom: {
     list: [],
    assetDenomMap: {},
  };
  map: any;
  pairId: null;
  pair: {};
};

const initialState: StateProps = {
  pairs: {},
  appAssetMap: {},
  assetDenom: {
    list: [],
    assetDenomMap: {},
  },
  map: {},
  pairId: null,
  pair: {},
};

const assetSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    setPairs: (state: StateProps, action: any) => {
      state.pairs = action?.payload;
    },
    setPairId: (state: StateProps, action: any) => {
      state.pairId = action?.payload;
    },

    setAssets: (state: StateProps, action: any) => {
      
      const  list  = action.payload;
      
      const assetDenomMap = list?.reduce((map: any, obj: any) => {
        map[obj?.denom] = obj;
        return map;
      }, {});

      // state.assetDenom = {
      //   ...state.assetDenom,
      //   list,
      //   map: assetDenomMap,
      //   assetDenomMap: assetDenomMap,
      // };
      state.assetDenom = {
        ...state.assetDenom,
        list:list,
        assetDenomMap: assetDenomMap,
      };
    },
    setAppAssets: (state: StateProps, action: any) => {
      const { list, pagination } = action.payload;
      const assetDenomMap = list?.reduce((map: any, obj: any) => {
        map[obj?.denom] = obj;
        return map;
      }, {});
      state.appAssetMap = {
        ...state.appAssetMap,
        list,
        pagination,
        map: assetDenomMap,
      };
    },
  },
});

export const { setPairs, setPairId, setAssets, setAppAssets } =
  assetSlice.actions;
export default assetSlice.reducer;
