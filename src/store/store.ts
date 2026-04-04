import { configureStore, type Store } from "@reduxjs/toolkit";
import { authSlice, calendarSlice, uiSlice } from ".";

export class StoreGlobal {
    private static store: Store;

    private constructor() { }

    public static getInstance(): Store {
        if (!StoreGlobal.store) {
            StoreGlobal.store = configureStore({
                reducer: {
                    auth: authSlice.reducer,
                    calendar: calendarSlice.reducer,
                    ui: uiSlice.reducer,
                },
                middleware: (getDefaultMiddleware) => getDefaultMiddleware({
                    serializableCheck: false,
                }),
            });
        }
        return StoreGlobal.store;
    }
}