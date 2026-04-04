import { StoreGlobal } from "../../store";

type AppStore = ReturnType<typeof StoreGlobal.getInstance>

export type RootState = ReturnType<AppStore["getState"]>

export interface LoginParams {
    email: string;
    password: string;
}

export interface RegisterParams {
    name: string;
    email: string;
    password: string;
}

export interface ErrorResponse {
    response: {
        data?: {
            error: string
        }
    }
}

export interface ErrorResponseLogin {
    response: {
        data?: {
            errors: {
                email: {
                    msg: string
                },
                password: {
                    msg: string
                },
            }
        }
    }
}

export interface ErrorResponseRegister {
    response: {
        data?: {
            errors: {
                name: {
                    msg: string
                },
                email: {
                    msg: string
                },
                password: {
                    msg: string
                },
            }
        }
    }
}