import axios, { type AxiosInstance } from "axios";
import { getEnvVariables } from "../helpers";

const { VITE_API_URL } = getEnvVariables();

export class CalendarApi {
    private static calendarApi: AxiosInstance;

    private constructor() { }

    public static getInstance(): AxiosInstance {
        if (!CalendarApi.calendarApi) {
            CalendarApi.calendarApi = axios.create({
                baseURL: VITE_API_URL,
            });

            // TODO: Configurar interceptores
            CalendarApi.calendarApi.interceptors.request.use(config => {
                config.headers.Authorization = `Bearer ${localStorage.getItem('token') || ''}`;
                return config;
            })
        }
        return CalendarApi.calendarApi;
    }
}