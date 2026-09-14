import { combineReducers, configureStore } from '@reduxjs/toolkit';
import storageImport from 'redux-persist/lib/storage';
const storage = storageImport.default ?? storageImport;
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import snackbarReducer from './slices/snackbarSlice';
import authReducer from './slices/authSlice';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: [
        'snackbar',
    ],
};

// console.log("Storage Object:", storage);
// console.log("getItem:", storage?.getItem);

const appReducer = combineReducers({
    auth: authReducer,
    snackbar: snackbarReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/logout/fulfilled') {
        state = undefined;
    }
    return appReducer(state, action);
};

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                FLUSH,
                REHYDRATE,
                PAUSE,
                PERSIST,
                PURGE,
                REGISTER,
            ],
        },
    }),
});

export const persistor = persistStore(store);

export default store;