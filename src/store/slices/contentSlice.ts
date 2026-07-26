import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type ContentEntry = { _id: string; slug: string; title: string; data: Record<string, unknown>; published: boolean };
type Status = "idle" | "loading" | "succeeded" | "failed";
type ContentState = { collections: Record<string, ContentEntry[]>; status: Record<string, Status>; error: Record<string, string | undefined> };

export const fetchCollection = createAsyncThunk<ContentEntry[], string, { state: { content: ContentState } }>(
  "content/fetchCollection",
  async (collection) => {
    const response = await fetch(`/api/cms/${collection}`);
    if (!response.ok) throw new Error(`Unable to load ${collection}`);
    return response.json() as Promise<ContentEntry[]>;
  },
  { condition: (collection, { getState }) => {
    const status = getState().content.status[collection];
    return status !== "loading" && status !== "succeeded";
  } }
);

const initialState: ContentState = { collections: {}, status: {}, error: {} };
const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {},
  extraReducers: (builder) => builder
    .addCase(fetchCollection.pending, (state, action) => { state.status[action.meta.arg] = "loading"; state.error[action.meta.arg] = undefined; })
    .addCase(fetchCollection.fulfilled, (state, action) => { state.status[action.meta.arg] = "succeeded"; state.collections[action.meta.arg] = action.payload; })
    .addCase(fetchCollection.rejected, (state, action) => { state.status[action.meta.arg] = "failed"; state.error[action.meta.arg] = action.error.message; }),
});
export const selectCollection = (collection: string) => (state: { content: ContentState }) => state.content.collections[collection] ?? [];
export default contentSlice.reducer;
