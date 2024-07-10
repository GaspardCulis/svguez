function filterSVGworker(
  elements: NodeListOf<ChildNode>,
  new_element: SVGElement,
  predicate: (element: ChildNode) => boolean,
) {
  for (let element of elements) {
    if (predicate(element)) {
      let new_node = element.cloneNode(false) as SVGElement;
      new_element.appendChild(new_node);

      if (element.hasChildNodes()) {
        filterSVGworker(
          element.childNodes as NodeListOf<SVGGraphicsElement>,
          new_node as SVGElement,
          predicate,
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
  predicate: (element: ChildNode) => boolean,
): SVGSVGElement {
  let out = element.cloneNode(false) as SVGSVGElement;

  filterSVGworker(element.childNodes, out, predicate);

  return out;
}
