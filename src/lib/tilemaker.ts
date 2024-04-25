function intersects(rect_a: DOMRect, rect_b: DOMRect): boolean {
  return !(
    rect_a.x + rect_a.width < rect_b.x ||
    rect_a.x > rect_b.x + rect_b.width ||
    rect_a.y + rect_a.height < rect_b.y ||
    rect_a.y > rect_b.y + rect_b.height
  );
}

function drawDebugRect(svgElement: SVGSVGElement, rect: DOMRect) {
  // Create a new SVG rectangle element
  let debugRect = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );

  // Set the position and size of the rectangle to match the DOMRect
  debugRect.setAttribute("x", rect.x.toString());
  debugRect.setAttribute("y", rect.y.toString());
  debugRect.setAttribute("width", rect.width.toString());
  debugRect.setAttribute("height", rect.height.toString());

  // Set the fill and stroke of the rectangle for debugging purposes
  debugRect.setAttribute("fill", "none");
  debugRect.setAttribute("stroke", "red");
  debugRect.setAttribute("stroke-width", "2");

  // Add the rectangle to the SVG element
  svgElement.appendChild(debugRect);
}

function cropSVGworker(
  elements: NodeListOf<ChildNode>,
  new_element: SVGElement,
  bbox: DOMRect
) {
  for (let element of elements) {
    if (element instanceof SVGGraphicsElement) {
      if (intersects(bbox, element.getBBox())) {
        element.classList.add("intersects");
        let new_node = element.cloneNode(false) as SVGElement;
        new_element.appendChild(new_node);
        if (element.hasChildNodes()) {
          cropSVGworker(
            element.childNodes as NodeListOf<SVGGraphicsElement>,
            new_node as SVGElement,
            bbox
          );
        }

        if (element instanceof SVGTextElement) {
          new_node.innerHTML = element.innerHTML;
        }
      }
    }
  }
}

export function cropSVG(
  element: SVGSVGElement & SVGGraphicsElement,
  bbox: DOMRect
): SVGSVGElement {
  let out = element.cloneNode(false) as SVGSVGElement;

  drawDebugRect(element, bbox);

  cropSVGworker(element.childNodes, out, bbox);

  return out;
}
