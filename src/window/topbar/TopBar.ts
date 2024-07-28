import options from "src/options"
import LogoDisplay from "./widget/Logo"
import WorkspaceDisplay from "./widget/Workspace"
import DateTimeDisplay from "./widget/DateTime"
import VolumeDisplay from "./widget/Volume"
import CpuUsageDisplay from "./widget/CpuUsage"
import RamUsageDisplay from "./widget/MemoryUsage"
import BatteryUsageDisplay from "./widget/BatteryUsage"
import BacklightDisplay from "./widget/Backlight"
import SystemTrayDisplay from "./widget/SystemTray"

export default (monitor: number) => Widget.Window({
    monitor,
    class_name: "bg-brown color-highlight p-0px",
    name: `topbar${monitor}`,
    exclusivity: "exclusive",
    anchor: ["top", "left", "right"],
    child: Widget.CenterBox({
        start_widget: Widget.Box({
            spacing: 0,
            children: [
                LogoDisplay(),
                WorkspaceDisplay(),
            ],
        }),
        center_widget: Widget.Box({
            children: [DateTimeDisplay()],
        }),
        end_widget: Widget.Box({
            spacing: 15,
            hpack: "end",
            children: [
                BacklightDisplay(),
                VolumeDisplay(),
                BatteryUsageDisplay(),
                CpuUsageDisplay(),
                RamUsageDisplay(),
                SystemTrayDisplay(),
            ],
        }),
    }),
})
