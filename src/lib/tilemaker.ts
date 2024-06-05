import { settingsStore, statsStore } from "./store";
import { filterSVG, intersects } from "./utils";

export function createTile(
  svg: SVGSVGElement,
  z: number,
  x: number,
  y: number,
  max_zoom: number,
): SVGSVGElement {
  const base_tile_size = settingsStore.tileSize.get();
  let tile_size = base_tile_size / Math.pow(2, z);

  const checkSize = !(z === max_zoom && settingsStore.keepFinal.get());
  const min_size = tile_size / 256;

  const bbox = new DOMRect(x * tile_size, y * tile_size, tile_size, tile_size);

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

function createTilesChunked(
  svg: SVGSVGElement,
  max_zoom: number,
  tiles: Map<string, SVGSVGElement>,
  resolve: (value: Map<string, SVGSVGElement>) => void,
  x: number,
  y: number,
  z: number,
) {
  const base_tile_size = settingsStore.tileSize.get();
  const initial_width = Math.ceil(svg.width.baseVal.value / base_tile_size);
  const initial_height = Math.ceil(svg.height.baseVal.value / base_tile_size);

  for (let i = 0; i < 20; i++) {
    // Process 20 tiles at a time
    let svg_tile = createTile(svg, z, x, y, max_zoom);
    let key = `${z}/${x}/${y}.svg`;
    tiles.set(key, svg_tile);

    x++;
    if (x >= initial_width * Math.pow(2, z)) {
      x = 0;
      y++;
      if (y >= initial_height * Math.pow(2, z)) {
        z++;
        if (z > max_zoom) {
          resolve(tiles);
          return;
        }
        y = 0;
      }
    }
  }

  // Stats
  statsStore.currentZoom.set(z);
  statsStore.tileCount.set(tiles.size);
  statsStore.progress.set(
    (100 * tiles.size) / statsStore.finalTilesCount.get(),
  );

  requestAnimationFrame(() =>
    createTilesChunked(svg, max_zoom, tiles, resolve, x, y, z),
  );
}

export function createTiles(
  svg: SVGSVGElement,
  max_zoom: number,
): Promise<Map<string, SVGSVGElement>> {
  const tiles = new Map<string, SVGSVGElement>();

  return new Promise<Map<string, SVGSVGElement>>((resolve) => {
    createTilesChunked(svg, max_zoom, tiles, resolve, 0, 0, 0);
  });
}
