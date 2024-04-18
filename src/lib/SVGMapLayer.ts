import L from "leaflet";
import { loadSVG } from "./utils";

/** Classe représentant un {@link L.SVGOverlay} auquel est associé un niveau de zoom */
export default class SVGMapLayer {
  private constructor(
    /** Le niveau de zoom Leaflet ({@link L.Map.getZoom}) au delà duquel l'élement doit être visible */
    readonly zoom_level: number,
    /** Une référence à l'élément SVG à afficher dans notre {@link L.SVGOverlay} */
    readonly element: SVGElement,
    /** Le layer d'affichage du SVG qui sera ajouté dynamiquement à la {@link L.Map} */
    readonly overlay: L.SVGOverlay,
    /** @readonly Propriété mise à jour en fonction de la présence ou non du {@link L.SVGOverlay} sur la carte */
    public visible: boolean,
    /** Un cache contenant les références aux éléments `<path>` du SVG ainsi que la valeur initiale de leur attribut `stroke_width` */
    private paths: Map<SVGPathElement, number>
  ) {}

  /**
   * Le constructeur de la classe. Est asynchrone car doit charger le SVG
   * @param params L'objet contenant les paramètres d'initialisation de la classe
   * @param params.path Le chemin relatif du SVG (voir {@link loadSVG})
   * @param params.zoom_level Voir {@link SVGMapLayer.zoom_level}
   * @param params.bounds La zone limite du layer SVG sur la carte (passé au constructeur de {@link L.SVGOverlay})
   */
  static async from(params: {
    path: string;
    zoom_level: number;
    bounds: L.LatLngBoundsExpression;
  }): Promise<SVGMapLayer> {
    const { path, zoom_level, bounds } = params;

    const visible = false;
    const element = await loadSVG(path);
    const overlay = new L.SVGOverlay(element, bounds);
    const paths: Map<SVGPathElement, number> = new Map();
    // Cherche et charge tous les éléments `<path>` du SVG ainsi que la valeur initiale de leur attribut `stroke_width` dans le cache.
    element
      .querySelectorAll("path")
      .forEach((e) =>
        paths.set(e, parseInt(e.getAttribute("stroke-width") || "1"))
      );

    return new SVGMapLayer(zoom_level, element, overlay, visible, paths);
  }

  /**
   * Méthode ajoutant le {@link SVGMapLayer} sur la carte Leaflet
   *
   * Ajoute des listeners aux event de zoom de la carte qui mettrons à jour la présence ou non du {@link L.SVGOverlay} sur la carte.
   * Ils mettrons aussi à jour les attributs `stroke-width` des éléments `<path>` présents dans le cache ({@link SVGMapLayer.paths})
   *
   * @param map La {@link L.Map} Leaflet sur laquelle ajouter le {@link SVGMapLayer}
   */
  public addTo(map: L.Map) {
    map.on("zoomend", (_e) => {
      const current_zoom = map.getZoom();
      this.updateVisibility(map);
      // Mettre à jour les attributs `stroke-width` des éléments `<path>` uniquement si dans la plage de zoom visible
      if (this.visible) {
        this.paths.forEach((initialStrokeWidth, path) => {
          path.setAttribute(
            "stroke-width",
            `${initialStrokeWidth / Math.pow(current_zoom, 2)}` // Formule à revoir
          );
        });
      }
    });

    // Mettre à jour la visibilité dès le chargement initial, sans attendre un event de zoom
    this.updateVisibility(map);
  }

  /**
   * Enlève ou ajoute le layer {@link L.SVGOverlay} à la carte Leaflet en fonction du niveau de zoom actuel,
   * ainsi que dans le niveau de zoom spécifié dans {@link SVGMapLayer.zoom_level}
   *
   * @param map La {@link L.Map} Leaflet sur laquelle mettre à jour la présence ou non du {@link L.SVGOverlay}
   */
  private updateVisibility(map: L.Map) {
    const current_zoom = map.getZoom();
    if (current_zoom >= this.zoom_level) {
      if (!map.hasLayer(this.overlay)) {
        this.overlay.addTo(map);
        this.visible = true;
      }
    } else if (map.hasLayer(this.overlay)) {
      this.overlay.removeFrom(map);
      this.visible = false;
    }
  }
}
