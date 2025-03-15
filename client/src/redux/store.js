import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import userReducer from "./userSlice";
import submissionReducer from "./slices/submissionSlice";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  app: userReducer,
  submissions: submissionReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/FLUSH",
          "persist/PAUSE",
          "persist/DELETE",
        ],
        ignoredPaths: ["persist", "rehydrate"],
      },
    }),
});

export const persistor = persistStore(store);