import { clock } from "src/lib/variables"
import PanelButton from "../PanelButton"
import options from "src/options"

const { format, action } = options.bar.date
const time = Utils.derive([clock, format], (c, f) => c.format(f) || "")

export default () => PanelButton({
    window: "datemenu",
    on_clicked: action.bind(),
    child: Widget.Label({
        justification: "center",
        label: time.bind(),
    }),
})
