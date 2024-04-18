import L from "leaflet";
import { loadSVG } from "./utils";

export default class SVGMapLayer {
    private constructor(
        readonly zoom_level: number,
        readonly element: SVGElement,
        readonly overlay: L.SVGOverlay,
        private paths: Map<SVGPathElement, number>
    ) { }

    static async from(params: { path: string, zoom_level: number, bounds: L.LatLngBoundsExpression }): Promise<SVGMapLayer> {
        const { path, zoom_level, bounds } = params;

        const element = await loadSVG(path);
        const overlay = new L.SVGOverlay(element, bounds);
        const paths: Map<SVGPathElement, number> = new Map();
        element.querySelectorAll("path")
            .forEach((e) =>
                paths.set(e, parseInt(e.getAttribute("stroke-width") || "1")),
            );

        return new SVGMapLayer(zoom_level, element, overlay, paths);
    }

    public addTo(map: L.Map) {
        map.on("zoomend", (_e) => {
            const current_zoom = map.getZoom();
            this.updateVisibility(map);
            if (current_zoom >= this.zoom_level) {
                this.paths.forEach((initialStrokeWidth, element) => {
                    element.setAttribute(
                        "stroke-width",
                        `${initialStrokeWidth / Math.pow(current_zoom, 2)}`,
                    );
                });
            }
        });

        this.updateVisibility(map)
    }

    private updateVisibility(map: L.Map) {
        const current_zoom = map.getZoom();
        if (current_zoom >= this.zoom_level) {
            if (!map.hasLayer(this.overlay)) {
                this.overlay.addTo(map);
                console.log("Added to map for zoom " + this.zoom_level)
            }
        } else if (map.hasLayer(this.overlay)) {
            this.overlay.removeFrom(map);
            console.log("Removed from map for zoom " + this.zoom_level)
        }
    }
}