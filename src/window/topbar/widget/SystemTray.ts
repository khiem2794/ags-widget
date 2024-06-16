export default () => {
    return Widget.Button({
        css: "color: red;",
        child: Widget.Icon("archlinux-logo"),
        on_clicked: self => {
            print("secondary click");
        },
    })
}
