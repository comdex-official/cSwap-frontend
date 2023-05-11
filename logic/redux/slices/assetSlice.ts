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
  assetsInPrgoress: any;
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
  assetsInPrgoress: null,
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
    setAssetsInPrgoress: (state: StateProps, action: any) => {
      state.assetsInPrgoress = action?.payload;
    },
  },
});

export const {
  setPairs,
  setPairId,
  setAssets,
  setAppAssets,
  setAssetsInPrgoress,
} = assetSlice.actions;
export default assetSlice.reducer;
