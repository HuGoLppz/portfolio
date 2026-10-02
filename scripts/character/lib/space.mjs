// Espacio de trabajo del personaje.
// "pu" = unidades de píxel de character.png (1024x1536):  x = px - CX (derecha +),  y = FEET - py (arriba +),
// z hacia el espectador. Al exportar se divide entre S para obtener unidades de escena (~1.96 de alto).
export const IW = 1024, IH = 1536;
export const CX = 508;          // eje vertical del personaje en la imagen
export const FEET = 1523;       // fila de la suela (py) = y 0
export const TOP = 20;          // fila de lo más alto del pelo
export const S = (FEET - TOP) / 1.9606; // píxeles por unidad de escena

export const P = (px, py, z = 0) => [px - CX, FEET - py, z];

// Coordenadas originales de white_mesh.glb (y de -1.0001 a 0.9605) → píxeles de character.png
export const SCL = 1495 / (0.9605 + 1.0001);
export const legacyToPx = (x, y) => [512 + x * SCL, 5 + (0.9605 - y) * SCL];
