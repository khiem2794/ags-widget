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

// .config/ags/src/window/topbar/widget/Logo.ts
var Logo_default = () => {
  return Widget.Button({
    class_name: "px-5px",
    child: Widget.Icon("archlinux-logo"),
    on_clicked: (self) => {
      print("secondary click");
    }
  });
};

// .config/ags/src/window/topbar/widget/Workspace.ts
var ClientTitle = function() {
  return Widget.Label({
    class_name: "fs-15px ml-5px",
    label: hyprland.active.client.bind("title").as((t) => {
      let title = t;
      if (t.length > 50) {
        title = t.substring(0, 20).trim() + "..." + t.substring(t.length - 20, t.length).trim();
      }
      return title;
    })
  });
};
var hyprland = await Service.import("hyprland");
var Workspace_default = () => {
  const activeId = hyprland.active.workspace.bind("id");
  const default_class = "px-5px border-0 ";
  const workspaces = hyprland.bind("workspaces").as((ws) => ws.map(({ id }) => Widget.Button({
    child: Widget.Label(`${id}`),
    on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
    class_name: activeId.as((i) => default_class + `${i === id ? "bg-highlight text-brown" : "bg-brown text-highlight"}`),
    on_hover: (e) => {
      print(`hover ${id}`);
      let r = e.get_button().at(0);
    }
  })));
  const workspaceWidget = Widget.Box({
    class_name: "bg-brown",
    children: workspaces
  });
  return Widget.Box({
    class_name: "text-highlight",
    children: [
      workspaceWidget,
      ClientTitle()
    ]
  });
};

// .config/ags/src/window/topbar/widget/DateTime.ts
var date = Variable("", {
  poll: [1000, 'date "+%H:%M, %e %B %Y"']
});
var DateTime_default = () => {
  return Widget.Button({
    class_name: "text-highlight",
    label: date.bind()
  });
};

// .config/ags/src/window/topbar/widget/Volume.ts
var audio = await Service.import("audio");
var Volume_default = () => {
  const icons2 = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted"
  };
  function getVolumeIcon() {
    const icon = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find((threshold) => threshold <= audio.speaker.volume * 100);
    return `audio-volume-${icons2[icon]}-symbolic`;
  }
  function getMicIcon() {
    const icon = audio.microphone.is_muted ? "muted" : "medium";
    return `microphone-sensitivity-${icon}-symbolic`;
  }
  const volumeDisplayIcon = Widget.Icon({
    icon: Utils.watch(getVolumeIcon(), audio.speaker, getVolumeIcon)
  });
  const micDisplayIcon = Widget.Icon({
    icon: Utils.watch(getMicIcon(), audio.microphone, getMicIcon)
  });
  const valueLabel = Widget.Label({
    setup: (self) => self.hook(audio.speaker, () => {
      self.label = audio.speaker.volume || 0;
    }),
    label: audio.speaker.bind("volume").as((vol) => `${Math.floor(vol * 100)}`)
  });
  return Widget.Button({
    class_name: "text-highlight",
    child: Widget.Box({
      spacing: 5,
      children: [micDisplayIcon, volumeDisplayIcon, valueLabel]
    })
  });
};

// .config/ags/src/window/topbar/widget/CpuUsage.ts
var CpuUsage_default = () => {
  let cpuUsageVar = Variable(0);
  const valueLabel = Widget.Label({
    setup: (self) => self.poll(3000, () => Utils.execAsync(["bash", "-c", "LANG=C top -bn1 | grep Cpu | sed 's/\\,/\\./g' | awk '{print $2}'"]).then((output) => {
      cpuUsageVar.setValue(Math.round(Number(output)));
    }).catch(print)),
    label: cpuUsageVar.bind().as((v) => `${v}%`)
  });
  const displayIcon = Widget.Icon({
    icon: "applications-electronics-symbolic"
  });
  let widget = Widget.Button({
    class_name: "text-highlight",
    child: Widget.Box({
      spacing: 5,
      children: [displayIcon, valueLabel]
    })
  });
  return widget;
};

// .config/ags/src/window/topbar/widget/MemoryUsage.ts
var MemoryUsage_default = () => {
  let ramUsageVar = Variable(0);
  const valueLabel = Widget.Label({
    setup: (self) => self.poll(3000, () => Utils.execAsync(["bash", "-c", `LANG=C free | awk '/^Mem/ {printf("%.2f\\n", (\$3/\$2) * 100)}'`]).then((output) => {
      ramUsageVar.setValue(Math.round(Number(output)));
    }).catch(print)),
    label: ramUsageVar.bind().as((v) => `${v}%`)
  });
  const displayIcon = Widget.Icon({
    icon: "power-profile-balanced-rtl-symbolic"
  });
  let widget = Widget.Button({
    class_name: "text-highlight",
    child: Widget.Box({
      spacing: 5,
      children: [displayIcon, valueLabel]
    })
  });
  return widget;
};

// .config/ags/src/window/topbar/widget/BatteryUsage.ts
var battery = await Service.import("battery");
var BatteryUsage_default = () => {
  const percentLabel = Widget.Label({
    label: battery.bind("percent").as((p) => `${p}%`)
  });
  let widget = Widget.Button({
    class_name: "text-highlight",
    child: Widget.Box({
      spacing: 3,
      children: [Widget.Icon({ icon: battery.bind("icon_name") }), percentLabel]
    })
  });
  return widget;
};

