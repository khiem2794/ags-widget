// .config/ags/src/lib/session.ts
import GLib from "gi://GLib?version=2.0";
Object.assign(globalThis, {
  OPTIONS: `${GLib.get_user_cache_dir()}/ags/options.json`,
  TMP: `${GLib.get_tmp_dir()}/asztal`,
  USER: GLib.get_user_name()
});
Utils.ensureDirectory(TMP);
App.addIcons(`${App.configDir}/assets`);

// .config/ags/src/lib/option.ts
import {Variable as Variable2} from "resource:///com/github/Aylur/ags/variable.js";
var getOptions = function(object, path = "") {
  return Object.keys(object).flatMap((key) => {
    const obj = object[key];
    const id = path ? path + "." + key : key;
    if (obj instanceof Variable2) {
      obj.id = id;
      return obj;
    }
    if (typeof obj === "object")
      return getOptions(obj, id);
    return [];
  });
};
function mkOptions(cacheFile, object) {
  for (const opt of getOptions(object))
    opt.init(cacheFile);
  Utils.ensureDirectory(cacheFile.split("/").slice(0, -1).join("/"));
  const configFile = `${TMP}/config.json`;
  const values = getOptions(object).reduce((obj, { id, value }) => ({ [id]: value, ...obj }), {});
  Utils.writeFileSync(JSON.stringify(values, null, 2), configFile);
  Utils.monitorFile(configFile, () => {
    const cache = JSON.parse(Utils.readFile(configFile) || "{}");
    for (const opt of getOptions(object)) {
      if (JSON.stringify(cache[opt.id]) !== JSON.stringify(opt.value))
        opt.value = cache[opt.id];
    }
  });
  function sleep(ms = 0) {
    return new Promise((r) => setTimeout(r, ms));
  }
  async function reset([opt, ...list] = getOptions(object), id = opt?.reset()) {
    if (!opt)
      return sleep().then(() => []);
    return id ? [id, ...await sleep(50).then(() => reset(list))] : await sleep().then(() => reset(list));
  }
  return Object.assign(object, {
    configFile,
    array: () => getOptions(object),
    async reset() {
      return (await reset()).join("\n");
    },
    handler(deps, callback) {
      for (const opt of getOptions(object)) {
        if (deps.some((i) => opt.id.startsWith(i)))
          opt.connect("changed", callback);
      }
    }
  });
}

class Opt extends Variable2 {
  static {
    Service.register(this);
  }
  constructor(initial, { persistent = false } = {}) {
    super(initial);
    this.initial = initial;
    this.persistent = persistent;
  }
  initial;
  id = "";
  persistent;
  toString() {
    return `${this.value}`;
  }
  toJSON() {
    return `opt:${this.value}`;
  }
  getValue = () => {
    return super.getValue();
  };
  init(cacheFile) {
    const cacheV = JSON.parse(Utils.readFile(cacheFile) || "{}")[this.id];
    if (cacheV !== undefined)
      this.value = cacheV;
    this.connect("changed", () => {
      const cache = JSON.parse(Utils.readFile(cacheFile) || "{}");
      cache[this.id] = this.value;
      Utils.writeFileSync(JSON.stringify(cache, null, 2), cacheFile);
    });
  }
  reset() {
    if (this.persistent)
      return;
    if (JSON.stringify(this.value) !== JSON.stringify(this.initial)) {
      this.value = this.initial;
      return this.id;
    }
  }
}
var opt = (initial, opts) => new Opt(initial, opts);

// .config/ags/src/lib/variables.ts
import GLib3 from "gi://GLib";
var clock = Variable(GLib3.DateTime.new_now_local(), {
  poll: [1000, () => GLib3.DateTime.new_now_local()]
});
var uptime = Variable(0, {
  poll: [
    60000,
    "cat /proc/uptime",
    (line) => Number.parseInt(line.split(".")[0]) / 60
  ]
});
var distro = {
  id: GLib3.get_os_info("ID"),
  logo: GLib3.get_os_info("LOGO")
};

