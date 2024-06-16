import Arch from "./widget/Arch"
import options from "src/options"
import Workspaces from "./widget/Workspaces"
import Date from "./widget/Date"
import Warp from "./widget/Warp"
import VolumeGroup from "./widget/VolumeGroup"

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
                Arch(),
                Workspaces(),
            ],
        }),
        center_widget: Widget.Box({
            children: [ Date() ],
        }),
        end_widget: Widget.Box({
            spacing: 6,
            hpack: "end",
            children: [ Warp(), VolumeGroup() ],
        }),
    }),
})
