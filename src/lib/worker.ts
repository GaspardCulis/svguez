import JSZip from "jszip";
import { createTiles } from "./tilemaker";
import { loadSVG, saveBlob } from "./utils";

addEventListener("message", async (event: MessageEvent<SVGSVGElement>) => {
  const svg = event.data;

  console.log("Creating tiles...");
  const tiles = createTiles(svg, 3);

  // Save to zip
  console.log("Saving to zip...");
  const zip = new JSZip();
  for (const [key, tile] of tiles) {
    zip.file(key, tile.outerHTML);
  }
  console.log("Saved to zip");

  const blob = await zip.generateAsync({ type: "blob" });

  postMessage(blob);
});
