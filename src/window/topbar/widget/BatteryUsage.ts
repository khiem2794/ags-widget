const battery = await Service.import('battery')

export default () => {
    const percentLabel = Widget.Label({
        label: battery.bind('percent').as(p => `${p}%`),
    });

    let widget = Widget.Button({
        class_name: "text-highlight",
        child: Widget.Box({
            spacing: 3,
            children: [Widget.Icon({ icon: battery.bind('icon_name') }), percentLabel],
        })
    });

    return widget;
}