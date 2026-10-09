import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Botis, DESPLAZAMIENTO_MARCO, Fondo, PoseBotis, Subtitulo} from './componentes';
import {AnadirDelegacion, Cierre, Confirmar, Final, Ingreso, Intro, MiPerfil} from './escenas';
import {DURACION_FINAL, duracionVoz, INICIO_FINAL, RETRASO_VOZ, secciones, seg} from './tema';

export type TutorialProps = {
	// Mostrar a Botis en el video
	botis: boolean;
	// "propia": tu locución, limpia y cortada por escena (public/voz-real/*.wav)
	// "borrador": voz sintética de prueba (public/voz/*.wav)
	// null: sin voz
	locucion: 'propia' | 'borrador' | null;
	// Volumen de la música cuando no hay voz (0–1). Bajo la voz se reduce a la mitad.
	volumenMusica: number;
	subtitulos: boolean;
};

const guion: Record<keyof typeof secciones, string> = {
	intro:
		'¿Estarás ausente por vacaciones u otro motivo? Puedes delegar tus aprobaciones en Freshservice de forma rápida y sencilla.',
	ingreso: 'Ingresa al portal Freshservice utilizando la opción **“Iniciar sesión con Google”**.',
	perfil: 'Una vez dentro, dirígete a **“Mi perfil”**.',
	anadir: 'Selecciona **“Añadir delegación”** y completa los campos solicitados en la ventana emergente.',
	confirmar: 'Finalmente, revisa la información y haz clic en **“Delegar”**.',
	cierre: '¡Listo! Tus aprobaciones quedarán delegadas durante tu ausencia.',
};

const escenas: Record<keyof typeof secciones, React.FC> = {
	intro: Intro,
	ingreso: Ingreso,
	perfil: MiPerfil,
	anadir: AnadirDelegacion,
	confirmar: Confirmar,
	cierre: Cierre,
};

// Pose(s) y posición de Botis en cada sección (x, y = esquina superior izquierda; alto en px)
const IZQUIERDA = {x: 8, y: 600, alto: 440};
const botisPorSeccion: Record<keyof typeof secciones, {poses: {pose: PoseBotis; desde: number}[]; x: number; y: number; alto: number}> = {
	// pregunta "¿Estarás ausente…?" → duda; con "Puedes delegar…" (5,07 s en tu locución) → saluda
	intro: {poses: [{pose: 'duda', desde: 0}, {pose: 'saludando', desde: 5.07}], x: 950, y: 330, alto: 430},
	ingreso: {poses: [{pose: 'senalando', desde: 0}], ...IZQUIERDA},
	perfil: {poses: [{pose: 'senalando', desde: 0}], ...IZQUIERDA},
	anadir: {poses: [{pose: 'pensando', desde: 0}], ...IZQUIERDA},
	confirmar: {poses: [{pose: 'senalando', desde: 0}], ...IZQUIERDA},
	cierre: {poses: [{pose: 'celebrando', desde: 0}], x: 1520, y: 390, alto: 400},
};

const CARPETA_VOZ = {propia: 'voz-real', borrador: 'voz'} as const;
const claves = Object.keys(secciones) as (keyof typeof secciones)[];

// Tramos (en fotogramas) en los que suena la voz, para bajar la música debajo de ella
const tramosVoz = claves.map((k) => {
	const inicio = seg(secciones[k].desde + RETRASO_VOZ);
	return [inicio, inicio + seg(duracionVoz[k])] as const;
});

const volumenConVoz = (frame: number, base: number) => {
	const rampa = 9; // 0,3 s de transición
	const cercania = Math.max(
		...tramosVoz.map(([a, b]) =>
			interpolate(frame, [a - rampa, a, b, b + rampa], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
		),
	);
	return base * (1 - 0.55 * cercania); // bajo la voz queda al 45 % (se escucha, sin competir con la locución)
};

// Logo Interseguro arriba a la izquierda (manual de marca, págs. 41–42):
// logo azul sobre fondo claro, tal como fue entregado (sin cambiar su color).
const Logo: React.FC<{desvanecer: boolean}> = ({desvanecer}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const salida = desvanecer ? interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
	const entrada = spring({frame: frame - 3, fps, config: {damping: 20}}) * salida;
	return (
		<Img
			src={staticFile('marca/logo-interseguro.png')}
			style={{position: 'absolute', left: 48, top: 34, height: 40, opacity: entrada}}
		/>
	);
};

export const Tutorial: React.FC<TutorialProps> = ({botis, locucion, volumenMusica, subtitulos}) => {
	return (
		<AbsoluteFill>
			<Fondo />
			{claves.map((k) => {
				const Escena = escenas[k];
				const {desde, dura} = secciones[k];
				const portada = k === 'intro' || k === 'cierre';
				return (
					<Sequence key={k} name={k} from={seg(desde)} durationInFrames={seg(dura)}>
						<Escena />
						<Logo desvanecer={k === 'cierre'} />
						{botis ? <Botis {...botisPorSeccion[k]} /> : null}
						{subtitulos ? <Subtitulo texto={guion[k]} desplazamiento={portada ? 0 : DESPLAZAMIENTO_MARCO} /> : null}
						{locucion ? (
							<Sequence from={seg(RETRASO_VOZ)} layout="none">
								<Audio src={staticFile(`${CARPETA_VOZ[locucion]}/${k}.wav`)} />
							</Sequence>
						) : null}
					</Sequence>
				);
			})}
			<Sequence name="final" from={seg(INICIO_FINAL)} durationInFrames={seg(DURACION_FINAL)}>
				<Final />
			</Sequence>
			{volumenMusica > 0 ? <Audio src={staticFile('musica/fondo.wav')} volume={(f) => volumenConVoz(f, volumenMusica)} /> : null}
		</AbsoluteFill>
	);
};
