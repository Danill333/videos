import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/* ---------- Tipografía de marca: Interseguro Sans (manual de marca, pág. 3) ----------
   Bold y Medium: titulares, números y textos breves. Regular y Book: textos largos.
   Nunca en cursiva. */
export const fontFamily = 'Interseguro Sans';
const pesos: [string, string][] = [
	['InterseguroSans-Book.otf', '300'],
	['InterseguroSans.otf', '400'],
	['InterseguroSans-Medium.otf', '500'],
	['InterseguroSans-Bold.otf', '700'],
];
for (const [archivo, peso] of pesos) {
	loadFont({family: fontFamily, url: staticFile(`fuentes/${archivo}`), weight: peso, style: 'normal'});
}

/* ---------- Paleta oficial Interseguro (manual de marca, págs. 8–9 y 41) ---------- */
export const marca = {
	azulInterseguro: '#0A6AF5', // color corporativo
	blancoNube: '#E6F1F9',
	blanco960: '#EFF6FB',
	blanco980: '#F7FAFD',
	azul1: '#80DFFF',
	azul2: '#3BA2F7',
	azul3: '#074EAB',
	azul4: '#042C6C',
	magenta: '#F32682', // solo como detalle (0–15 %)
};

// Usos dentro del video
export const colores = {
	azulOscuro: marca.azul4, // textos, etiquetas y caja de subtítulos
	azul: marca.azulInterseguro, // color principal y paneles
	celeste: marca.azul2,
	fondo: marca.blanco960,
	texto: marca.azul4,
	resaltado: marca.azulInterseguro, // recuadros que señalan botones y campos
	destacado: marca.azul1, // palabras clave en los subtítulos (combinación Azul 4 + Azul 1)
	acento: marca.magenta,
};
export const FPS = 30;
export const seg = (s: number) => Math.round(s * FPS);

// Duración de cada frase de la locución (segundos), medida al cortarla (scripts/cortar-voz.js)
export const duracionVoz = {intro: 10.27, ingreso: 5.99, perfil: 3.6, anadir: 12.16, confirmar: 6.52, cierre: 4.65};

// La voz empieza este tiempo después del inicio de cada escena
export const RETRASO_VOZ = 0.3;

// Duración de cada escena (segundos), ajustada a la locución y a la grabación
const duraciones = {intro: 11, ingreso: 7, perfil: 5.5, anadir: 16, confirmar: 8.4, cierre: 6};

type Clave = keyof typeof duraciones;
let acumulado = 0;
export const secciones = Object.fromEntries(
	(Object.keys(duraciones) as Clave[]).map((k) => {
		const s = {desde: acumulado, dura: duraciones[k]};
		acumulado += duraciones[k];
		return [k, s];
	}),
) as Record<Clave, {desde: number; dura: number}>;

// Cierre final: logo Interseguro que se desvanece hasta dejar la pantalla en blanco
export const INICIO_FINAL = acumulado;
export const DURACION_FINAL = 2.5;

export const DURACION_TOTAL = seg(acumulado + DURACION_FINAL);