// .config/ags/src/lib/icons.ts
var substitutes = {
  "transmission-gtk": "transmission",
  "blueberry.py": "blueberry",
  Caprine: "facebook-messenger",
  "com.raggesilver.BlackBox-symbolic": "terminal-symbolic",
  "org.wezfurlong.wezterm-symbolic": "terminal-symbolic",
  "audio-headset-bluetooth": "audio-headphones-symbolic",
  "audio-card-analog-usb": "audio-speakers-symbolic",
  "audio-card-analog-pci": "audio-card-symbolic",
  "preferences-system": "emblem-system-symbolic",
  "com.github.Aylur.ags-symbolic": "controls-symbolic",
  "com.github.Aylur.ags": "controls-symbolic"
};
var icons_default = {
  missing: "image-missing-symbolic",
  nix: {
    nix: "nix-snowflake-symbolic"
  },
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic"
    }
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  asusctl: {
    profile: {
      Balanced: "power-profile-balanced-symbolic",
      Quiet: "power-profile-power-saver-symbolic",
      Performance: "power-profile-performance-symbolic"
    },
    mode: {
      Integrated: "processor-symbolic",
      Hybrid: "controller-symbolic"
    }
  },
  battery: {
    charging: "battery-flash-symbolic",
    warning: "battery-empty-symbolic"
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic"
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic"
  },
  powermenu: {
    sleep: "weather-clear-night-symbolic",
    reboot: "system-reboot-symbolic",
    logout: "system-log-out-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    playing: "media-playback-pause-symbolic",
    paused: "media-playback-start-symbolic",
    stopped: "media-playback-start-symbolic",
    prev: "media-skip-backward-symbolic",
    next: "media-skip-forward-symbolic"
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  color: {
    dark: "dark-mode-symbolic",
    light: "light-mode-symbolic"
  }
};

// .config/ags/src/lib/utils.ts
import Gdk2 from "gi://Gdk";
import GLib4 from "gi://GLib?version=2.0";
function icon(name, fallback = icons_default.missing) {
  if (!name)
    return fallback || "";
  if (GLib4.file_test(name, GLib4.FileTest.EXISTS))
    return name;
  const icon2 = substitutes[name] || name;
  if (Utils.lookUpIcon(icon2))
    return icon2;
  print(`no icon substitute "${icon2}" for "${name}", fallback: "${fallback}"`);
  return fallback;
}
async function bash(strings, ...values) {
  const cmd = typeof strings === "string" ? strings : strings.flatMap((str, i) => str + `${values[i] ?? ""}`).join("");
  return Utils.execAsync(["bash", "-c", cmd]).catch((err) => {
    console.error(cmd, err);
    return "";
  });
}
function forMonitors(widget) {
  const n = Gdk2.Display.get_default()?.get_n_monitors() || 1;
  return range(n, 0).flatMap(widget);
}
function range(length, start = 1) {
  return Array.from({ length }, (_, i) => i + start);
}
function dependencies(...bins) {
  const missing = bins.filter((bin) => Utils.exec({
    cmd: `which ${bin}`,
    out: () => false,
    err: () => true
  }));
  if (missing.length > 0) {
    console.warn(Error(`missing dependencies: ${missing.join(", ")}`));
    Utils.notify(`missing dependencies: ${missing.join(", ")}`);
  }
  return missing.length === 0;
}

