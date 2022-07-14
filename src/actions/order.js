import {AMOUNT_SET, DIRECTION_SET, TYPE_SET, ORDER_LIST_SET} from "../constants/order";

export const setType = (value) => {
    return{
        type: TYPE_SET,
        value,
    }
}

export const setDirection = (value) => {
    return{
        type: DIRECTION_SET,
        value,
    }
}

export const setAmount = (value) => {
    return{
        type: AMOUNT_SET,
        value,
    }
}

export const setOrders = (list) => {
    return{
        type: ORDER_LIST_SET,
        list,
    }
}