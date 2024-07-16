<p align="center" style="margin-bottom: 0px !important;">
    <picture>
        <img width="300" src="public/favicon.svg" alt="SVGuez logo" align="center">
    </picture>
</p>
<h1 align="center" style="margin-top: 0px;">SVGuez</h1>


<p align="center">An attempt at making a fast Lynx</p>

# Project structure

This project is made using the [AstroJS](https://astro.build) framework, the [TailwindCSS](https://tailwindcss.com/) CSS framework, and the [DaisyUI](https://daisyui.com/) component library.

```sh
.
├───patches # Contains npm package patches, notably the SVGO one
├───public # Astro public directory
├───scripts # Contains python scripts relative to the project
└───src # Astro project source code directory
    ├───components
    ├───layouts
    ├───lib
    │   └───layer # Custom leaflet layers
    └───pages # Astro pages directory, the site URL structure is the same as the file structure
```

# Usage

```sh
git clone github.gsissc.myatos.net/FR-ECH-WORLDGRID-LYNX/svguez
cd svguez
npm i # Installs the dependencies and patch the ones with the patches in the `./patches` directory
```

## Development 

```sh
npm run dev
```

## Build the site

```
npm run build
```

The site will be built in `./dist` as static HTML files and bundled CSS and JS.

# Things to know

- The tilemaker page is available at the `/tilemaker` route
- Changing [`./svgo.config.mjs`](./svgo.config.mjs) won't affect the SVGO config for the SVG image upload pre-processing, which is defined in [`./src/lib/svgo.ts`](./src/lib/svgo.ts#L3). So edit both instead
