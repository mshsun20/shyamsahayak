import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../config/axiosInstance.js';

const initialState = {
    user: null,
    // challenge: null,
    isAuthenticated: false,
    loading: true,
    // initialized: false,
    error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
    try {
        const data = await axiosInstance.post('/auth/login', credentials).then(res => res.data);
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

// export const verify = createAsyncThunk('auth/verify', async (credentials, thunkAPI) => {
//     try {
//         const data = await axiosInstance.post('/auth/verify', credentials).then(res => res.data);
//         return data;
//     } catch (err) {
//         return thunkAPI.rejectWithValue(err.response?.data?.message || 'Verification failed');
//     }
// });

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, thunkAPI) => {
    try {
        const data = await axiosInstance.get('/auth/session').then(res => res.data);
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Not authenticated');
    }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        const data = await axiosInstance.post('/auth/logout').then(res => res.data);
        return data;
    } catch (err) {
        return thunkAPI.rejectWithValue(err.response?.data?.message || 'Logout failed');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuthState(state) {
            state.user = null;
            // state.challenge = null;
            state.isAuthenticated = false;
            state.loading = false;
            // state.initialized = true;
            state.error = null;
        },
        // resetChallenge(state) {
        //     state.challenge = null;
        // }
    },

    extraReducers: (builder) => {
        builder
        
        //-----------------------------------
        // LOGIN
        //-----------------------------------
        .addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        })

        .addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            // state.challenge = true;
            state.user = action.payload.data;
            state.isAuthenticated = true;
            state.error = null;
        })

        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            // state.challenge = null;
            state.user = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        })

        //-----------------------------------
        // SESSION
        //-----------------------------------
        .addCase(checkAuth.pending, (state) => {
            state.loading = true;
        })

        .addCase(checkAuth.fulfilled, (state, action) => {
            state.loading = false;
            // state.initialized = true;
            state.isAuthenticated = true;
            state.user = action.payload.data;
            state.error = null;
        })

        .addCase(checkAuth.rejected, (state, action) => {
            state.loading = false;
            // state.initialized = true;
            state.user = null;
            // state.challenge = null;
            state.isAuthenticated = false;
            state.error = action.payload;
        })

        //-----------------------------------
        // LOGOUT
        //-----------------------------------
        .addCase(logout.fulfilled, (state) => {
            state.user = null;
            // state.challenge = null;
            state.isAuthenticated = false;
            state.loading = false;
            // state.initialized = true;
            state.error = null;
        })
        
        .addCase(logout.rejected, (state) => {
            state.user = null;
            // state.challenge = null;
            state.isAuthenticated = false;
            state.loading = false;
            // state.initialized = true;
        });

    }

});

export const {
    clearAuthState,
    // resetChallenge,
} = authSlice.actions;

export default authSlice.reducer;