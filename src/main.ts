import { forMonitors } from "src/lib/utils"
import TopBar from "./window/topbar/TopBar"

App.config({
    windows: () => [
        ...forMonitors(TopBar),
    ],
})
