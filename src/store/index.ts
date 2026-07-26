import { configureStore } from "@reduxjs/toolkit";
import contentReducer from "./slices/contentSlice";
import themeReducer from "./slices/themeSlice";

export const store = configureStore({ reducer: { content: contentReducer, theme: themeReducer } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
