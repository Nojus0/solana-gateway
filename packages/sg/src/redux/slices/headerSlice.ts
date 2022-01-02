import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface IHeaderState {}

export const headerSlice = createSlice({
  name: "header",
  initialState: {},
  reducers: {},
});

export const selectHeader = (state: RootState) => state.headerSlice;
