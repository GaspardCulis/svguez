import { aDownloadElement } from "./store";

export async function loadSVG(name: string): Promise<SVGSVGElement> {
  const response = await fetch(`/svg/${name}`);
  const svg = await response.text();

  return new DOMParser().parseFromString(svg, "image/svg+xml")
    .documentElement as unknown as SVGSVGElement;
}

export function getTransformedBBox(element: SVGGraphicsElement): DOMRect {
  const bbox = element.getBBox();
  const ctm = element.getCTM()!;

  const point = element.ownerSVGElement!.createSVGPoint();
  point.x = bbox.x;
  point.y = bbox.y;
  const topLeftTransformed = point.matrixTransform(ctm);

  point.x = bbox.x + bbox.width;
  point.y = bbox.y + bbox.height;
  const bottomRightTransformed = point.matrixTransform(ctm);

  return new DOMRect(
    topLeftTransformed.x,
    topLeftTransformed.y,
    bottomRightTransformed.x - topLeftTransformed.x,
    bottomRightTransformed.y - topLeftTransformed.y
  );
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
