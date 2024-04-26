# SVGuez

An attempt at making a fast Lynx

## Structure du projet

- `src/pages/index.astro`: Code de la page du site par défault
- `src/lib/SVGMapLayer.ts` : Définition de la classe **SVGMapLayer**.
- `patches/svgo+x.x.x.patch` : Un patch qui sera appliqué à l'installation de **SVGO** qui rajoute les définitions de `listNodes` et `rrn` comme elements et attributs valides.

## Observations

- Changer (diminuer) les dimensions du viewport d'une image SVG a peu d'impact sur la performance, même si techniquement on rasterize une image plus petite.

## Choses à faire coté Lynx

### Frontend

### Backend

- **pctSvg**: Ne plus utiliser la balise `<style>svg { background-color: #333333; }</style>` mais plutôt l'attribut `style="background-color: #333333"`
