// src/store/store.js
// The main Redux Store - this holds ALL global state for the app
// Think of it as a "central database" for the frontend

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    // We can add more slices here later (e.g., projectsSlice, tasksSlice)
  },
});

export default store;
