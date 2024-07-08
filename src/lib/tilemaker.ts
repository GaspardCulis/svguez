import { statsStore } from "./store";
import { filterSVG, intersects } from "./utils";

export interface TileStorage {
  size: number;
  set(coords: string, tile: SVGSVGElement): void;
  [Symbol.iterator](): Iterator<[string, SVGSVGElement | string]>;
}

type TilemakerParams = {
  tileSize: number;
  maxZoomLevel: number;
  removeSmall: boolean;
  keepFinal: boolean;
};

export default class Tilemaker {
  constructor(
    readonly svg: SVGSVGElement,
    readonly storage: TileStorage,
    readonly params: TilemakerParams,
  ) {}

  createTile(
    svg: SVGSVGElement,
    z: number,
    x: number,
    y: number,
    max_zoom: number,
  ): SVGSVGElement {
    let tile_size = this.params.tileSize / Math.pow(2, z);

    const checkSize =
      this.params.removeSmall && !(z === max_zoom && this.params.keepFinal);
    const min_size = tile_size / 300;

    const bbox = new DOMRect(
      x * tile_size,
      y * tile_size,
      tile_size,
      tile_size,
    );

    const svg_tile = filterSVG(svg, (element) => {
      if (element instanceof SVGGraphicsElement) {
        // Start with unprecise but fast `getBBox` method
        let element_bbox = element.getBBox();

        if (!intersects(bbox, element_bbox)) {
          return false;
        } else if (checkSize) {
          // Compute bbox with more precise but expensive `getBoundingClientRect` method for width and height checking
          element_bbox = element.getBoundingClientRect();
          if (element_bbox.height < min_size && element_bbox.width < min_size) {
            return false;
          }
        }
      }

      return true;
    });

    // Update viewport
    svg_tile.setAttribute(
      "viewBox",
      `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`,
    );

    return svg_tile;
  }

  private createTilesChunked(
    svg: SVGSVGElement,
    max_zoom: number,
    resolve: (value: TileStorage) => void,
    x: number,
    y: number,
    z: number,
  ) {
    const initial_width = Math.ceil(
      svg.width.baseVal.value / this.params.tileSize,
    );
    const initial_height = Math.ceil(
      svg.height.baseVal.value / this.params.tileSize,
    );

    for (let i = 0; i < 20; i++) {
      // Process 20 tiles at a time
      let svg_tile = this.createTile(svg, z, x, y, max_zoom);
      let key = `${z}/${x}/${y}.svg`;
      this.storage.set(key, svg_tile);
      // @ts-ignore
      svg_tile = null;

      x++;
      if (x >= initial_width * Math.pow(2, z)) {
        x = 0;
        y++;
        if (y >= initial_height * Math.pow(2, z)) {
          z++;
          if (z > max_zoom) {
            resolve(this.storage);
            return;
          }
          y = 0;
        }
      }
    }

    // Stats
    statsStore.currentZoom.set(z);
    statsStore.tileCount.set(this.storage.size);
    statsStore.progress.set(
      (100 * this.storage.size) / statsStore.finalTilesCount.get(),
    );

    requestAnimationFrame(() =>
      this.createTilesChunked(svg, max_zoom, resolve, x, y, z),
    );
  }

  createTiles(svg: SVGSVGElement, max_zoom: number): Promise<TileStorage> {
    return new Promise<TileStorage>((resolve) => {
      this.createTilesChunked(svg, max_zoom, resolve, 0, 0, 0);
    });
  }
}
