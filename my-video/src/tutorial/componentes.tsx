import React from 'react';
import {
	AbsoluteFill,
	Img,
	interpolate,
	OffthreadVideo,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {colores, fontFamily, marca, seg} from './tema';

// Rectángulo en coordenadas normalizadas (0–1) respecto al contenido del marco
export type Rect = {x: number; y: number; w: number; h: number};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ---------- Fondo general ---------- */
export const Fondo: React.FC = () => (
	<AbsoluteFill
		style={{
			background: `linear-gradient(160deg, #FFFFFF 0%, ${marca.blanco980} 50%, ${colores.fondo} 100%)`
		}}
	/>
);

/* ---------- Etiqueta "Paso X de 4" ---------- */
export const Paso: React.FC<{numero: number; titulo: string; total?: number}> = ({numero, titulo, total = 4}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entrada = spring({frame, fps, config: {damping: 18}});
	return (
		<div
			style={{
				position: 'absolute',
				top: 30,
				left: 345,
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				fontFamily,
				opacity: entrada,
				transform: `translateX(${(1 - entrada) * -40}px)`,
			}}
		>
			<div
				style={{
					background: colores.azul,
					color: 'white',
					fontWeight: 500,
					fontSize: 24,
					borderRadius: 999,
					padding: '8px 20px',
				}}
			>
				Paso {numero} de {total}
			</div>
			<div style={{fontSize: 34, fontWeight: 700, color: colores.texto}}>{titulo}</div>
		</div>
	);
};

/* ---------- Subtítulo con la locución ---------- */
// Usa **texto** para resaltar palabras en negrita
export const Subtitulo: React.FC<{texto: string; margenInferior?: number; desplazamiento?: number}> = ({
	texto,
	margenInferior = 36,
	desplazamiento = 0,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const opacidad = interpolate(frame, [5, 15, durationInFrames - 8, durationInFrames], [0, 1, 1, 0], clamp);
	const partes = texto.split(/\*\*(.+?)\*\*/g);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: margenInferior,
				paddingLeft: desplazamiento * 2,
				display: 'flex',
				justifyContent: 'center',
				opacity: opacidad,
				transform: `translateY(${(1 - opacidad) * 12}px)`,
			}}
		>
			<div
				style={{
					maxWidth: 1400,
					background: 'rgba(4, 44, 108, 0.95)',
					color: 'white',
					fontFamily,
					fontSize: 34,
					lineHeight: 1.35,
					fontWeight: 300,
					textAlign: 'center',
					padding: '16px 32px',
					borderRadius: 18,
					boxShadow: '0 10px 30px rgba(4, 44, 108, 0.25)',
				}}
			>
				{partes.map((p, i) =>
					i % 2 === 1 ? (
						<span key={i} style={{color: colores.destacado}}>
							{p}
						</span>
					) : (
						<span key={i}>{p}</span>
					),
				)}
			</div>
		</div>
	);
};

/* ---------- Marco tipo ventana que contiene la grabación o captura ---------- */
export const Marco: React.FC<{aspecto: number; children: React.ReactNode}> = ({aspecto, children}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entrada = spring({frame, fps, config: {damping: 20}});
	const maxW = 1600;
	const maxH = 790;
	const w = Math.min(maxW, maxH * aspecto);
	const h = w / aspecto;
	return (
		<div
			style={{
				position: 'absolute',
				left: (1920 - w) / 2 + DESPLAZAMIENTO_MARCO,
				top: 108,
				width: w,
				height: h,
				borderRadius: 18,
				overflow: 'hidden',
				background: 'white',
				boxShadow: '0 30px 70px rgba(4, 44, 108, 0.18), 0 0 0 1px rgba(4, 44, 108, 0.08)',
				opacity: entrada,
				transform: `translateY(${(1 - entrada) * 30}px) scale(${0.97 + entrada * 0.03})`,
			}}
		>
			<TamanoMarco.Provider value={{w, h}}>{children}</TamanoMarco.Provider>
		</div>
	);
};

// El marco se corre a la derecha para dejar espacio a Botis a la izquierda
export const DESPLAZAMIENTO_MARCO = 90;

export const TamanoMarco = React.createContext({w: 1600, h: 790});

/* ---------- Cámara: acerca y aleja sobre el contenido ---------- */
export type Toma = {cx: number; cy: number; zoom: number};

