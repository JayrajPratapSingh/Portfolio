import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light";
const themeSlice = createSlice({
  name: "theme",
  initialState: { value: "dark" as Theme },
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => { state.value = action.payload; },
    toggleTheme: (state) => { state.value = state.value === "dark" ? "light" : "dark"; },
  },
});
export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
