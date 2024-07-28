import brightness from '../../../service/Brightness';

export default () => {
    const icons = {
        80: "high",
        50: "medium",
        10: "low",
        1: "off",
    }
    let brightnessVar = Variable(0);

    const valueLabel = Widget.Label({
        label: brightness.bind('screen-value').as(v => {
            brightnessVar.setValue(Math.round(v * 100))
            return `${brightnessVar.getValue()}%`;
        })
    });

    function getIcon() {
        const icon = [80, 50, 10, 1].find(threshold => threshold <= brightnessVar.getValue());
        return `display-brightness-${icons[icon]}-symbolic`;
    }

    const displayIcon = Widget.Icon({
        icon: Utils.watch(getIcon(), brightnessVar, getIcon),
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