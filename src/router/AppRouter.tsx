// src/router/AppRouter.tsx

import { Navigate, Route, Routes } from "react-router"
import { LoginPage } from "../auth";
import { CalendarPage, MyEventsPage } from "../calendar";
import { useAuthStore } from "../hooks";
import { useEffect } from "react";
import { AuthenticatedLayout } from "./AuthenticatedLayout";

export const AppRouter = () => {
    const { status, checkAuthToken } = useAuthStore();

    useEffect(() => {
        if (status === 'checking') {
            checkAuthToken();
        }
    }, [status, checkAuthToken]);

    if (status === 'checking') {
        return (
            <h3>Cargando...</h3>
        )
    }

    return (
        <>
            <Routes>
                {
                    (status === 'not-authenticated')
                        ? (
                            <>
                                <Route path="/auth/*" element={<LoginPage />} />
                                <Route path="/*" element={<Navigate to="/auth/login" />} />
                            </>
                        )
                        : (
                            <>
                                <Route element={<AuthenticatedLayout />}>
                                    <Route index element={<CalendarPage />} />
                                    <Route path="my-events" element={<MyEventsPage />} />
                                </Route>
                                <Route path="/*" element={<Navigate to="/" />} />
                            </>
                        )
                }
            </Routes>
        </>
    )
}