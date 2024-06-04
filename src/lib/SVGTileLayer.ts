import L from "leaflet";

class SVGTile {
  private paths = new Map<SVGPathElement, number>();

  constructor(readonly svg: SVGElement) {
    this.svg
      .querySelectorAll("path")
      .forEach((e) =>
        this.paths.set(e, parseInt(e.getAttribute("stroke-width") || "1"))
      );
  }

  updateStrokes(zoom: number) {
    this.paths.forEach((initialStrokeWidth, path) => {
      path.setAttribute(
        "stroke-width",
        `${initialStrokeWidth / Math.pow(2, zoom)}` // Formule à revoir
      );
    });
  }
}

export default class SVGTileLayer extends L.GridLayer {
  private tiles = new Map<string, SVGTile>();
  private current_zoom: number = 0;

  constructor() {
    super({
      tileSize: 1024,
    });
    this.on("tileunload", this._onTileRemove);
  }

  protected createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = L.DomUtil.create("div", "leaflet-tile");

    // Load SVG aynchronoulsy
    this._loadSVG(coords)
      .then((svg) => {
        if (svg instanceof SVGSVGElement) {
          svg.style.width = "100%";
          svg.style.height = "100%";

          const svgTile = new SVGTile(svg);
          svgTile.updateStrokes(this.current_zoom);
          this.tiles.set(coords.toString(), svgTile);
          tile.appendChild(svg);
        }
        done(undefined, tile);
      })
      .catch(() => null);

    // Return temporary tile
    return tile;
  }

  addTo(map: L.Map): this {
    this.current_zoom = map.getZoom();
    map.on("zoomend", () => {
      this.current_zoom = map.getZoom();
      // Mettre à jour les attributs `stroke-width` des éléments `<path>` uniquement si dans la plage de zoom visible
      const t0 = performance.now();
      this.tiles.forEach((tile) => {
        tile.updateStrokes(this.current_zoom);
      });
      console.log(`Updated paths stroke-width in ${performance.now() - t0}ms`);
    });

    return super.addTo(map);
  }

  private _onTileRemove(event: L.TileEvent) {
    this.tiles.delete(event.coords.toString());
  }

  private async _loadSVG(coords: L.Coords): Promise<HTMLElement | null> {
    const { x, y, z } = coords;
    const url = new URL(
      `${document.location.origin}/svguez/svg/elecgeo/tiles/${z}/${x}/${y}.svg`
    );

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
