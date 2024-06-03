import L from "leaflet";

export default class SVGTileLayer extends L.GridLayer {
  constructor() {
    super({
      tileSize: 1024,
    });
  }

  protected createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = L.DomUtil.create("div", "leaflet-tile");

    // Load SVG aynchronoulsy
    this._loadSVG(coords).then((svg) => {
      if (svg instanceof SVGSVGElement) {
        if (coords.z !== 0) {
          svg.style.width = "100%";
          svg.style.height = "100%";
        }
        tile.appendChild(svg);
      }
      done(undefined, tile);
    });

    // Return temporary tile
    return tile;
  }

  private async _loadSVG(coords: L.Coords): Promise<HTMLElement | null> {
    const { x, y, z } = coords;
    const url = new URL(`http://localhost:8080/${z}/${x}/${y}.svg`);

    const response = await fetch(url);
    if (response.status === 200) {
      const svg = await response.text();
      return new DOMParser().parseFromString(svg, "image/svg+xml")
        .documentElement;
    } else {
      return null;
    }
  }
}
