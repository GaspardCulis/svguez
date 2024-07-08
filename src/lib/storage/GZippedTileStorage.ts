import type { TileStorage } from "../tilemaker";
import pako from "pako"; // A library for gzip compression and decompression

export class CompressedTileStorage implements TileStorage {
  private storage: Map<string, Uint8Array> = new Map();

  constructor() {}

  set(coords: string, tile: SVGSVGElement): void {
    const xml = new XMLSerializer().serializeToString(tile);
    // @ts-ignore
    tile = null;
    const compressed = pako.gzip(xml);
    this.storage.set(coords, compressed);
  }

  get(coords: string): SVGSVGElement | undefined {
    const compressed = this.storage.get(coords);
    if (!compressed) {
      return undefined;
    }
    const xml = pako.ungzip(compressed, { to: "string" });
    const parser = new DOMParser();
    const svg = parser.parseFromString(xml, "image/svg+xml").documentElement;
    return svg as any as SVGSVGElement;
  }

  [Symbol.iterator](): Iterator<[string, SVGSVGElement]> {
    const self = this;
    const keys = Array.from(this.storage.keys());
    let index = 0;
    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index];
          const value = self.get(key);
          index++;
          return { value: [key, value!], done: false };
        } else {
          return { done: true };
        }
      },
    };
  }

  get size(): number {
    return this.storage.size;
  }
}
