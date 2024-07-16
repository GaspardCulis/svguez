# SVGuez Tilemaker scripts

These python scripts are a CLI abstraction of the SVGuez web-app.

## Usage

```sh
# Create a new python virtual environment
python -m venv .venv
# For UNIX systems :
. .venv/bin/activate
# For Cringedows systems :
.\.venv\Scripts\Activate.ps1
```

### svg_tilemaker.py

This script uses [Selenium](https://www.selenium.dev/) to use the SVGuez web-app website in a script-controlled web browser. It requires the URL of the SVGuez web-app.

```sh 
usage: svg_tilemaker.py [-h] [-z MAX_ZOOM_LEVEL] [-s TILE_SIZE] [-u PAGE_URL] [-b {chrome,firefox}] [--remove-small] [--keep-on-final] [--headless] [--silent] svg_path out_zip_path

positional arguments:
  svg_path              The path of the SVG image
  out_zip_path          The path of the output zipped tilemap

options:
  -h, --help            show this help message and exit
  -z MAX_ZOOM_LEVEL, --max-zoom-level MAX_ZOOM_LEVEL
                        The max zoom level to generate
  -s TILE_SIZE, --tile-size TILE_SIZE
                        The desired tile size
  -u PAGE_URL, --page-url PAGE_URL
                        The SVGuez tilemaker page URL, defaults to the SVGUEZ_TILEMAKER_URL env variable value
  -b {chrome,firefox}, --backend {chrome,firefox} # Firefox is more performant
                        The web driver backend
  --remove-small        Remove small enough elements from low-zoom levels
  --keep-on-final       Keep all small elements when generating the final zoom level
  --headless            Headless driver mode
  --silent              Don't log verbose output
```

### svg_folder_tilemaker.py

This script is a wrapper around the `svg_tilemaker.py` code, which iterates the SVG files in an input directory and generates the ZIP tilemaps in an output folder. It self-hosts the SVGuez web-app in a separate thread.

```
usage: svg_folder_tilemaker.py [-h] [-d WWW_DIRECTORY] [-f] svg_folder zip_folder

positional arguments:
  svg_folder            The path of the folder containing the SVG images
  zip_folder            The path of the folder where the output tilesets zip will be stored

options:
  -h, --help            show this help message and exit
  -d WWW_DIRECTORY, --www-directory WWW_DIRECTORY
                        The directory containing the SVGuez dist folder
  -f, --force           Overwrite already generated tilesets
```
