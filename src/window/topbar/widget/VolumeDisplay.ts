const audio = await Service.import("audio")

export default () => {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    function getIcon() {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100)

        return `audio-volume-${icons[icon]}-symbolic`
    }

    const displayIcon = Widget.Icon({
        icon: Utils.watch(getIcon(), audio.speaker, getIcon),
    })

    const valueLabel = Widget.Label({
        setup: self => self.hook(audio.speaker, () => {
            self.label = (audio.speaker.volume || 0)
        }),
        label: audio.speaker.bind("volume").as(vol => ` ${Math.floor(vol * 100)}`),
    })

    return Widget.Button({
        class_name: "volume",
        child: Widget.Box({
            children: [displayIcon, valueLabel],
        })
    })
}



