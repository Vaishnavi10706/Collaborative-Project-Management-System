// src/store/authSlice.js
// Redux Slice for Authentication State
//
// WHAT IS REDUX?
// Redux is a "global state manager". Normally, React state (useState) only lives 
// inside one component. But for things like "is the user logged in?", we need 
// this info available EVERYWHERE in the app. That's what Redux solves.
//
// A "slice" is a small part of the global state - here, just the auth part.

import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  // initialState: what auth looks like before anything happens
  initialState: {
    user: null,        // who is logged in (null = no one)
    token: localStorage.getItem("token") || null, // saved from last session
    isLoggedIn: !!localStorage.getItem("token"),  // true if token exists
  },
  // reducers: functions that UPDATE the state
  reducers: {
    // Called after successful login/register
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;
      // Save token to localStorage so user stays logged in after refresh
      localStorage.setItem("token", action.payload.token);
    },
    // Called when user clicks Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
