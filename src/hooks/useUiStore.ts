import { useDispatch, useSelector } from "react-redux"
import { onCloseDateModal, onOpenDateModal, onToggleTheme } from "../store";
import type { RootState } from ".";


export const useUiStore = () => {
    const dispatch = useDispatch();

    const {
        isDateModalOpen,
        theme,
    } = useSelector((state: RootState) => state.ui);

    const openDateModal = () => {
        dispatch(onOpenDateModal());
    }

    const closeDateModal = () => {
        dispatch(onCloseDateModal());
    }

    const toggleDateModal = () => {
        if (isDateModalOpen) {
            closeDateModal()
        } else {
            openDateModal()
        }
    }

    const toggleTheme = () => {
        dispatch(onToggleTheme());
    }

    return {
        //* Propiedades
        isDateModalOpen,
        theme,

        //* Métodos
        openDateModal,
        closeDateModal,
        toggleDateModal,
        toggleTheme,
    }
}