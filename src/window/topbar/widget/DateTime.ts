const date = Variable("", {
    poll: [1000, 'date "+%H:%M, %e %B %Y"'],
})

export default () => {
    return Widget.Button({
        class_name: "text-highlight",
        label: date.bind(),
    })
}
