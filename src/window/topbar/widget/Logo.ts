export default () => {
    return Widget.Button({
        class_name: "px-5px",
        child: Widget.Icon("archlinux-logo"),
        on_clicked: self => {
            print("secondary click");
        },
    })
}
