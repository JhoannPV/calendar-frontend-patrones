import { BrowserRouter } from "react-router"
import { AppRouter } from "./router"
import { Provider } from "react-redux"
import { StoreGlobal } from "./store"

export const CalendarApp = () => {
    return (
        <Provider store={StoreGlobal.getInstance()}>
            <BrowserRouter>
                <AppRouter />
            </BrowserRouter>
        </Provider>
    )
}
