const systemtray = await Service.import('systemtray')

const WarpWidget = () => {

    let warpStatusVar = Variable(0);

    const indicatorLabel = Widget.Label({
        setup: (self) => self.poll(3000, () => Utils.execAsync(['bash', '-c', `warp-cli status | grep Status | awk '{print $3}' | sed 's/\\.//g'`])
            .then((output) => {
                switch (output.toLowerCase()) {
                    case 'connected':
                        warpStatusVar.setValue(1);
                        break;
                    case 'connecting':
                        warpStatusVar.setValue(2);
                        break;
                    case 'disconnected':
                        warpStatusVar.setValue(3);
                        break;

                    default:
                        warpStatusVar.setValue(-1);
                }
            }).catch(print)),
        label: warpStatusVar.bind().as(v => {
            switch (v) {
                case 1:
                    return '󰅠';
                case 2:
                    return '󱋖';
                case 3:
                    return '';
                default:
                    return '?';
            }
        }),
    });
    let widget = Widget.Button({
        class_name: "fs-10px bg-tan text-brown",
        on_clicked: self => {
            Utils.execAsync(['bash', '-c', `warp-cli connect`]);
        },
        on_secondary_click: self => {
            Utils.execAsync(['bash', '-c', `warp-cli disconnect`]);
        },
        child: Widget.Box({
            spacing: 5,
            children: [indicatorLabel],
        })
    });

    return widget;
}

export default () => {
    const items = systemtray.bind("items")
        .as(items => items.map(item => {
            if (item.menu !== undefined) {
                item.menu["class_name"] = "systray-menu";
            }
            return Widget.Button({
                child: Widget.Icon({
                    class_name: "bg-tan",
                    icon: item.bind("icon")
                }),
                // on_primary_click: (_, event) => item.activate(event),
                on_secondary_click: (_, event) => item.openMenu(event),
                tooltip_markup: item.bind("tooltip_markup"),
            })
        }))

    const trayBox = Widget.Box({
        spacing: 10,
        class_name: "bg-tan text-brown",
        children: items,
    })
    return Widget.Box({
        spacing: 10,
        class_name: "bg-tan px-5px",
        children: [WarpWidget(), trayBox],
    })
}
