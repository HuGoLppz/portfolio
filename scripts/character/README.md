# Generación de `src/assets/character.glb`

Convierte `src/assets/white_mesh.glb` (malla blanca) en el personaje de `src/assets/character.png`:
limpia la malla, corrige proporciones (warp por filas), regulariza el pelo, proyecta el color
de la ilustración (UV frontal + color plano para laterales/espalda) y exporta el GLB.

```bash
cd scripts/character && npm i --no-save pngjs jpeg-js && node build.mjs
```
