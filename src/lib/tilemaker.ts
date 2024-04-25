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

export function createTiles(
  svg: SVGSVGElement,
  max_zoom: number
): Map<string, SVGSVGElement> {
  const out = new Map<string, SVGSVGElement>();
  const initial_width = Math.ceil(svg.width.baseVal.value / BASE_TILE_SIZE);
  const initial_height = Math.ceil(svg.height.baseVal.value / BASE_TILE_SIZE);

  for (let z = 0; z <= max_zoom; z++) {
    for (let y = 0; y < initial_height * Math.pow(2, z); y++) {
      for (let x = 0; x < initial_width * Math.pow(2, z); x++) {
        let svg_tile = createTile(svg, z, x, y);
        let key = `${z}/${x}/${y}.svg`;
        out.set(key, svg_tile);
        console.log(`Created tile ${key}`);
      }
    }
  }

  return out;
}
