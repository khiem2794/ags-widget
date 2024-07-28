export default () => {
    let cpuUsageVar = Variable(0);

    const valueLabel = Widget.Label({
        setup: (self) => self.poll(3000, () => Utils.execAsync(['bash', '-c', "LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'"])
            .then((output) => {
                cpuUsageVar.setValue(Math.round(Number(output)));
                // self.label = `󰍛 ${Math.round(Number(output))}%`;
            }).catch(print)),
        label: cpuUsageVar.bind().as(v => `${v}%`),
    });

    const displayIcon = Widget.Icon({
        icon: 'applications-electronics-symbolic',
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