export const Camara: React.FC<{toma: Toma; children: React.ReactNode}> = ({toma, children}) => {
	const {w, h} = React.useContext(TamanoMarco);
	const z = Math.max(1, toma.zoom);
	const medio = 1 / (2 * z);
	const cx = Math.min(1 - medio, Math.max(medio, toma.cx));
	const cy = Math.min(1 - medio, Math.max(medio, toma.cy));
	const tx = w / 2 - cx * w * z;
	const ty = h / 2 - cy * h * z;
	return (
		<AbsoluteFill style={{transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${z})`}}>
			{children}
		</AbsoluteFill>
	);
};

// Interpola entre varias tomas: [[frame, toma], ...]
export const useToma = (claves: [number, Toma][]): Toma => {
	const frame = useCurrentFrame();
	const fs = claves.map((c) => c[0]);
	const opts = {...clamp, easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)};
	const tramo = (k: keyof Toma) => {
		if (claves.length === 1) return claves[0][1][k];
		// interpolación por tramos con suavizado en cada tramo
		for (let i = 0; i < fs.length - 1; i++) {
			if (frame <= fs[i + 1]) {
				return interpolate(frame, [fs[i], fs[i + 1]], [claves[i][1][k], claves[i + 1][1][k]], opts);
			}
		}
		return claves[claves.length - 1][1][k];
	};
	return {cx: tramo('cx'), cy: tramo('cy'), zoom: tramo('zoom')};
};

/* ---------- Resaltado con pulso ---------- */
export const Resaltado: React.FC<{
	rect: Rect;
	desde: number;
	hasta: number;
	etiqueta?: string;
	lado?: 'derecha' | 'izquierda' | 'abajo' | 'arriba';
}> = ({rect, desde, hasta, etiqueta, lado = 'derecha'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {w, h} = React.useContext(TamanoMarco);
	if (frame < desde || frame > hasta) return null;
	const local = frame - desde;
	const entrada = spring({frame: local, fps, config: {damping: 14}});
	const salida = interpolate(frame, [hasta - 8, hasta], [1, 0], clamp);
	const pulso = (Math.sin(local / 6) + 1) / 2;
	const pad = 6;
	const estiloEtiqueta: React.CSSProperties =
		lado === 'derecha'
			? {left: '100%', top: '50%', marginLeft: 18, transform: 'translateY(-50%)'}
			: lado === 'izquierda'
				? {right: '100%', top: '50%', marginRight: 18, transform: 'translateY(-50%)'}
				: lado === 'arriba'
					? {left: '50%', bottom: '100%', marginBottom: 14, transform: 'translateX(-50%)'}
					: {left: '50%', top: '100%', marginTop: 14, transform: 'translateX(-50%)'};
	return (
		<div
			style={{
				position: 'absolute',
				left: rect.x * w - pad,
				top: rect.y * h - pad,
				width: rect.w * w + pad * 2,
				height: rect.h * h + pad * 2,
				borderRadius: 10,
				border: `4px solid ${colores.resaltado}`,
				boxShadow: `0 0 0 ${4 + pulso * 10}px rgba(10, 106, 245, ${0.3 - pulso * 0.22})`,
				opacity: entrada * salida,
				transform: `scale(${1.15 - entrada * 0.15})`,
			}}
		>
			{etiqueta ? (
				<div
					style={{
						position: 'absolute',
						...estiloEtiqueta,
						whiteSpace: 'nowrap',
						background: colores.azulOscuro,
						color: 'white',
						fontFamily,
						fontWeight: 500,
						fontSize: 15,
						padding: '6px 12px',
						borderRadius: 8,
					}}
				>
					{etiqueta}
				</div>
			) : null}
		</div>
	);
};

/* ---------- Cursor animado con clic ---------- */
export const Cursor: React.FC<{
	puntos: [number, number, number][]; // [frame, x, y] normalizados
	clics?: number[];
}> = ({puntos, clics = []}) => {
	const frame = useCurrentFrame();
	const {w, h} = React.useContext(TamanoMarco);
	const fs = puntos.map((p) => p[0]);
	const ease = {...clamp, easing: (t: number) => 1 - Math.pow(1 - t, 3)};
	const x = interpolate(frame, fs, puntos.map((p) => p[1]), ease);
	const y = interpolate(frame, fs, puntos.map((p) => p[2]), ease);
	const aparicion = interpolate(frame, [fs[0], fs[0] + 8], [0, 1], clamp);
	const clicActivo = clics.find((c) => frame >= c && frame < c + 18);
	const presion = clicActivo !== undefined ? interpolate(frame - clicActivo, [0, 4, 9], [1, 0.8, 1], clamp) : 1;
	return (
		<div style={{position: 'absolute', left: x * w, top: y * h, opacity: aparicion}}>
			{clicActivo !== undefined ? (
				<div
					style={{
						position: 'absolute',
						left: -30,
						top: -30,
						width: 60,
						height: 60,
						borderRadius: '50%',
						border: `4px solid ${colores.celeste}`,
						opacity: interpolate(frame - clicActivo, [0, 18], [1, 0], clamp),
						transform: `scale(${interpolate(frame - clicActivo, [0, 18], [0.3, 1.6], clamp)})`,
					}}
				/>
			) : null}
			<svg
				width={34}
				height={34}
				viewBox="0 0 24 24"
				style={{transform: `scale(${presion})`, transformOrigin: '0 0', filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))'}}
			>
				<path d="M3 2 L3 19 L7.5 14.8 L10.6 21.5 L13.4 20.2 L10.4 13.7 L16.5 13.4 Z" fill="white" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
			</svg>
		</div>
	);
};

/* ---------- Grabación de pantalla ---------- */
export const ASPECTO_GRABACION = 2852 / 1592;

export const Grabacion: React.FC<{desdeSegundo: number; velocidad?: number}> = ({desdeSegundo, velocidad = 1}) => (
	<OffthreadVideo
		src={staticFile('grabacion2.mov')}
		trimBefore={seg(desdeSegundo)}
		playbackRate={velocidad}
		muted
		style={{width: '100%', height: '100%'}}
	/>
);

/* ---------- Botis (mascota) ---------- */
// Solo se anima la imagen completa (flotar, respirar, balanceo leve, entrada y cambio de pose).
// Nunca se modifica el dibujo: sin colores, espejos ni elementos añadidos.
// Solo lleva una sombra suave alrededor para que no se pierda sobre fondos blancos.
export type PoseBotis = 'saludando' | 'senalando' | 'pensando' | 'duda' | 'celebrando';
// Poses de Botis 2027 (public/botis/2027), ya encuadradas igual que las anteriores con scripts/preparar-botis-2027.py
export type PoseBotis2027 = 'duda' | 'saludando' | 'laptop' | 'senalando' | 'idea' | 'pensando' | 'entusiasmado' | 'tranquilo' | 'victoria';

// Recorte de cada PNG (lienzo de 2000×2000) alrededor del personaje
const RECORTE = {x: 580, y: 480, w: 800, h: 1000};

export const Botis: React.FC<{
	poses: {pose: PoseBotis | `2027/${PoseBotis2027}`; desde: number}[]; // desde: segundo de la escena en que aparece cada pose
	x: number;
	y: number;
	alto: number;
	// Cambio de pose con un saltito y fundido largo, en lugar del cambio rápido con rebote
	suave?: boolean;
}> = ({poses, x, y, alto, suave = false}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const ancho = (alto * RECORTE.w) / RECORTE.h;
	const escala = alto / RECORTE.h;

	const entrada = spring({frame: frame - 4, fps, config: {damping: 13}});
	const salida = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], clamp);
	const flotar = Math.sin(frame / 14) * 8;
	const respirar = 1 + Math.sin(frame / 20) * 0.012;
	const balanceo = Math.sin(frame / 28) * 1.8;
	// Saltito al cambiar de pose (modo suave): sube y baja en SALTO fotogramas
	const SALTO = 16;
	const salto = suave
		? poses.slice(1).reduce((acc, {desde}) => {
				const t = (frame - seg(desde) + SALTO / 2) / SALTO;
				return t > 0 && t < 1 ? acc + Math.sin(t * Math.PI) : acc;
			}, 0)
		: 0;

	return (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: ancho,
				height: alto,
				opacity: Math.min(1, entrada * 1.5) * salida,
				filter: 'drop-shadow(0 8px 14px rgba(4, 44, 108, 0.22)) drop-shadow(0 0 1.5px rgba(4, 44, 108, 0.35))',
				transformOrigin: '50% 100%',
				transform: `translateY(${(1 - entrada) * 120 + flotar - salto * 26}px) rotate(${balanceo}deg) scale(${respirar * (0.85 + entrada * 0.15) * (1 + salto * 0.03)})`,
			}}
		>
			{poses.map(({pose, desde}, i) => {
				const inicio = seg(desde);
				const fin = i < poses.length - 1 ? seg(poses[i + 1].desde) : Infinity;
				const fundido = suave ? 10 : 6;
				const desfase = suave ? fundido / 2 : 0;
				const aparece = i === 0 ? 1 : interpolate(frame, [inicio - desfase, inicio - desfase + fundido], [0, 1], clamp);
				const desaparece = fin === Infinity ? 1 : interpolate(frame, [fin - desfase, fin - desfase + fundido], [1, 0], clamp);
				const visible = aparece * desaparece;
				if (visible <= 0) return null;
				const pop = i === 0 || suave ? 1 : 1 + 0.06 * Math.sin(Math.min(1, (frame - inicio) / 10) * Math.PI);
				return (
					<div key={pose + desde} style={{position: 'absolute', inset: 0, overflow: 'hidden', opacity: visible, transform: `scale(${pop})`, transformOrigin: '50% 100%'}}>
						<Img
							src={staticFile(`botis/${pose}.png`)}
							style={{
								position: 'absolute',
								width: 2000 * escala,
								height: 2000 * escala,
								left: -RECORTE.x * escala,
								top: -RECORTE.y * escala,
								maxWidth: 'none',
							}}
						/>
					</div>
				);
			})}
		</div>
	);
};
