import { aDownloadElement } from "./store";

export async function loadSVG(name: string): Promise<SVGSVGElement> {
  const response = await fetch(`/svg/${name}`);
  const svg = await response.text();

  return new DOMParser().parseFromString(svg, "image/svg+xml")
    .documentElement as unknown as SVGSVGElement;
}

const bboxCache = new WeakMap<SVGGraphicsElement, DOMRect>();
export function getTransformedBBox(element: SVGGraphicsElement): DOMRect {
  if (bboxCache.has(element)) {
    return bboxCache.get(element)!;
  }

  const bbox = element.getBBox();
  const ctm = element.getCTM()!;

  const corners = [
    new DOMPoint(bbox.x, bbox.y),
    new DOMPoint(bbox.x + bbox.width, bbox.y),
    new DOMPoint(bbox.x + bbox.width, bbox.y + bbox.height),
    new DOMPoint(bbox.x, bbox.y + bbox.height)
  ];

  const transformedCorners = corners.map(corner => corner.matrixTransform(ctm));

  const xMin = Math.min(...transformedCorners.map(p => p.x));
  const yMin = Math.min(...transformedCorners.map(p => p.y));
  const xMax = Math.max(...transformedCorners.map(p => p.x));
  const yMax = Math.max(...transformedCorners.map(p => p.y));

  const result = new DOMRect(xMin, yMin, xMax - xMin, yMax - yMin);
  bboxCache.set(element, result);

  return result;
}

export function intersects(rect_a: DOMRect, rect_b: DOMRect): boolean {
  return !(
    rect_a.x + rect_a.width < rect_b.x ||
    rect_a.x > rect_b.x + rect_b.width ||
    rect_a.y + rect_a.height < rect_b.y ||
    rect_a.y > rect_b.y + rect_b.height
  );
}

export function computeFinalTileCount(
  tile_size: number,
  max_zoom: number,
  svg_size: { width: number; height: number },
): number {
  const initial_width = Math.ceil(svg_size.width / tile_size);
  const initial_height = Math.ceil(svg_size.height / tile_size);

  let totalTiles = 0;
  for (let z = 0; z <= max_zoom; z++) {
    totalTiles += initial_width * initial_height * Math.pow(2, 2 * z);
  }
  return totalTiles;
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.addEventListener("click", (_e) => {
    document.body.removeChild(a);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  });
  aDownloadElement.set(a);
}

export function humanFileSize(size: number): string {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (
    +(size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

export function humanCount(count: number): string {
  var i = count == 0 ? 0 : Math.floor(Math.log(count) / Math.log(1000));
  return (
    +(count / Math.pow(1000, i)).toFixed(2) * 1 +
    " " +
    ["", "K", "M", "G", "T"][i]
  );
}

// https://stackoverflow.com/a/34270811
export function humanDuration(seconds: number): string {
  var levels = [
    [Math.floor(seconds / 31536000), "y"],
    [Math.floor((seconds % 31536000) / 86400), "d"],
    [Math.floor(((seconds % 31536000) % 86400) / 3600), "h"],
    [Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), "m"],
    [Math.floor(((seconds % 31536000) % 86400) % 3600) % 60, "s"],
  ];
  var returntext = "";

  for (var i = 0, max = levels.length; i < max; i++) {
    if (levels[i][0] === 0) continue;
    returntext +=
      levels[i][0] +
      (levels[i][0] === 1
        ? // @ts-ignore
          levels[i][1].substr(0, levels[i][1].length)
        : levels[i][1]);
  }
  return returntext.trim();
}
