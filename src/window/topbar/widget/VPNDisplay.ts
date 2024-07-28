// import NM from 'gi://NM';
// const network = await Service.import('network')
// import { VpnConnection } from 'service/network'

// export default () => {

//     const vpnDisplayIcon = Widget.Label({
//         label: network.vpn.bind('activated-connections')
//             .as((m: VpnConnection) => {
//                 return m.id()
//             }),
//     })

//     let widget = Widget.Button({
//         class_name: "",
//         child: Widget.Box({
//             spacing: 3,
//             children: [vpnDisplayIcon],
//         })
//     });

//     return widget;
// }

export default () => {

    let warpStatusVar = Variable(0);

    const indicatorLabel = Widget.Label({
        setup: (self) => self.poll(3000, () => Utils.execAsync(['bash', '-c', `warp-cli status | grep Status | awk '{print $3}' | sed 's/\\.//g'`])
            .then((output) => {
                switch (output.toLowerCase()) {
                    case 'connected':
                        warpStatusVar.setValue(1);
                        break;
                    case 'connecting':
                        warpStatusVar.setValue(2);
                        break;
                    case 'disconnected':
                        warpStatusVar.setValue(3);
                        break;

                    default:
                        warpStatusVar.setValue(-1);
                }
            }).catch(print)),
        label: warpStatusVar.bind().as(v => {
            switch (v) {
                case 1:
                    return '󰅠';
                case 2:
                    return '󱋖';
                case 3:
                    return '';
                default:
                    return '?';
            }
        }),
    });
    let widget = Widget.Button({
        class_name: "fs-10px text-highlight",
        on_clicked: self => {
            Utils.execAsync(['bash', '-c', `warp-cli connect`]);
        },
        on_secondary_click: self => {
            Utils.execAsync(['bash', '-c', `warp-cli disconnect`]);
        },
        child: Widget.Box({
            spacing: 5,
            children: [indicatorLabel],
        })
    });

    return widget;
}
