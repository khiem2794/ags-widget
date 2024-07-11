import GLib from "gi://GLib"
import Gdk from "gi://Gdk"

const scss = `${App.configDir}/src/style/style.scss`;
const css = `${App.configDir}/style.css`;
const main = `${App.configDir}/main.js`
const entry = `${App.configDir}/src/main.ts`
const bundler = "bun"

try {

    await Utils.execAsync(`sass ${scss} ${css}`);

    switch (bundler) {
        case "bun":
            await Utils.execAsync([
                "bun", "build", entry,
                "--outfile", main,
                "--external", "resource://*",
                "--external", "gi://*",
                "--external", "file://*",
            ]);
            break;
        case "esbuild":
            await Utils.execAsync([
                "esbuild",
                "--bundle", entry,
                "--format=esm",
                `--outfile=${main}`,
                "--external:resource://*",
                "--external:gi://*",
                "--external:file://*",
            ]);
            break;

        default:
            throw `"${bundler}" is not a valid bundler`
    }

    await import(`file://${main}`)
    App.applyCss(css)
} catch (error) {
    App.config({
        style: css,
        windows: [
            Widget.Window({
                name: 'CompError',
                exclusive: true,
                exclusivity: 'exclusive',
                anchor: ['top', 'left', 'right'],
                child: Widget.Label({
                    label: error.toString(),
                }),
            })
        ]
    })
}
