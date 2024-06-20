import selenium
from argparse import ArgumentParser

if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("svg_path", help="The path of the SVG image", type=str)
    parser.add_argument("-z", "--max-zoom-level", help="The max zoom level to generate", type=int)
    parser.add_argument("-s", "--tile-size", help="The desired tile size", type=int)
    parser.add_argument("--remove-small", help="Remove small enough elements from low-zoom levels", action="store_true")
    parser.add_argument("--keep-on-final", help="Keep all small elements when generating the final zoom level", action="store_true")
    args = parser.parse_args()
    print(args)