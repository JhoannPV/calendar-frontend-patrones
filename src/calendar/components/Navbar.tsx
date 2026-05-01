import { useNavigate } from "react-router";
import { useAuthStore } from "../../hooks";

interface UserInfo {
    name: string;
    id: string;
}

export const Navbar = () => {
    const { user, startLogout } = useAuthStore();
    const navigate = useNavigate();
    const userInfo = user as UserInfo;

    const handleGoToMyEvents = () => {
        navigate('/my-events');
    };

    return (
        <div className="navbar navbar-dark bg-dark mb-4 px-4">
            <span className="navbar-brand">
                <i className="fas fa-calendar-alt"></i>
                &nbsp;
                {userInfo.name}
            </span>

            <div className="d-flex gap-2">
                <button className="btn btn-outline-info"
                    onClick={handleGoToMyEvents}
                >
                    <i className="fas fa-list"></i>
                    &nbsp;
                    <span>Mis Eventos</span>
                </button>
                <button className="btn btn-outline-danger"
                    onClick={startLogout}
                >
                    <i className="fas fa-sign-out-alt"></i>
                    &nbsp;
                    <span>Salir</span>
                </button>
            </div>
        </div>
    )
}
