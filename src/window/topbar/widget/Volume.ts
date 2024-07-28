const audio = await Service.import("audio")

export default () => {
    const icons = {
        101: "overamplified",
        67: "high",
        34: "medium",
        1: "low",
        0: "muted",
    }

    function getVolumeIcon() {
        const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find(
            threshold => threshold <= audio.speaker.volume * 100)

        return `audio-volume-${icons[icon]}-symbolic`
    }

    function getMicIcon() {
        const icon = audio.microphone.is_muted ? "muted" : "medium";

        return `microphone-sensitivity-${icon}-symbolic`
    }

    const volumeDisplayIcon = Widget.Icon({
        icon: Utils.watch(getVolumeIcon(), audio.speaker, getVolumeIcon),
    })

    const micDisplayIcon = Widget.Icon({
        icon: Utils.watch(getMicIcon(), audio.microphone, getMicIcon),
    })

    const valueLabel = Widget.Label({
        setup: self => self.hook(audio.speaker, () => {
            self.label = (audio.speaker.volume || 0)
        }),
        label: audio.speaker.bind("volume").as(vol => `${Math.floor(vol * 100)}`),
    })

    return Widget.Button({
        class_name: "text-highlight",
        child: Widget.Box({
            spacing: 5,
            children: [micDisplayIcon, volumeDisplayIcon, valueLabel],
        })
    })
}



