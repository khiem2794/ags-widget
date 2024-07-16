// .config/ags/src/lib/utils.ts
import Gdk2 from "gi://Gdk";
import GLib from "gi://GLib?version=2.0";
function forMonitors(widget) {
  const n = Gdk2.Display.get_default()?.get_n_monitors() || 1;
  return range(n, 0).flatMap(widget);
}
function range(length, start = 1) {
  return Array.from({ length }, (_, i) => i + start);
}

// .config/ags/src/window/topbar/widget/LogoDisplay.ts
var LogoDisplay_default = () => {
  return Widget.Button({
    css: "color: red;",
    child: Widget.Icon("archlinux-logo"),
    on_clicked: (self) => {
      print("secondary click");
    }
  });
};

// .config/ags/src/window/topbar/widget/WorkspaceDisplay.ts
var ClientTitle = function() {
  return Widget.Label({
    label: hyprland.active.client.bind("title").as((t) => `${t} `)
  });
};
var hyprland = await Service.import("hyprland");
var WorkspaceDisplay_default = () => {
  const activeId = hyprland.active.workspace.bind("id");
  const workspaces = hyprland.bind("workspaces").as((ws) => ws.map(({ id }) => Widget.Button({
    child: Widget.Label(`${id}`),
    on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
    on_hover: (e) => {
      print(`hover ${id}`);
      e.get_button().set_label(`Switch to workspace ${id}`);
    }
  })));
  const workspaceWidget = Widget.Box({
    class_name: "bg-brown",
    children: workspaces
  });
  return Widget.Box({
    class_name: "",
    children: [
      workspaceWidget,
      ClientTitle()
    ]
  });
};

// .config/ags/src/window/topbar/widget/DateTimeDisplay.ts
var date = Variable("", {
  poll: [1000, 'date "+%H:%M, %e %B %Y"']
});
var DateTimeDisplay_default = () => {
  return Widget.Button({
    class_name: "clock",
    label: date.bind()
  });
};

// .config/ags/src/window/topbar/widget/WarpDisplay.ts
var WarpDisplay_default = () => {
  return Widget.Button({
    label: "Warp: \uDB80\uDD5F",
    on_clicked: (self) => {
      print("secondary click");
    }
  });
};

// .config/ags/src/window/topbar/widget/VolumeDisplay.ts
var audio = await Service.import("audio");
var VolumeDisplay_default = () => {
  const icons2 = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted"
  };
  function getIcon() {
    const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find((threshold) => threshold <= audio.speaker.volume * 100);
    return `audio-volume-${icons2[icon]}-symbolic`;
  }
  const displayIcon = Widget.Icon({
    icon: Utils.watch(getIcon(), audio.speaker, getIcon)
  });
  const valueLabel = Widget.Label({
    setup: (self) => self.hook(audio.speaker, () => {
      self.label = audio.speaker.volume || 0;
    }),
    label: audio.speaker.bind("volume").as((vol) => ` ${Math.floor(vol * 100)}`)
  });
  return Widget.Button({
    class_name: "volume",
    child: Widget.Box({
      children: [displayIcon, valueLabel]
    })
  });
};

// .config/ags/src/window/topbar/widget/CpuUsageDisplay.ts
var CpuUsageDisplay_default = () => {
  let cpuUsageVar = Variable(0);
  const valueLabel = Widget.Label({
    setup: (self) => self.poll(3000, () => Utils.execAsync(["bash", "-c", "LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'"]).then((output) => {
      cpuUsageVar.setValue(Math.round(Number(output)));
    }).catch(print)),
    label: cpuUsageVar.bind().as((v) => `\uDB80\uDF5B ${v}%`)
  });
  let widget = Widget.Button({
    class_name: "cpu-usage-display",
    child: Widget.Box({
      children: [valueLabel]
    })
  });
  return widget;
};

// .config/ags/src/window/topbar/widget/RamUsageDisplay.ts
var RamUsageDisplay_default = () => {
  let ramUsageVar = Variable(0);
  const valueLabel = Widget.Label({
    setup: (self) => self.poll(3000, () => Utils.execAsync(["bash", "-c", `LANG=C free | awk '/^Mem/ {printf("%.2f\\n", (\$3/\$2) * 100)}'`]).then((output) => {
      ramUsageVar.setValue(Math.round(Number(output)));
    }).catch(print)),
    label: ramUsageVar.bind().as((v) => `\uDB83\uDF86 ${v}%`)
  });
  let widget = Widget.Button({
    class_name: "ram-usage-display",
    child: Widget.Box({
      children: [valueLabel]
    })
  });
  return widget;
};

// .config/ags/src/window/topbar/TopBar.ts
var TopBar_default = (monitor) => Widget.Window({
  monitor,
  class_name: "bg-tan color-accent",
  name: `topbar${monitor}`,
  exclusivity: "exclusive",
  anchor: ["top", "left", "right"],
  child: Widget.CenterBox({
    start_widget: Widget.Box({
      spacing: 6,
      children: [
        LogoDisplay_default(),
        WorkspaceDisplay_default()
      ]
    }),
    center_widget: Widget.Box({
      children: [DateTimeDisplay_default()]
    }),
    end_widget: Widget.Box({
      spacing: 6,
      hpack: "end",
      children: [
        WarpDisplay_default(),
        VolumeDisplay_default(),
        CpuUsageDisplay_default(),
        RamUsageDisplay_default()
      ]
    })
  })
});

// .config/ags/src/main.ts
App.config({
  windows: () => [
    ...forMonitors(TopBar_default)
  ]
});
