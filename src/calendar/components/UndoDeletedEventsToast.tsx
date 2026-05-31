import { useEffect } from "react";
import { useCalendarStore } from "../../hooks";
import type { UndoNotification } from "../../store/calendar/calendarSlice";

const TOAST_DURATION_MS = 8000;

const UndoToastItem = ({
    notificationId,
    action,
    count,
    onUndo,
    onDismiss,
}: {
    notificationId: string;
    action: 'delete' | 'update' | 'delete-cascade';
    count: number;
    onUndo: (notificationId: string) => void;
    onDismiss: (notificationId: string) => void;
}) => {
    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            onDismiss(notificationId);
        }, TOAST_DURATION_MS);

        return () => window.clearTimeout(timeoutId);
    }, [notificationId, onDismiss]);

    const isUpdate = action === 'update';
    const title = isUpdate
        ? "Evento actualizado"
        : count === 1
            ? "Evento eliminado"
            : "Eventos eliminados";
    const message = isUpdate
        ? "Puedes deshacer este cambio durante 8 segundos."
        : count === 1
            ? "Puedes deshacer esta acción durante 8 segundos."
            : `Se eliminaron ${count} eventos. Puedes deshacer esta acción durante 8 segundos.`;

    return (
        <div className="alert alert-dark shadow-lg d-flex align-items-center justify-content-between gap-3 mb-0">
            <div>
                <div className="fw-bold">{title}</div>
                <small className="text-light-emphasis">{message}</small>
            </div>
            <div className="d-flex align-items-center gap-2">
                <button type="button" className="btn btn-sm btn-light" onClick={() => onUndo(notificationId)}>
                    Deshacer
                </button>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => onDismiss(notificationId)}>
                    ×
                </button>
            </div>
        </div>
    );
};

export const UndoDeletedEventsToast = () => {
    const { undoNotifications, undoNotification, clearUndoState } = useCalendarStore();

    return (
        <div className="position-fixed bottom-0 end-0 p-3 d-flex flex-column gap-2" style={{ zIndex: 1080 }}>
            {undoNotifications.map((notification: UndoNotification) => {
                return (
                    <UndoToastItem
                        key={notification.id}
                        notificationId={notification.id}
                        action={notification.action}
                        count={notification.events.length}
                        onUndo={undoNotification}
                        onDismiss={clearUndoState}
                    />
                );
            })}
        </div>
    );
};