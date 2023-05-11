import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
    pools: {
        list: any;
        pagination: any;
    };
};

const initialState: StateProps = {
    pools: {
        list: [],
        pagination: {},
    },
};

const liquiditySlice = createSlice({
    name: 'liquidity',
    initialState,
    reducers: {
        setPools: (state: StateProps, action: any) => {

            const { pools, pagination } = action?.payload
            state.pools= {
                list : pools,
                pagination:pagination
            }
        },
    },
});

export const { setPools } = liquiditySlice.actions;
export default liquiditySlice.reducer;
