#!/usr/bin/env python3

import os
import threading
import http.server
import socketserver
from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser
from typing import Optional
from svg_tilemaker import SVGuezTilemaker
from selenium.common.exceptions import TimeoutException, InvalidSessionIdException, NoSuchWindowException, NoSuchElementException

SVGUEZ_TILEMAKER_ADDRESS = "localhost"
SVGUEZ_TILEMAKER_PORT = 8080
SVGUEZ_TILEMAKER_URL=f"http://{SVGUEZ_TILEMAKER_ADDRESS}:{SVGUEZ_TILEMAKER_PORT}/tilemaker/"

SVG_SIZE_THRESHOLD = 900000

if __name__ == "__main__":
    parser = ArgumentParser(formatter_class=ArgumentDefaultsHelpFormatter)
    parser.add_argument("svg_folder", help="The path of the folder containing the SVG images", type=str)
    parser.add_argument("zip_folder", help="The path of the folder where the output tilesets zip will be stored", type=str)
    parser.add_argument("-d", "--www-directory", help="The directory containing the SVGuez dist folder", type=str, default="./dist")
    parser.add_argument("-f", "--force", help="Overwrite already generated tilesets", action="store_true")
    args = parser.parse_args()

    svg_folder: str = args.svg_folder
    assert os.path.isdir(svg_folder), "The provided SVG image input directory could not be resolved, try with an absolute path"
    zip_folder: str = args.zip_folder
    assert os.path.isdir(zip_folder), "The provided ZIP tileset output directory could not be resolved, try with an absolute path"
    dist_folder: str = args.www_directory
    assert os.path.isdir(dist_folder), "The provided SVGuez www dist folder could not be resolved, try with an absolute path"
    
    force: bool = args.force

    os.chdir(dist_folder)
    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer((SVGUEZ_TILEMAKER_ADDRESS, SVGUEZ_TILEMAKER_PORT), Handler) as httpd:
        print(f"Started http.server at {SVGUEZ_TILEMAKER_URL}")

        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        files_with_error: list[tuple[str, str]] = []
        tilemaker = SVGuezTilemaker("firefox", True)
        for file in sorted(filter(lambda f: f.endswith(".svg"), os.listdir(svg_folder))):
            in_file = os.path.join(svg_folder, file)
            out_file = os.path.join(zip_folder, f"{file}.zip")
            if os.path.isfile(out_file) and not force:
                print(f"Tileset already generated for {file}, skipping...")
                continue
            
            max_zoom_level, tile_size = [0, 4096] if os.stat(in_file).st_size < SVG_SIZE_THRESHOLD else [5, 1024]

            error: Optional[Exception] = None
            diagnostic: str = ""
            print(f"Starting generation for {file}, max_zoom={max_zoom_level}, tile_size={tile_size}")
            try:
                tilemaker.load(SVGUEZ_TILEMAKER_URL) \
                    .upload_svg(in_file) \
                    .set_max_zoom(max_zoom_level) \
                    .set_tile_size(tile_size) \
                    .set_remove_small(True) \
                    .set_keep_on_final(True) \
                    .generate(out_file)
            except TimeoutException as e:
                error = e
                diagnostic = "likely due to a malformed SVG image"
            except (InvalidSessionIdException, NoSuchWindowException, NoSuchElementException) as e:
                error = e
                diagnostic = "likely due to the browser running out of RAM"
                tilemaker = SVGuezTilemaker("firefox", True)
                print("Browser has been restarted")
            finally:
                if error:
                    error_name = type(error).__name__
                    print(error)
                    print(f"{error_name} occured on {file}, {diagnostic}")
                    files_with_error.append((file, error_name))
                else:
                    print(f"Successful generation for {file}")


        httpd.shutdown()
    print("HTTP server stopped")
    print(f"Had {len(files_with_error)} files with error: {files_with_error}")

    