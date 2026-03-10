import { configureStore } from "@reduxjs/toolkit";
import tableCurrentId from "../state/lib/manage-store";

const storeConfig = configureStore({
    reducer: {
        tableCurrentId
    }
});

export type RootState = ReturnType<typeof storeConfig.getState>;
export type AppDispatch = typeof storeConfig.dispatch;
export default storeConfig;