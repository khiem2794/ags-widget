import "src/lib/session"
import "src/style/style"
import init from "src/lib/init"
import options from "src/options"
import Bar from "src/widget/bar/Bar"
import Launcher from "src/widget/launcher/Launcher"
import NotificationPopups from "src/widget/notifications/NotificationPopups"
import OSD from "src/widget/osd/OSD"
import Overview from "src/widget/overview/Overview"
import PowerMenu from "src/widget/powermenu/PowerMenu"
import ScreenCorners from "src/widget/bar/ScreenCorners"
import SettingsDialog from "src/widget/settings/SettingsDialog"
import Verification from "src/widget/powermenu/Verification"
import { forMonitors } from "src/lib/utils"
import { setupQuickSettings } from "src/widget/quicksettings/QuickSettings"
import { setupDateMenu } from "src/widget/datemenu/DateMenu"

import TopBar from "./window/topbar/TopBar"

App.config({
    onConfigParsed: () => {
        // setupQuickSettzings()
        // setupDateMenu()
        // init()
    },
    closeWindowDelay: {
        "launcher": options.transition.value,
        "overview": options.transition.value,
        "quicksettings": options.transition.value,
        "datemenu": options.transition.value,
    },
    windows: () => [
        ...forMonitors(TopBar),
        // ...forMonitors(Bar),
        // ...forMonitors(NotificationPopups),
        // ...forMonitors(ScreenCorners),
        // ...forMonitors(OSD),
        // Launcher(),
        // Overview(),
        // PowerMenu(),
        // SettingsDialog(),
        // Verification(),
    ],
})
