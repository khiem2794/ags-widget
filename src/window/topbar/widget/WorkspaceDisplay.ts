import Gdk from "types/@girs/gdk-3.0/gdk-3.0"

const hyprland = await Service.import("hyprland")

function ClientTitle() {
    return Widget.Label({
        label: hyprland.active.client.bind("title").as(t => `${t} `),
    })
}

export default () => {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces")
        .as(ws => ws.map(({ id }) => Widget.Button({
            child: Widget.Label(`${id}`),
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            on_hover: (e: Gdk.Event) => {
                print(`hover ${id}`)
                let r = e.get_button().at(0);
            }
        })))

    const workspaceWidget = Widget.Box({
        class_name: "bg-brown",
        children: workspaces,
    })

    return Widget.Box({
        class_name: "",
        children: [
            workspaceWidget,
            ClientTitle(),
        ],
    })
}
