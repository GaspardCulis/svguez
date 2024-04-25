import { defineConfig } from "astro/config";
import worker from "@astropub/worker";

// https://astro.build/config
export default defineConfig({
  integrations: [worker()],
});
