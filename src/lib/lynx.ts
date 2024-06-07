import { settingsStore } from "./store";

// Atos LYNX specific code
export function onSVGUpload(content: string) {
    const parser = new DOMParser();
    const svg = parser.parseFromString(
      content,
      "image/svg+xml",
    ).documentElement as unknown as SVGSVGElement;
    const panonoff: "on" | "off" = svg.getAttribute("pannonoff") === "1" ? "on" : "off";

    if (panonoff === "off") {
        settingsStore.maxZoomLevel.set(0);
    }
}