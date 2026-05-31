import { addHours, differenceInSeconds } from 'date-fns';
import {
    useEffect, useMemo, useRef, useState,
    type ChangeEvent, type SyntheticEvent,
} from 'react';

import Modal from 'react-modal';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import { useCalendarStore, useUiStore, useAuthStore } from '../../hooks';
import {
    CalendarTypeEvent,
    CalendarTypeFactory,
    DirectorEventBuilder,
    categories,
    type CalendarCompleteEventData,
    type CalendarEventData,
    type CategoryKey,
} from '..';

registerLocale('es', es);

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

Modal.setAppElement('#root');

type StartOrEnd = 'start' | 'end';

export const CalendarModal = () => {
    const { activeEvent, setActiveEvent, startSavingEvent, events } = useCalendarStore();
    const { isDateModalOpen, closeDateModal } = useUiStore();
    const { user } = useAuthStore();

    const [formSubmitted, setFormSubmitted] = useState(false);
    const calendarTypeFactoryRef = useRef(new CalendarTypeFactory());

    const [formValues, setFormValues] = useState<CalendarEventData>({
        title: '',
        notes: '',
        start: new Date(),
        end: addHours(new Date(), 2),
    });

    const [category, setCategory] = useState<CategoryKey>('general');

    // COMPOSITE — padre seleccionado
    const [selectedPadre, setSelectedPadre] = useState<string>('');

    // Toggle: ¿este evento actúa como padre (evento mayor sin fechas)?
    const [actAsParent, setActAsParent] = useState(false);

    const activeEventIsParent = useMemo(() => {
        if (!activeEvent?.id) return false;

        const hasNoDate = !activeEvent.start && !activeEvent.end;
        const hasChildren = events.some((e: CalendarCompleteEventData) => e.padre === activeEvent.id);

        return hasNoDate || hasChildren;
    }, [activeEvent, events]);

    // Eventos disponibles como padre: del usuario actual, sin padre propio,
    // y que no sea el mismo evento que se está editando
    const parentOptions = useMemo(() => {
        return events.filter((e: CalendarCompleteEventData) =>
            e.user?.id === (user as { id?: string })?.id &&
            !e.padre &&
            (!e.start && !e.end || events.some((child: CalendarCompleteEventData) => child.padre === e.id)) &&
            e.id !== activeEvent?.id
        );
    }, [events, user, activeEvent?.id]);

    const titleClass = useMemo(() => {
        if (!formSubmitted) return '';
        return formValues.title.length > 0 ? 'is-valid' : 'is-invalid';
    }, [formValues.title, formSubmitted]);

    useEffect(() => {
        if (activeEvent !== null) {
            const timeOut = setTimeout(() => {
                setFormValues({ ...activeEvent });
                setCategory((activeEvent.category as CategoryKey) ?? 'general');
                setSelectedPadre(activeEvent.padre ?? '');
                setActAsParent(activeEventIsParent);
                if (activeEventIsParent) {
                    setCategory('general');
                }
            }, 0);
            return () => clearTimeout(timeOut);
        }
    }, [activeEvent, activeEventIsParent]);

    const onInputChange = ({ target }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormValues({ ...formValues, [target.name]: target.value });
    };

    const onCategoryChange = ({ target }: ChangeEvent<HTMLSelectElement>) => {
        setCategory(target.value as CategoryKey);
    };

    const onDateChange = (event: Date | null, changing: StartOrEnd) => {
        setFormValues({ ...formValues, [changing]: event });
    };

    const onActAsParentChange = (checked: boolean) => {
        setActAsParent(checked);
        if (checked) {
            setCategory('general');
        }
    };

    const onCloseModal = () => {
        closeDateModal();
        setActiveEvent(null);
        setSelectedPadre('');
        setActAsParent(false);
    };

    // Mostrar fechas cuando:
    // - tiene padre seleccionado (subevento) → siempre necesita fechas
    // - no es evento mayor → evento independiente con fechas
    const showDatePickers = selectedPadre !== '' || !actAsParent;

    const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormSubmitted(true);

        if (formValues.title.length <= 0) return;

        if (showDatePickers) {
            const start = formValues.start as Date | null;
            const end = formValues.end as Date | null;

            if (!start || !end) {
                Swal.fire(
                    'Fechas requeridas',
                    'Los sub-eventos e independientes necesitan fecha de inicio y fin',
                    'error'
                );
                return;
            }

            const diff = differenceInSeconds(end, start);
            if (isNaN(diff) || diff <= 0) {
                Swal.fire('Fechas incorrectas', 'La fecha de fin debe ser posterior al inicio', 'error');
                return;
            }
        }

        const calendarType = calendarTypeFactoryRef.current.getCalendarType(category);

        const builderEvent = new DirectorEventBuilder().createEventComplete()
            .setTitle(formValues.title)
            .setNotes(formValues.notes)
            .setStart(showDatePickers ? formValues.start : null)
            .setEnd(showDatePickers ? formValues.end : null)
            .setBgColor(actAsParent ? '#6c757d' : formValues.bgColor)
            .setUser(formValues.user)
            .setId(formValues.id)
            .setPadre(selectedPadre || null)
            .build();

        const calendarEvent: CalendarCompleteEventData =
            new CalendarTypeEvent(builderEvent, calendarType).getEventComplete();

        await startSavingEvent(calendarEvent);
        closeDateModal();
        setActiveEvent(null);
        setFormSubmitted(false);
        setSelectedPadre('');
        setActAsParent(false);
    };

    return (
        <Modal
            isOpen={isDateModalOpen}
            onRequestClose={onCloseModal}
            style={customStyles}
            contentLabel="Evento"
            className="modal"
            overlayClassName="modal-fondo"
            closeTimeoutMS={200}
        >
            <h1>{activeEvent?.id ? 'Editar evento' : 'Nuevo evento'}</h1>
            <hr />
            <form className="container" onSubmit={onSubmit}>

                {/* Toggle "Es evento mayor" — se oculta si ya eligió un padre */}
                {selectedPadre === '' && (
                    <div className="form-check form-switch mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="actAsParentSwitch"
                            checked={actAsParent}
                            disabled={activeEventIsParent}
                            onChange={(e) => onActAsParentChange(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="actAsParentSwitch">
                            <strong>Este es un evento mayor</strong>
                            <small className="d-block text-muted">
                                Los eventos mayores no tienen fecha — agrupan sub-eventos
                                {activeEventIsParent ? ' y no se puede cambiar este estado al editarlo.' : ''}
                            </small>
                        </label>
                    </div>
                )}

                {/* Aviso cuando es evento mayor */}
                {!showDatePickers && (
                    <div className="alert alert-info py-2 mb-3">
                        <i className="fas fa-layer-group me-2"></i>
                        <strong>Evento mayor</strong> — no lleva fecha de inicio ni fin.
                        Los sub-eventos que lo integren sí tendrán sus propias fechas.
                    </div>
                )}

                {/* Fechas — solo si NO es evento mayor */}
                {showDatePickers && (
                    <>
                        <div className="form-group mb-2">
                            <label>Fecha y hora inicio</label>
                            <br />
                            <DatePicker
                                selected={formValues.start as Date}
                                onChange={(event: Date | null) => onDateChange(event, 'start')}
                                className="form-control"
                                dateFormat="Pp"
                                showTimeSelect
                                locale="es"
                                timeCaption="Hora"
                                minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>

                        <div className="form-group mb-2">
                            <label>Fecha y hora fin</label>
                            <br />
                            <DatePicker
                                minDate={formValues.start as Date}
                                selected={formValues.end as Date}
                                onChange={(event: Date | null) => onDateChange(event, 'end')}
                                className="form-control"
                                dateFormat="Pp"
                                showTimeSelect
                                locale="es"
                                timeCaption="Hora"
                            />
                        </div>
                        <hr />
                    </>
                )}

                <div className="form-group mb-2">
                    <label>Título y notas</label>
                    <input
                        type="text"
                        className={`form-control ${titleClass}`}
                        placeholder="Título del evento"
                        name="title"
                        autoComplete="off"
                        value={formValues.title}
                        onChange={onInputChange}
                    />
                    <small className="form-text text-muted">Una descripción corta</small>
                </div>

                <div className="form-group mb-2">
                    <textarea
                        className="form-control"
                        placeholder="Notas"
                        rows={3}
                        name="notes"
                        value={formValues.notes}
                        onChange={onInputChange}
                    />
                    <small className="form-text text-muted">Información adicional</small>
                </div>

                <div className="form-group mb-3">
                    <label>Categoría</label>
                    <select
                        className="form-select"
                        name="category"
                        value={category}
                        onChange={onCategoryChange}
                        disabled={actAsParent}
                    >
                        {(Object.keys(categories) as CategoryKey[]).map((key) => (
                            <option key={key} value={key}>
                                {categories[key]}
                            </option>
                        ))}
                    </select>
                    <small className="form-text text-muted">
                        {actAsParent ? 'Los eventos mayores usan la categoría General por defecto' : 'Clasifica el evento'}
                    </small>
                </div>

                {/* COMPOSITE — selector de padre AL FINAL, se oculta si es evento mayor */}
                {!actAsParent && (
                    <div className="form-group mb-3">
                        <label><strong>Agrupar bajo un evento mayor</strong></label>
                        <select
                            className="form-select"
                            value={selectedPadre}
                            onChange={(e) => setSelectedPadre(e.target.value)}
                        >
                            <option value="">— Sin grupo —</option>
                            {parentOptions.map((ev: CalendarCompleteEventData) => (
                                <option key={ev.id} value={ev.id}>
                                    {ev.title}
                                </option>
                            ))}
                        </select>
                        <small className="form-text text-muted">
                            Si eliges un evento mayor, este se convierte en sub-evento
                        </small>
                    </div>
                )}

                <button type="submit" className="btn btn-outline-primary btn-block w-100">
                    <i className="far fa-save"></i>
                    <span> Guardar</span>
                </button>

            </form>
        </Modal>
    );
};