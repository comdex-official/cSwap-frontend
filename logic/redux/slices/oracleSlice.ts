import { List } from 'antd';
import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
    market:
    {
        list: {},
    },
};

const initialState: StateProps = {

    market:
    {
        list: {},
    },
};

const oracleSlice = createSlice({
    name: 'oracle',
    initialState,
    reducers: {
        setMarkets: (state: StateProps, action: any) => {
            
            const list= action?.payload;
            const priceMap = list?.reduce((map: any, obj: any) => {
                map[obj?.denom] = obj;
                return map;
            }, {});

            const data={
                ...state.market,
                list:priceMap,
            }
            state.market=data;

        },


    },
});

export const {
    setMarkets,
} = oracleSlice.actions;
export default oracleSlice.reducer;
