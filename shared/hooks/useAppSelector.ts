import { TypedUseSelectorHook, useSelector } from "react-redux";
import store from "../../logic/redux/store";

// Infer the `RootState` and `AppDispatch` types from the store itself
type RootState = ReturnType<typeof store.getState>;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
