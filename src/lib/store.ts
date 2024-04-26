import { atom } from "nanostores";

export const settingsStore = {
  maxZoomLevel: atom(0),
  tileSize: atom(0),
};

export const statsStore = {
  currentZoom: atom(0),
  progress: atom(0.0),
  outputSize: atom(0),
};
