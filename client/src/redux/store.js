import { configureStore } from "@reduxjs/toolkit";
import useSlice from "./userSlice"

export const store = configureStore({
    reducer:{
        user:useSlice
    }
})