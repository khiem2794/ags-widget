import { SimpleToggleButton } from "../ToggleButton"
import icons from "src/lib/icons"

const n = await Service.import("notifications")
const dnd = n.bind("dnd")

export const DND = () => SimpleToggleButton({
    icon: dnd.as(dnd => icons.notifications[dnd ? "silent" : "noisy"]),
    label: dnd.as(dnd => dnd ? "Silent" : "Noisy"),
    toggle: () => n.dnd = !n.dnd,
    connection: [n, () => n.dnd],
})
