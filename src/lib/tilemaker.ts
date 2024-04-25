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
  console.log(bbox);

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