// .config/ags/src/service/Brightness.ts
class BrightnessService extends Service {
  static {
    Service.register(this, {
      "screen-changed": ["float"]
    }, {
      "screen-value": ["float", "rw"]
    });
  }
  #interface = Utils.exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");
  #screenValue = 0;
  #max = Number(Utils.exec("brightnessctl max"));
  get screen_value() {
    return this.#screenValue;
  }
  set screen_value(percent) {
    if (percent < 0)
      percent = 0;
    if (percent > 1)
      percent = 1;
    Utils.execAsync(`brightnessctl set ${percent * 100}% -q`);
  }
  constructor() {
    super();
    const brightness = `/sys/class/backlight/${this.#interface}/brightness`;
    Utils.monitorFile(brightness, () => this.#onChange());
    this.#onChange();
  }
  #onChange() {
    this.#screenValue = Number(Utils.exec("brightnessctl get")) / this.#max;
    this.emit("changed");
    this.notify("screen-value");
    this.emit("screen-changed", this.#screenValue);
  }
  connect(event = "screen-changed", callback) {
    return super.connect(event, callback);
  }
}
var service = new BrightnessService;
var Brightness_default = service;

// .config/ags/src/window/topbar/widget/Backlight.ts
var Backlight_default = () => {
  const icons2 = {
    80: "high",
    50: "medium",
    10: "low",
    1: "off"
  };
  let brightnessVar = Variable(0);
  const valueLabel = Widget.Label({
    label: Brightness_default.bind("screen-value").as((v) => {
      brightnessVar.setValue(Math.round(v * 100));
      return `${brightnessVar.getValue()}%`;
    })
  });
  function getIcon() {
    const icon = [80, 50, 10, 1].find((threshold) => threshold <= brightnessVar.getValue());
    return `display-brightness-${icons2[icon]}-symbolic`;
  }
  const displayIcon = Widget.Icon({
    icon: Utils.watch(getIcon(), brightnessVar, getIcon)
  });
  let widget = Widget.Button({
    class_name: "text-highlight",
    child: Widget.Box({
      spacing: 5,
      children: [displayIcon, valueLabel]
    })
  });
  return widget;
};

// .config/ags/src/window/topbar/widget/SystemTray.ts
var systemtray = await Service.import("systemtray");
var WarpWidget = () => {
  let warpStatusVar = Variable(0);
  const indicatorLabel = Widget.Label({
    setup: (self) => self.poll(3000, () => Utils.execAsync(["bash", "-c", `warp-cli status | grep Status | awk '{print \$3}' | sed 's/\\.//g'`]).then((output) => {
      switch (output.toLowerCase()) {
        case "connected":
          warpStatusVar.setValue(1);
          break;
        case "connecting":
          warpStatusVar.setValue(2);
          break;
        case "disconnected":
          warpStatusVar.setValue(3);
          break;
        default:
          warpStatusVar.setValue(-1);
      }
    }).catch(print)),
    label: warpStatusVar.bind().as((v) => {
      switch (v) {
        case 1:
          return "\uDB80\uDD60";
        case 2:
          return "\uDB84\uDED6";
        case 3:
          return "\uF4AD";
        default:
          return "?";
      }
    })
  });
  let widget = Widget.Button({
    class_name: "fs-10px bg-tan text-brown",
    on_clicked: (self) => {
      Utils.execAsync(["bash", "-c", `warp-cli connect`]);
    },
    on_secondary_click: (self) => {
      Utils.execAsync(["bash", "-c", `warp-cli disconnect`]);
    },
    child: Widget.Box({
      spacing: 5,
      children: [indicatorLabel]
    })
  });
  return widget;
};
var SystemTray_default = () => {
  const items = systemtray.bind("items").as((items2) => items2.map((item) => {
    if (item.menu !== undefined) {
      item.menu["class_name"] = "systray-menu";
    }
    return Widget.Button({
      child: Widget.Icon({
        class_name: "bg-tan",
        icon: item.bind("icon")
      }),
      on_secondary_click: (_, event) => item.openMenu(event),
      tooltip_markup: item.bind("tooltip_markup")
    });
  }));
  const trayBox = Widget.Box({
    spacing: 10,
    class_name: "bg-tan text-brown",
    children: items
  });
  return Widget.Box({
    spacing: 10,
    class_name: "bg-tan px-5px",
    children: [WarpWidget(), trayBox]
  });
};

// .config/ags/src/window/topbar/TopBar.ts
var TopBar_default = (monitor) => Widget.Window({
  monitor,
  class_name: "bg-brown color-highlight p-0px",
  name: `topbar${monitor}`,
  exclusivity: "exclusive",
  anchor: ["top", "left", "right"],
  child: Widget.CenterBox({
    start_widget: Widget.Box({
      spacing: 0,
      children: [
        Logo_default(),
        Workspace_default()
      ]
    }),
    center_widget: Widget.Box({
      children: [DateTime_default()]
    }),
    end_widget: Widget.Box({
      spacing: 15,
      hpack: "end",
      children: [
        Backlight_default(),
        Volume_default(),
        BatteryUsage_default(),
        CpuUsage_default(),
        MemoryUsage_default(),
        SystemTray_default()
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