// .config/ags/src/options.ts
var options = mkOptions(OPTIONS, {
  autotheme: opt(false),
  wallpaper: {
    resolution: opt(1920),
    market: opt("random")
  },
  theme: {
    dark: {
      primary: {
        bg: opt("#51a4e7"),
        fg: opt("#141414")
      },
      error: {
        bg: opt("#e55f86"),
        fg: opt("#141414")
      },
      bg: opt("#171717"),
      fg: opt("#eeeeee"),
      widget: opt("#eeeeee"),
      border: opt("#eeeeee")
    },
    light: {
      primary: {
        bg: opt("#426ede"),
        fg: opt("#eeeeee")
      },
      error: {
        bg: opt("#b13558"),
        fg: opt("#eeeeee")
      },
      bg: opt("#fffffa"),
      fg: opt("#080808"),
      widget: opt("#080808"),
      border: opt("#080808")
    },
    blur: opt(0),
    scheme: opt("dark"),
    widget: { opacity: opt(94) },
    border: {
      width: opt(1),
      opacity: opt(96)
    },
    shadows: opt(true),
    padding: opt(7),
    spacing: opt(12),
    radius: opt(11)
  },
  transition: opt(200),
  font: {
    size: opt(13),
    name: opt("Ubuntu Nerd Font")
  },
  bar: {
    flatButtons: opt(true),
    position: opt("top"),
    corners: opt(true),
    transparent: opt(false),
    layout: {
      start: opt([
        "launcher",
        "workspaces",
        "taskbar",
        "expander",
        "messages"
      ]),
      center: opt([
        "date"
      ]),
      end: opt([
        "media",
        "expander",
        "systray",
        "colorpicker",
        "screenrecord",
        "system",
        "battery",
        "powermenu"
      ])
    },
    launcher: {
      icon: {
        colored: opt(true),
        icon: opt(icon(distro.logo, icons_default.ui.search))
      },
      label: {
        colored: opt(false),
        label: opt(" Applications")
      },
      action: opt(() => App.toggleWindow("launcher"))
    },
    date: {
      format: opt("%H:%M - %A %e."),
      action: opt(() => App.toggleWindow("datemenu"))
    },
    battery: {
      bar: opt("regular"),
      charging: opt("#00D787"),
      percentage: opt(true),
      blocks: opt(7),
      width: opt(50),
      low: opt(30)
    },
    workspaces: {
      workspaces: opt(7)
    },
    taskbar: {
      iconSize: opt(0),
      monochrome: opt(true),
      exclusive: opt(false)
    },
    messages: {
      action: opt(() => App.toggleWindow("datemenu"))
    },
    systray: {
      ignore: opt([
        "KDE Connect Indicator",
        "spotify-client"
      ])
    },
    media: {
      monochrome: opt(true),
      preferred: opt("spotify"),
      direction: opt("right"),
      format: opt("{artists} - {title}"),
      length: opt(40)
    },
    powermenu: {
      monochrome: opt(false),
      action: opt(() => App.toggleWindow("powermenu"))
    }
  },
  launcher: {
    width: opt(0),
    margin: opt(80),
    nix: {
      pkgs: opt("nixpkgs/nixos-unstable"),
      max: opt(8)
    },
    sh: {
      max: opt(16)
    },
    apps: {
      iconSize: opt(62),
      max: opt(3),
      favorites: opt([
        [
          "firefox",
          "thunar",
          "code",
          "calibre",
          "zathura",
          "chromium"
        ]
      ])
    }
  },
  overview: {
    scale: opt(9),
    workspaces: opt(7),
    monochromeIcon: opt(true)
  },
  powermenu: {
    sleep: opt("systemctl suspend"),
    reboot: opt("systemctl reboot"),
    logout: opt("pkill Hyprland"),
    shutdown: opt("shutdown now"),
    layout: opt("line"),
    labels: opt(true)
  },
  quicksettings: {
    avatar: {
      image: opt(`/var/lib/AccountsService/icons/${Utils.USER}`),
      size: opt(70)
    },
    width: opt(380),
    position: opt("right"),
    networkSettings: opt("gtk-launch gnome-control-center"),
    media: {
      monochromeIcon: opt(true),
      coverSize: opt(100)
    }
  },
  datemenu: {
    position: opt("center"),
    weather: {
      interval: opt(60000),
      unit: opt("metric"),
      key: opt(JSON.parse(Utils.readFile(`${App.configDir}/.weather`) || "{}")?.key || ""),
      cities: opt(JSON.parse(Utils.readFile(`${App.configDir}/.weather`) || "{}")?.cities || [])
    }
  },
  osd: {
    progress: {
      vertical: opt(true),
      pack: {
        h: opt("end"),
        v: opt("center")
      }
    },
    microphone: {
      pack: {
        h: opt("center"),
        v: opt("end")
      }
    }
  },
  notifications: {
    position: opt(["top", "right"]),
    blacklist: opt(["Spotify"]),
    width: opt(440)
  },
  hyprland: {
    gaps: opt(2.4),
    inactiveBorder: opt("#282828"),
    gapsWhenOnly: opt(false)
  }
});
globalThis["options"] = options;
var options_default = options;

