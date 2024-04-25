import { filterSVG, intersects } from "./utils";

const BASE_TILE_SIZE = 256;

export function createTile(
  svg: SVGSVGElement,
  z: number,
  x: number,
  y: number
): SVGSVGElement {
  let tile_size = BASE_TILE_SIZE / Math.pow(2, z);

  let min_size = tile_size / 100;

  const bbox = new DOMRect(x * tile_size, y * tile_size, tile_size, tile_size);

  const svg_tile = filterSVG(svg, (element) => {
    if (element instanceof SVGGraphicsElement) {
      let element_bbox = element.getBBox();

      if (!intersects(bbox, element_bbox)) {
        return false;
      }

      if (element_bbox.height < min_size || element_bbox.width < min_size) {
        return false;
      }
    }

    return true;
  });

  // Update viewport
  svg_tile.setAttribute(
    "viewBox",
    `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
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
  z: number
) {
  if (z > max_zoom) {
    resolve(tiles);
    return;
  }
  const initial_width = Math.ceil(svg.width.baseVal.value / BASE_TILE_SIZE);
  const initial_height = Math.ceil(svg.height.baseVal.value / BASE_TILE_SIZE);

  for (let i = 0; i < 10; i++) {
    // Process 10 tiles at a time
    let svg_tile = createTile(svg, z, x, y);
    let key = `${z}/${x}/${y}.svg`;
    tiles.set(key, svg_tile);
    console.log(`Created tile ${key}`);

    x++;
    if (x >= initial_width * Math.pow(2, z)) {
      x = 0;
      y++;
      if (y >= initial_height * Math.pow(2, z)) {
        z++;
        y = 0;
      }
    }
  }

  requestAnimationFrame(() =>
    createTilesChunked(svg, max_zoom, tiles, resolve, x, y, z)
  );
}

export function createTiles(
  svg: SVGSVGElement,
  max_zoom: number
): Promise<Map<string, SVGSVGElement>> {
  const tiles = new Map<string, SVGSVGElement>();
  return new Promise<Map<string, SVGSVGElement>>((resolve) => {
    createTilesChunked(svg, max_zoom, tiles, resolve, 0, 0, 0);
  });
}
