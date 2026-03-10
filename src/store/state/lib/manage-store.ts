import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type STATE = {
    currentId: number;
}

type ACTION = {
    value: number;
}

const initialState: STATE = {
    currentId: 0
}

const tableCurrentIdHandler = createSlice({
    name: "table-current-id",
    initialState,
    reducers: {
        setTableCurrentId(state: STATE, action: PayloadAction<ACTION>) {
            state.currentId = action.payload.value;
        }
    }
});

export const {setTableCurrentId} = tableCurrentIdHandler.actions;
export default tableCurrentIdHandler.reducer;