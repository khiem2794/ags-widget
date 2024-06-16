const hyprland = await Service.import("hyprland")

function ClientTitle() {
    return Widget.Label({
        class_name: "client-title",
        label: hyprland.active.client.bind("title").as(t => `${t} `),
    })
}

export default () => {
    const activeId = hyprland.active.workspace.bind("id")
    const workspaces = hyprland.bind("workspaces")
        .as(ws => ws.map(({ id }) => Widget.Button({
            css: "border-radius: 0;",
            on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
            child: Widget.Label(`${id}`),
            class_name: activeId.as(i => `${i === id ? "focused" : ""}`),
        })))

    const workspaceWidget = Widget.Box({
        css: "padding: 0 6px;",
        class_name: "workspaces",
        children: workspaces,
    })

    return Widget.Box({
        css: "background-color: green; border-radius: 10px;",
        children: [
            workspaceWidget,
            ClientTitle(),
        ],
    })
}
