from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager

import os
from time import sleep
from argparse import ArgumentParser

class SVGuezTilemaker():
    def __init__(self, backend: str = "chrome") -> None:
        self.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install())) if backend == "chrome" else webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()))

    def load(self, page_url: str):
        self.driver.get(page_url)
        return self

    def generate(self):
        wait = WebDriverWait(self.driver, 60)
        start_button = wait.until(EC.element_to_be_clickable((By.ID, "start-button")))
        start_button.click()
        return self

    def upload_svg(self, path: str):
        file_upload = self.driver.find_element(By.ID, "file-upload")
        file_upload.send_keys(path)
        return self

    def set_max_zoom(self, value: int):
        zoom_level_input = self.driver.find_element(By.ID, "max-zoom-input")
        for _ in range(32): # Set to minimum, 32 is arbitrary
            zoom_level_input.send_keys(Keys.LEFT)
        for _ in range(value):
            zoom_level_input.send_keys(Keys.RIGHT)

        return self
    
    def set_tile_size(self, value: int):
        tile_size_select = Select(self.driver.find_element(By.ID, "tile-size-select"))
        try:
            tile_size_select.select_by_value(str(value))
        except NoSuchElementException:
            raise IndexError("The specified tile-size argument isn't available, try exponents of two (256, 512, 1024, 2048...)")

        return self
        
    def set_remove_small(self, value: bool):
        self._set_checkbox("remove-small-input", value)
        return self

    def set_keep_on_final(self, value: bool):
        self._set_checkbox("keep-final-input", value)
        return self

    def _set_checkbox(self, id: str, checked: bool):
        checkbox = self.driver.find_element(By.ID, id)
        is_checked = checkbox.is_selected()

        if (checked and not is_checked) or (is_checked and not checked):
            checkbox.click()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("svg_path", help="The path of the SVG image", type=str)
    parser.add_argument("-z", "--max-zoom-level", help="The max zoom level to generate", type=int, default=5)
    parser.add_argument("-s", "--tile-size", help="The desired tile size", type=int, default=1024)
    parser.add_argument("-u", "--page-url", help="The SVGuez tilemaker page URL, defaults to the SVGUEZ_TILEMAKER_URL env variable value", type=str)
    parser.add_argument("-b", "--backend", help="The web driver backend", choices=["chrome", "firefox"], default="chrome")
    parser.add_argument("--remove-small", help="Remove small enough elements from low-zoom levels", action="store_true")
    parser.add_argument("--keep-on-final", help="Keep all small elements when generating the final zoom level", action="store_true")
    args = parser.parse_args()
    
    svg_path: str = args.svg_path
    assert os.path.exists(svg_path), "The provided SVG image path could not be resolved, try with an absolute path"

    max_zoom_level: int = args.max_zoom_level
    tile_size: int = args.tile_size

    page_url: str | None = args.page_url if args.page_url else os.environ.get("SVGUEZ_TILEMAKER_URL")
    assert page_url, "Please specify the --page-url parameter or define the SVGUEZ_TILEMAKER_URL to the SVGuez tilemaker page URL."

    backend: str = args.backend

    remove_small: bool = args.remove_small
    keep_on_final: bool = args.keep_on_final

    tilemaker = SVGuezTilemaker(backend) \
        .load(page_url) \
        .upload_svg(svg_path) \
        .set_max_zoom(max_zoom_level) \
        .set_tile_size(tile_size) \
        .set_remove_small(remove_small) \
        .set_keep_on_final(keep_on_final) \
        .generate()
    
    sleep(3600)