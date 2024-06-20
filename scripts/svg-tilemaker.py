from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

import os
from argparse import ArgumentParser

class SVGuezTilemaker():
    def __init__(self, page_url: str) -> None:
        self.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()))
        self.driver.get(page_url)
        

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("svg_path", help="The path of the SVG image", type=str)
    parser.add_argument("-z", "--max-zoom-level", help="The max zoom level to generate", type=int, default=5)
    parser.add_argument("-s", "--tile-size", help="The desired tile size", type=int, default=1024)
    parser.add_argument("-u", "--page-url", help="The SVGuez tilemaker page URL, defaults to the SVGUEZ_TILEMAKER_URL env variable value", type=str)
    parser.add_argument("--remove-small", help="Remove small enough elements from low-zoom levels", action="store_true")
    parser.add_argument("--keep-on-final", help="Keep all small elements when generating the final zoom level", action="store_true")
    args = parser.parse_args()
    
    svg_path: str = args.svg_path
    assert os.path.exists(svg_path), "The provided SVG image path could not be resolved, try with an absolute path"

    max_zoom_level: int = args.max_zoom_level
    tile_size: int = args.tile_size

    page_url: str | None = args.page_url if args.page_url else os.environ.get("SVGUEZ_TILEMAKER_URL")
    assert page_url, "Please specify the --page-url parameter or define the SVGUEZ_TILEMAKER_URL to the SVGuez tilemaker page URL."

    remove_small: bool = args.remove_small
    keep_on_final: bool = args.keep_on_final

    tilemaker = SVGuezTilemaker(page_url)
    