import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducer/authReducer";
import postReducer from "./reducer/postReducer";
/**
 *
 * store for state management  with redux
 * submit action
 * Handle actiion in it's reducer
 * Register Heren -> Reducer
 */


export const store = configureStore ({
  reducer: {
    auth: authReducer,
    postReducer: postReducer,
  }
})
