import { addHours } from "date-fns";
import { useAuthStore, useCalendarStore, useUiStore } from "../../hooks";

export const FabAddNew = () => {

    const { isDateModalOpen, openDateModal } = useUiStore();
    const { user } = useAuthStore();
    const { setActiveEvent } = useCalendarStore();

    const currentUser = (
        user &&
        typeof user === 'object' &&
        '_id' in user &&
        'name' in user
    )
        ? { _id: String(user._id), name: String(user.name) }
        : undefined;

    const handleClickNew = () => {
        setActiveEvent({
            title: '',
            notes: '',
            start: new Date(),
            end: addHours(new Date(), 2),
            bgColor: '#fafafa',
            user: currentUser,
        }
        );
        openDateModal();
    }

    return (
        <button
            className="btn btn-primary fab-add show"
            onClick={handleClickNew}
            style={
                {
                    display: isDateModalOpen ? 'none' : ''
                }
            }
        >
            <i className="fas fa-plus"></i>
        </button>
    )
}
