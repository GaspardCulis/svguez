export async function loadSVG(name: string): Promise<SVGSVGElement> {
  const response = await fetch(`/svg/${name}`);
  const svg = await response.text();

  return new DOMParser().parseFromString(svg, "image/svg+xml")
    .documentElement as unknown as SVGSVGElement;
}
