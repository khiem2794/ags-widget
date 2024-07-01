export default () => {
    return Widget.Button({
        label: "Warp: 󰅟",
        on_clicked: self => {
            print("secondary click");
        },
    })
}
