export async function loadSVG(name: string): Promise<SVGSVGElement> {
  const response = await fetch(`/svg/${name}`);
  const svg = await response.text();

  return new DOMParser().parseFromString(svg, "image/svg+xml")
    .documentElement as unknown as SVGSVGElement;
}

export function intersects(rect_a: DOMRect, rect_b: DOMRect): boolean {
  return !(
    rect_a.x + rect_a.width < rect_b.x ||
    rect_a.x > rect_b.x + rect_b.width ||
    rect_a.y + rect_a.height < rect_b.y ||
    rect_a.y > rect_b.y + rect_b.height
  );
}

function filterSVGworker(
  elements: NodeListOf<ChildNode>,
  new_element: SVGElement,
  predicate: (element: ChildNode) => boolean
) {
  for (let element of elements) {
    if (predicate(element)) {
      let new_node = element.cloneNode(false) as SVGElement;
      new_element.appendChild(new_node);

      if (element.hasChildNodes()) {
        filterSVGworker(
          element.childNodes as NodeListOf<SVGGraphicsElement>,
          new_node as SVGElement,
          predicate
        );
      }

      if (element instanceof SVGTextElement) {
        new_node.innerHTML = element.innerHTML;
      }
    }
  }
}

export function filterSVG(
  element: SVGSVGElement & SVGGraphicsElement,
  predicate: (element: ChildNode) => boolean
): SVGSVGElement {
  let out = element.cloneNode(false) as SVGSVGElement;

  filterSVGworker(element.childNodes, out, predicate);

  return out;
}

export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
  console.log("humancount: ", count);
  var i = count == 0 ? 0 : Math.floor(Math.log(count) / Math.log(1000));
  return (
    +(count / Math.pow(1000, i)).toFixed(2) * 1 +
    " " +
    ["", "K", "M", "G", "T"][i]
  );
}
