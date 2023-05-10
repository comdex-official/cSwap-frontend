import { createSlice } from '@reduxjs/toolkit';

type StateProps = {
    pool: {
        _: {};
        list: [];
        pagination: {};
    };
};

const initialState: StateProps = {
    pool: {
        _: {},
        list: [],
        pagination: {},
    },
};

const liquiditySlice = createSlice({
    name: 'liquidity',
    initialState,
    reducers: {
        setPools: (state: StateProps, action: any) => {
            state.pool = action?.payload;
        },
    },
});

export const { setPools } = liquiditySlice.actions;
export default liquiditySlice.reducer;
