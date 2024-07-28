export default () => {
    let ramUsageVar = Variable(0);

    const valueLabel = Widget.Label({
        setup: (self) => self.poll(3000, () => Utils.execAsync(['bash', '-c', `LANG=C free | awk '/^Mem/ {printf("%.2f\\n", ($3/$2) * 100)}'`])
            .then((output) => {
                ramUsageVar.setValue(Math.round(Number(output)));
            }).catch(print)),
        label: ramUsageVar.bind().as(v => `${v}%`),
    });

    const displayIcon = Widget.Icon({
        icon: 'power-profile-balanced-rtl-symbolic',
    })

    let widget = Widget.Button({
        class_name: "text-highlight",
        child: Widget.Box({
            spacing: 5,
            children: [displayIcon, valueLabel],
        })
    });

    return widget;
}