import { atom } from "nanostores";

export const settingsStore = {
  maxZoomLevel: atom(2),
  tileSize: atom(256),
};

export const statsStore = {
  currentZoom: atom(0),
  progress: atom(0.0),
  outputSize: atom(0),
};
