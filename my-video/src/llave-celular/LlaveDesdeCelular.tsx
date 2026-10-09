import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {Botis, DESPLAZAMIENTO_MARCO, Fondo, Subtitulo} from '../tutorial/componentes';
import {Final} from '../tutorial/escenas';
import {FPS} from '../tutorial/tema';
import {Cierre, Intro} from '../llave/escenas';
import {Logo} from '../llave/LlaveDeAcceso';
import {seg, VELOCIDAD} from '../llave/tiempo';
import {Paso1, Paso2, Paso3, Paso4, Paso5, Paso6, Paso7, Paso8, Paso9, Transicion} from './escenas';

// Video 2: crear la llave de acceso desde el celular (link por WhatsApp) y probarla en la laptop
export type LlaveCelularProps = {
	botis: boolean;
	// Volumen de la música cuando no hay voz (0–1). Bajo la voz se reduce al 45 %.
	volumenMusica: number;
	subtitulos: boolean;
};

const claves = ['intro', 'paso1', 'paso2', 'paso3', 'paso4', 'paso5', 'transicion', 'paso6', 'paso7', 'paso8', 'paso9', 'cierre'] as const;
type Clave = (typeof claves)[number];

// Duración de cada frase de la locución limpia (public/llave-celular/voz); seg() la ajusta a VELOCIDAD
const duracionVoz: Record<Clave, number> = {intro: 6.87, paso1: 3.41, paso2: 2.09, paso3: 4.41, paso4: 2.89, paso5: 7.03, transicion: 3.4, paso6: 6.07, paso7: 7.69, paso8: 7.37, paso9: 11.35, cierre: 5.83};
const RETRASO_VOZ = 0.3;

// Duración de cada escena (segundos), ajustada a la voz y a los cortes de las grabaciones
const duraciones: Record<Clave, number> = {intro: 8.2, paso1: 4.8, paso2: 3.6, paso3: 6.2, paso4: 4.1, paso5: 8.2, transicion: 4.4, paso6: 7.8, paso7: 9.0, paso8: 8.4, paso9: 12.9, cierre: 6.8};
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
export const DURACION_LLAVE_CELULAR = seg(acumulado) + Math.round(DURACION_FINAL * FPS);

const guion: Record<Clave, string> = {
	intro: '¿Recibiste el link para crear tu llave de acceso? Créala en un minuto desde tu celular.',
	paso1: 'Abre en tu celular el link que te enviamos por WhatsApp.',
	paso2: 'Toca **“Crear una llave de acceso”**.',
	paso3: 'Ingresa la contraseña de tu correo corporativo y toca **“Siguiente”**.',
	paso4: 'Vuelve a tocar **“Crear una llave de acceso”**.',
	paso5: 'Toca **“Continuar”** y confirma con tu rostro o huella. Cuando veas **“Se creó la llave de acceso”**, toca **“Listo”**.',
	transicion: 'Ahora, pruébala en tu laptop.',
	paso6: 'Escribe tu correo corporativo, haz clic en **“Siguiente”** y luego en **“Continuar”**.',
	paso7: 'Si te pide tu contraseña, no la escribas: haz clic en **“Probar otro método”** y elige **“Usar tu llave de acceso”**.',
	paso8: 'Haz clic en **“Continuar”** y elige **“Usar un teléfono o una tablet”**. Aparecerá un código QR.',
	paso9: 'Escanéalo con la cámara de tu celular, toca **“Iniciar sesión con llave de acceso”**, luego **“Continuar”**, y confirma con tu rostro o huella. ¡Y ya estás dentro!',
	cierre: '¡Listo! Ya puedes iniciar sesión sin contraseña, de forma rápida y segura.',
};

const Intro2: React.FC = () => <Intro subtitulo="Desde tu celular, en un minuto." workspaceDesde={2.5} />;
const escenas: Record<Clave, React.FC> = {intro: Intro2, paso1: Paso1, paso2: Paso2, paso3: Paso3, paso4: Paso4, paso5: Paso5, transicion: Transicion, paso6: Paso6, paso7: Paso7, paso8: Paso8, paso9: Paso9, cierre: Cierre};

// Pose(s) y posición de Botis en cada sección
const IZQUIERDA = {x: 0, y: 515, alto: 545};
const GRANDE = {x: 20, y: 410, alto: 650};
const botisPorSeccion: Record<Clave, React.ComponentProps<typeof Botis>> = {
	// cambia a saludo cuando empieza "Créala en un minuto…"
	intro: {poses: [{pose: '2027/duda', desde: 0}, {pose: '2027/saludando', desde: 4.3 / VELOCIDAD}], x: 880, y: 235, alto: 560, suave: true},
	paso1: {poses: [{pose: '2027/senalando', desde: 0}], ...IZQUIERDA},
	paso2: {poses: [{pose: '2027/idea', desde: 0}], ...IZQUIERDA},
	paso3: {poses: [{pose: '2027/laptop', desde: 0}], ...IZQUIERDA},
	paso4: {poses: [{pose: '2027/senalando', desde: 0}], ...IZQUIERDA},
	paso5: {poses: [{pose: '2027/entusiasmado', desde: 0}], ...IZQUIERDA},
	transicion: {poses: [{pose: '2027/pensando', desde: 0}], ...GRANDE},
	paso6: {poses: [{pose: '2027/senalando', desde: 0}], ...IZQUIERDA},
	paso7: {poses: [{pose: '2027/idea', desde: 0}], ...IZQUIERDA},
	paso8: {poses: [{pose: '2027/laptop', desde: 0}], ...IZQUIERDA},
	paso9: {poses: [{pose: '2027/tranquilo', desde: 0}], ...IZQUIERDA},
	cierre: {poses: [{pose: '2027/victoria', desde: 0}], x: 1460, y: 320, alto: 520},
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

export const LlaveDesdeCelular: React.FC<LlaveCelularProps> = ({botis, volumenMusica, subtitulos}) => (
	<AbsoluteFill>
		<Fondo />
		{claves.map((k) => {
			const Escena = escenas[k];
			const {desde, dura} = secciones[k];
			const portada = k === 'intro' || k === 'transicion' || k === 'cierre';
			return (
				<Sequence key={k} name={k} from={seg(desde)} durationInFrames={seg(desde + dura) - seg(desde)}>
					<Escena />
					<Logo desvanecer={k === 'cierre'} />
					{botis ? <Botis {...botisPorSeccion[k]} /> : null}
					{subtitulos ? <Subtitulo texto={guion[k]} desplazamiento={portada ? 0 : DESPLAZAMIENTO_MARCO} /> : null}
					<Sequence from={seg(RETRASO_VOZ)} layout="none">
						<Audio src={staticFile(`llave-celular/voz-rapida/${k}.wav`)} />
					</Sequence>
				</Sequence>
			);
		})}
		<Sequence name="final" from={seg(INICIO_FINAL)} durationInFrames={Math.round(DURACION_FINAL * FPS)}>
			<Final />
		</Sequence>
		{volumenMusica > 0 ? <Audio src={staticFile('llave/musica.wav')} volume={(f) => volumenConVoz(f, volumenMusica)} /> : null}
	</AbsoluteFill>
);
