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
from time import sleep, monotonic
from argparse import ArgumentParser

class Logger():
    def __init__(self, target: object) -> None:
        self.target_name = target.__class__.__name__
        self.silent = False

    def log(self, message: str):
        if self.silent: return
        print(f"[{self.target_name}]: {message}")

    def panic(self, message: str):
        print(f"[PANIC: {self.target_name}] {message}")
        exit(1)

class SVGuezTilemaker():
    def __init__(self, backend: str = "chrome") -> None:
        self.driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install())) if backend == "chrome" else webdriver.Firefox(service=FirefoxService(GeckoDriverManager().install()))
        self.logger = Logger(self)

    def load(self, page_url: str):
        self.driver.get(page_url)
        self.logger.log(f"Navigated to {page_url}")
        return self

    def generate(self):
        wait = WebDriverWait(self.driver, 60)
        self.logger.log("Waiting for image to be processed by SVGO...")
        start_button = wait.until(EC.element_to_be_clickable((By.ID, "start-button")))
        start_button.click()
        self.logger.log("Started generation")
        # Wait for generation to complete
        t0 = monotonic()
        progress_element = self.driver.find_element(By.ID, "stats-progress-text")
        speed_element = self.driver.find_element(By.ID, "stats-processing-speed")
        while start_button.get_attribute("class").split().count("btn-success") == 0: # type: ignore
            sleep(0.4)
            if monotonic() - t0 > 10:
                progress = progress_element.get_attribute("innerText")
                speed = speed_element.get_attribute("innerText")
                self.logger.log(f"Generation progress is {progress} running at {speed}")
                t0 = monotonic()

        return self

    def upload_svg(self, path: str):
        file_upload = self.driver.find_element(By.ID, "file-upload")
        file_upload.send_keys(path)
        self.logger.log(f"Uploaded {path}")
        return self

    def set_max_zoom(self, value: int):
        zoom_level_input = self.driver.find_element(By.ID, "max-zoom-input")
        for _ in range(32): # Set to minimum, 32 is arbitrary
            zoom_level_input.send_keys(Keys.LEFT)
        for _ in range(value):
            zoom_level_input.send_keys(Keys.RIGHT)

        self.logger.log(f"Set max zoom level to {value}")
        return self
    
    def set_tile_size(self, value: int):
        tile_size_select = Select(self.driver.find_element(By.ID, "tile-size-select"))
        try:
            tile_size_select.select_by_value(str(value))
        except NoSuchElementException:
            self.logger.panic("The specified tile-size argument isn't available, try exponents of two (256, 512, 1024, 2048...)")

        self.logger.log(f"Set tile size to {value}x{value} px")
        return self
        
    def set_remove_small(self, value: bool):
        self._set_checkbox("remove-small-input", value)
        self.logger.log(f"Set remove small elements to {value}")
        return self

    def set_keep_on_final(self, value: bool):
        self._set_checkbox("keep-final-input", value)
        self.logger.log(f"Set keep small on final zoom level to {value}")
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
    parser.add_argument("--silent", help="Don't log verbose output", action="store_true")
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
    silent: bool = args.silent

    tilemaker = SVGuezTilemaker(backend)
    tilemaker.logger.silent = silent
    tilemaker.load(page_url) \
        .upload_svg(svg_path) \
        .set_max_zoom(max_zoom_level) \
        .set_tile_size(tile_size) \
        .set_remove_small(remove_small) \
        .set_keep_on_final(keep_on_final) \
        .generate()