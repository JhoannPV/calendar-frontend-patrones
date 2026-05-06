import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        isDateModalOpen: false,
        theme: getInitialTheme()
    },
    reducers: {
        onOpenDateModal: (state) => {
            state.isDateModalOpen = true;
        },
        onCloseDateModal: (state) => {
            state.isDateModalOpen = false;
        },
        onToggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', state.theme);
        },
        onSetTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        }
    }
});

// Action creators are generated for each case reducer function
export const { onOpenDateModal, onCloseDateModal, onToggleTheme, onSetTheme } = uiSlice.actions;