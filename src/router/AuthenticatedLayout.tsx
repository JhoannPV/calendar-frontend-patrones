import { Outlet } from "react-router";
import { usePushNotifications } from "../hooks";

export const AuthenticatedLayout = () => {
    usePushNotifications();

    return <Outlet />;
};