// .config/ags/src/style/style.ts
async function resetCss() {
  if (!dependencies("sass", "fd"))
    return;
  try {
    const vars = `${TMP}/variables.scss`;
    const scss = `${TMP}/main.scss`;
    const css = `${TMP}/main.css`;
    const cd = App.configDir;
    print("--------------------------------------------------------------------------------------");
    print(cd);
    const fd = await bash(`fd -I ".scss" ${App.configDir}`);
    const files = fd.split(/\s+/);
    const imports2 = [vars, ...files].map((f) => `@import '${f}';`);
    await Utils.writeFile(variables2().join("\n"), vars);
    await Utils.writeFile(imports2.join("\n"), scss);
    await bash`sass ${scss} ${css}`;
    App.applyCss(css, true);
  } catch (error) {
    error instanceof Error ? logError(error) : console.error(error);
  }
}
var deps = [
  "font",
  "theme",
  "bar.flatButtons",
  "bar.position",
  "bar.battery.charging",
  "bar.battery.blocks"
];
var {
  dark,
  light,
  blur,
  scheme,
  padding,
  spacing,
  radius,
  shadows,
  widget,
  border
} = options_default.theme;
var popoverPaddingMultiplier = 1.6;
var t = (dark2, light2) => scheme.value === "dark" ? `${dark2}` : `${light2}`;
var $ = (name, value) => `\$${name}: ${value};`;
var variables2 = () => [
  $("bg", blur.value ? `transparentize(${t(dark.bg, light.bg)}, ${blur.value / 100})` : t(dark.bg, light.bg)),
  $("fg", t(dark.fg, light.fg)),
  $("primary-bg", t(dark.primary.bg, light.primary.bg)),
  $("primary-fg", t(dark.primary.fg, light.primary.fg)),
  $("error-bg", t(dark.error.bg, light.error.bg)),
  $("error-fg", t(dark.error.fg, light.error.fg)),
  $("scheme", scheme),
  $("padding", `${padding}pt`),
  $("spacing", `${spacing}pt`),
  $("radius", `${radius}px`),
  $("transition", `${options_default.transition}ms`),
  $("shadows", `${shadows}`),
  $("widget-bg", `transparentize(${t(dark.widget, light.widget)}, ${widget.opacity.value / 100})`),
  $("hover-bg", `transparentize(${t(dark.widget, light.widget)}, ${widget.opacity.value * 0.9 / 100})`),
  $("hover-fg", `lighten(${t(dark.fg, light.fg)}, 8%)`),
  $("border-width", `${border.width}px`),
  $("border-color", `transparentize(${t(dark.border, light.border)}, ${border.opacity.value / 100})`),
  $("border", "$border-width solid $border-color"),
  $("active-gradient", `linear-gradient(to right, ${t(dark.primary.bg, light.primary.bg)}, darken(${t(dark.primary.bg, light.primary.bg)}, 4%))`),
  $("shadow-color", t("rgba(0,0,0,.6)", "rgba(0,0,0,.4)")),
  $("text-shadow", t("2pt 2pt 2pt $shadow-color", "none")),
  $("box-shadow", t("2pt 2pt 2pt 0 $shadow-color, inset 0 0 0 $border-width $border-color", "none")),
  $("popover-border-color", `transparentize(${t(dark.border, light.border)}, ${Math.max((border.opacity.value - 1) / 100, 0)})`),
  $("popover-padding", `\$padding * ${popoverPaddingMultiplier}`),
  $("popover-radius", radius.value === 0 ? "0" : "$radius + $popover-padding"),
  $("font-size", `${options_default.font.size}pt`),
  $("font-name", options_default.font.name),
  $("charging-bg", options_default.bar.battery.charging),
  $("bar-battery-blocks", options_default.bar.battery.blocks),
  $("bar-position", options_default.bar.position),
  $("hyprland-gaps-multiplier", options_default.hyprland.gaps)
];
Utils.monitorFile(`${App.configDir}/src/style`, resetCss);
options_default.handler(deps, resetCss);
await resetCss();

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
    class_name: "client-title",
    label: hyprland.active.client.bind("title").as((t2) => `${t2} `)
  });
};
var hyprland = await Service.import("hyprland");
var WorkspaceDisplay_default = () => {
  const activeId = hyprland.active.workspace.bind("id");
  const workspaces = hyprland.bind("workspaces").as((ws) => ws.map(({ id }) => Widget.Button({
    css: "border-radius: 0;",
    on_clicked: () => hyprland.messageAsync(`dispatch workspace ${id}`),
    child: Widget.Label(`${id}`),
    class_name: activeId.as((i) => `${i === id ? "focused" : ""}`)
  })));
  const workspaceWidget = Widget.Box({
    css: "padding: 0 6px;",
    class_name: "workspaces",
    children: workspaces
  });
  return Widget.Box({
    css: "background-color: green; border-radius: 10px;",
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
  const icons3 = {
    101: "overamplified",
    67: "high",
    34: "medium",
    1: "low",
    0: "muted"
  };
  function getIcon() {
    const icon2 = audio.speaker.is_muted ? 0 : [101, 67, 34, 1, 0].find((threshold) => threshold <= audio.speaker.volume * 100);
    return `audio-volume-${icons3[icon2]}-symbolic`;
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
  let widget2 = Widget.Button({
    class_name: "cpu-usage-display",
    child: Widget.Box({
      children: [valueLabel]
    })
  });
  return widget2;
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
  let widget2 = Widget.Button({
    class_name: "ram-usage-display",
    child: Widget.Box({
      children: [valueLabel]
    })
  });
  return widget2;
};

// .config/ags/src/window/topbar/TopBar.ts
var TopBar_default = (monitor) => Widget.Window({
  monitor,
  class_name: "transparent",
  name: `topbar${monitor}`,
  exclusivity: "exclusive",
  anchor: ["top", "left", "right"],
  child: Widget.CenterBox({
    css: "min-width: 2px; min-height: 2px;",
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
  onConfigParsed: () => {
  },
  closeWindowDelay: {
    launcher: options_default.transition.value,
    overview: options_default.transition.value,
    quicksettings: options_default.transition.value,
    datemenu: options_default.transition.value
  },
  windows: () => [
    ...forMonitors(TopBar_default)
  ]
});
