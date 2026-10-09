import {FPS} from '../tutorial/tema';

// Velocidad del video Llave de acceso (1 = original). La locución se acelera aparte con
// scripts/acelerar-voz.sh usando el mismo valor, así clics, zooms y voz siguen sincronizados.
export const VELOCIDAD = 1.1;

// Segundos del guion original → fotogramas a la nueva velocidad
export const seg = (s: number) => Math.round((s * FPS) / VELOCIDAD);
