export default () => {
    let cpuUsageVar = Variable(0);

    const valueLabel = Widget.Label({
        setup: (self) => self.poll(3000, () => Utils.execAsync(['bash', '-c', "LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'"])
            .then((output) => {
                cpuUsageVar.setValue(Math.round(Number(output)));
                // self.label = `󰍛 ${Math.round(Number(output))}%`;
            }).catch(print)),
        label: cpuUsageVar.bind().as(v => `󰍛 ${v}%`),
    });

    let widget = Widget.Button({
        class_name: "cpu-usage-display",
        child: Widget.Box({
            children: [valueLabel],
        })
    });

    return widget;
}