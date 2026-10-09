import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Botis, DESPLAZAMIENTO_MARCO, Fondo, Subtitulo} from '../tutorial/componentes';
import {Final} from '../tutorial/escenas';
import {seg} from '../tutorial/tema';
import {Antes, Cierre, Intro, Paso1, Paso2, Paso3, Paso4, Paso5, Paso6} from './escenas';

export type LlaveProps = {
	botis: boolean;
	// Volumen de la música cuando no hay voz (0–1). Bajo la voz se reduce al 45 %.
	volumenMusica: number;
	subtitulos: boolean;
};

const claves = ['intro', 'antes', 'paso1', 'paso2', 'paso3', 'paso4', 'paso5', 'paso6', 'cierre'] as const;
type Clave = (typeof claves)[number];

// Duración de cada frase de la locución (medida al cortarla con scripts/cortar-voz.js)
const duracionVoz: Record<Clave, number> = {intro: 10.25, antes: 7, paso1: 7.56, paso2: 6.7, paso3: 5.97, paso4: 9.34, paso5: 9.2, paso6: 6.17, cierre: 5.8};
const RETRASO_VOZ = 0.3;

// Duración de cada escena (segundos), ajustada a la voz y a las grabaciones
const duraciones: Record<Clave, number> = {intro: 11, antes: 8, paso1: 8.4, paso2: 7.6, paso3: 7.4, paso4: 10.6, paso5: 10.3, paso6: 8.2, cierre: 6.8};
const DURACION_FINAL = 2.5;

let acumulado = 0;
const secciones = Object.fromEntries(
	claves.map((k) => {
		const s = {desde: acumulado, dura: duraciones[k]};
		acumulado += duraciones[k];
		return [k, s];
	}),
) as Record<Clave, {desde: number; dura: number}>;
const INICIO_FINAL = acumulado;
export const DURACION_LLAVE = seg(acumulado + DURACION_FINAL);

const guion: Record<Clave, string> = {
	intro: '¿Quieres iniciar sesión en tu correo corporativo de forma más rápida y segura? Crea tu llave de acceso en Google Workspace.',
	antes: 'Antes de empezar, verifica que tengas tu correo corporativo configurado en tu celular.',
	paso1: 'En Gmail, haz clic en el botón **“Interseguro”** y luego en **“Administrar tu Cuenta de Google”**.',
	paso2: 'Ingresa a **“Seguridad y acceso”** y selecciona **“Llaves de acceso y llaves de seguridad”**.',
	paso3: 'Haz clic en **“Crear una llave de acceso”** y luego en **“Usar otro dispositivo”**.',
	paso4: 'Escanea el código QR con tu celular, confirma con tu rostro o huella y, al terminar, haz clic en **“Listo”**.',
	paso5: 'La próxima vez que inicies sesión, escribe tu correo corporativo, haz clic en **“Siguiente”** y luego en **“Continuar”**.',
	paso6: 'Escanea el código QR con tu celular y confirma con tu rostro o huella digital.',
	cierre: '¡Listo! Ya puedes iniciar sesión sin contraseña, de forma rápida y segura.',
};

const escenas: Record<Clave, React.FC> = {intro: Intro, antes: Antes, paso1: Paso1, paso2: Paso2, paso3: Paso3, paso4: Paso4, paso5: Paso5, paso6: Paso6, cierre: Cierre};

// Pose(s) y posición de Botis en cada sección
const IZQUIERDA = {x: 8, y: 600, alto: 440};
const botisPorSeccion: Record<Clave, React.ComponentProps<typeof Botis>> = {
	intro: {poses: [{pose: '2027/duda', desde: 0}, {pose: '2027/saludando', desde: 5.6}], x: 950, y: 330, alto: 430},
	antes: {poses: [{pose: '2027/pensando', desde: 0}], ...IZQUIERDA},
	paso1: {poses: [{pose: '2027/laptop', desde: 0}], ...IZQUIERDA},
	paso2: {poses: [{pose: '2027/senalando', desde: 0}], ...IZQUIERDA},
	paso3: {poses: [{pose: '2027/idea', desde: 0}], ...IZQUIERDA},
	paso4: {poses: [{pose: '2027/duda', desde: 0}], ...IZQUIERDA},
	paso5: {poses: [{pose: '2027/entusiasmado', desde: 0}], ...IZQUIERDA},
	paso6: {poses: [{pose: '2027/tranquilo', desde: 0}], ...IZQUIERDA},
	cierre: {poses: [{pose: '2027/victoria', desde: 0}], x: 1520, y: 390, alto: 400},
};

// Tramos en los que suena la voz, para bajar la música debajo de ella
const tramosVoz = claves.map((k) => {
	const inicio = seg(secciones[k].desde + RETRASO_VOZ);
	return [inicio, inicio + seg(duracionVoz[k])] as const;
});
const volumenConVoz = (frame: number, base: number) => {
	const rampa = 9;
	const cercania = Math.max(
		...tramosVoz.map(([a, b]) => interpolate(frame, [a - rampa, a, b, b + rampa], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})),
	);
	return base * (1 - 0.55 * cercania);
};

const Logo: React.FC<{desvanecer: boolean}> = ({desvanecer}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const salida = desvanecer ? interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
	const entrada = spring({frame: frame - 3, fps, config: {damping: 20}}) * salida;
	return <Img src={staticFile('marca/logo-interseguro.png')} style={{position: 'absolute', left: 48, top: 34, height: 40, opacity: entrada}} />;
};

export const LlaveDeAcceso: React.FC<LlaveProps> = ({botis, volumenMusica, subtitulos}) => (
	<AbsoluteFill>
		<Fondo />
		{claves.map((k) => {
			const Escena = escenas[k];
			const {desde, dura} = secciones[k];
			const portada = k === 'intro' || k === 'antes' || k === 'cierre';
			return (
				<Sequence key={k} name={k} from={seg(desde)} durationInFrames={seg(dura)}>
					<Escena />
					<Logo desvanecer={k === 'cierre'} />
					{botis ? <Botis {...botisPorSeccion[k]} /> : null}
					{subtitulos ? <Subtitulo texto={guion[k]} desplazamiento={portada ? 0 : DESPLAZAMIENTO_MARCO} /> : null}
					<Sequence from={seg(RETRASO_VOZ)} layout="none">
						<Audio src={staticFile(`llave/voz/${k}.wav`)} />
					</Sequence>
				</Sequence>
			);
		})}
		<Sequence name="final" from={seg(INICIO_FINAL)} durationInFrames={seg(DURACION_FINAL)}>
			<Final />
		</Sequence>
		{volumenMusica > 0 ? <Audio src={staticFile('llave/musica.wav')} volume={(f) => volumenConVoz(f, volumenMusica)} /> : null}
	</AbsoluteFill>
);
