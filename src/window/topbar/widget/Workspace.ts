import Gdk from "types/@girs/gdk-3.0/gdk-3.0"

const hyprland = await Service.import("hyprland")

function ClientTitle() {
    return Widget.Label({
        class_name: "fs-15px ml-5px",
        label: hyprland.active.client.bind("title").as(t => {
            let title = t;
            if (t.length > 50) {
                title = t.substring(0, 20).trim() + "..." + t.substring(t.length - 20, t.length).trim();
            }
            return title;
        }),
    })
}

export default () => {
    const activeId = hyprland.active.workspace.bind("id")
    const default_class = 'px-5px border-0 ';
    const workspaces = hyprland.bind("workspaces")
        .as(ws => ws.map(({ id }) => Widget.Button({
            child: Widget.Label(`${id}`),
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            class_name: activeId.as(i => default_class + `${i === id ? "bg-highlight text-brown" : "bg-brown text-highlight"}`),
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
        class_name: "text-highlight",
        children: [
            workspaceWidget,
            ClientTitle(),
        ],
    })
}
