import { createSlice } from '@reduxjs/toolkit';

const initialData = {
  open: false,
  message: '',
  type: 'info', // can be 'success', 'error', 'warning', 'info'
  duration: 5000,
}

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState: initialData,
  reducers: {
    showSnackbar: (state, action) => {
      const { message, type = 'info', duration = 5000 } = action.payload;
      state.open = true;
      state.message = message;
      state.type = type;
      state.duration = duration;
    },
    closeSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, closeSnackbar } = snackbarSlice.actions;
export default snackbarSlice.reducer;