import type { Map } from "maplibre-gl";
import { loadGeoJSON } from "../lib/utils";

export default class GeoJSONLayer {
  private constructor(readonly name: string, private geojson: GeoJSON.GeoJSON) {}

  static async fromImage(name: string): Promise<GeoJSONLayer> {
    const features = await loadGeoJSON(name);
    return new GeoJSONLayer(name, {
      type: "FeatureCollection",
      // @ts-ignore
      features,
    });
  }

  addTo(map: Map) {
    map.addSource(this.name, {
      type: "geojson",
      data: this.geojson,
      generateId: true,
    });
    map.addLayer({
      id: this.name,
      type: "line",
      source: this.name,
      paint: {
        "line-width": 3,
        "line-color": ["feature-state", "color"],
      },
    });
  }
}
