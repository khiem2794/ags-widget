import options from "src/options"
import LogoDisplay from "./widget/LogoDisplay"
import WorkspaceDisplay from "./widget/WorkspaceDisplay"
import DateTimeDisplay from "./widget/DateTimeDisplay"
import WarpDisplay from "./widget/WarpDisplay"
import VolumeDisplay from "./widget/VolumeDisplay"
import CpuUsageDisplay from "./widget/CpuUsageDisplay"
import RamUsageDisplay from "./widget/RamUsageDisplay"

export default (monitor: number) => Widget.Window({
    monitor,
    class_name: "transparent",
    name: `topbar${monitor}`,
    exclusivity: "exclusive",
    anchor: [ "top", "left", "right"],
    child: Widget.CenterBox({
        css: "min-width: 2px; min-height: 2px;",
        start_widget: Widget.Box({
            spacing: 6,
            children: [
                LogoDisplay(),
                WorkspaceDisplay(),
            ],
        }),
        center_widget: Widget.Box({
            children: [ DateTimeDisplay() ],
        }),
        end_widget: Widget.Box({
            spacing: 6,
            hpack: "end",
            children: [ 
                WarpDisplay(), 
                VolumeDisplay(),
                CpuUsageDisplay(),
                RamUsageDisplay(),
            ],
        }),
    }),
})
