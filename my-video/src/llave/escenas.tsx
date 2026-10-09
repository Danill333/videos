import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camara, Marco, Paso, Rect, Resaltado, useToma} from '../tutorial/componentes';
import {colores, FPS, fontFamily, marca} from '../tutorial/tema';
import {seg, VELOCIDAD} from './tiempo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TOTAL_PASOS = 6;

/* ============ Grabaciones (public/llave) ============ */
const GRABACIONES = {
	webCrear: {src: 'llave/web-crear.mp4', aspecto: 1920 / 1048},
	webLogin: {src: 'llave/web-login.mp4', aspecto: 1920 / 1124},
	celCrear: {src: 'llave/cel-crear.mp4', aspecto: 828 / 1792},
	celLogin: {src: 'llave/cel-login.mp4', aspecto: 828 / 1792},
};
type Grab = keyof typeof GRABACIONES;

// Cada corte: [segundo inicial, segundo final, velocidad] de la grabación original
type Corte = [number, number, number];

const Cortes: React.FC<{grab: Grab; cortes: Corte[]}> = ({grab, cortes}) => {
	let inicio = 0;
	return (
		<>
			{cortes.map(([a, b, v], i) => {
				const dura = seg((b - a) / v);
				const desde = inicio;
				inicio += dura;
				return (
					<Sequence key={i} from={desde} durationInFrames={i === cortes.length - 1 ? Infinity : dura} layout="none">
						<AbsoluteFill>
							<OffthreadVideo
								src={staticFile(GRABACIONES[grab].src)}
								trimBefore={Math.round(a * FPS)}
								playbackRate={v * VELOCIDAD}
								muted
								style={{width: '100%', height: '100%'}}
							/>
						</AbsoluteFill>
					</Sequence>
				);
			})}
		</>
	);
};

// Momento (en segundos de la escena) en que ocurre un segundo de la grabación original
const enEscena = (cortes: Corte[], t: number) => {
	let s = 0;
	for (const [a, b, v] of cortes) {
		if (t <= b) return s + Math.max(0, t - a) / v;
		s += (b - a) / v;
	}
	return s;
};

/* ============ Coordenadas medidas sobre las grabaciones a resolución completa ============ */
const R: Record<string, Rect> = {
	interseguro: {x: 0.907, y: 0.095, w: 0.084, h: 0.052},
	administrar: {x: 0.763, y: 0.462, w: 0.217, h: 0.036},
	seguridad: {x: 0.012, y: 0.366, w: 0.13, h: 0.058},
	llaves: {x: 0.407, y: 0.377, w: 0.181, h: 0.035},
	crear: {x: 0.25, y: 0.799, w: 0.141, h: 0.042},
	usarOtro: {x: 0.4275, y: 0.767, w: 0.093, h: 0.043},
	listo: {x: 0.5746, y: 0.7235, w: 0.0472, h: 0.0423},
	correo: {x: 0.516, y: 0.424, w: 0.273, h: 0.055},
	siguiente: {x: 0.724, y: 0.618, w: 0.066, h: 0.041},
	continuar: {x: 0.722, y: 0.646, w: 0.068, h: 0.041},
};

/* ============ Celular: grabación vertical dentro de un teléfono ============ */
const Telefono: React.FC<{grab: Grab; cortes: Corte[]}> = ({grab, cortes}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const entrada = spring({frame, fps, config: {damping: 18}});
	const alto = 830;
	const ancho = alto * GRABACIONES[grab].aspecto;
	const borde = 14;
	const cx = 960 + 90;
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: cx - ancho / 2 - borde,
					top: 104,
					width: ancho + borde * 2,
					height: alto + borde * 2,
					borderRadius: 64,
					background: '#111',
					boxShadow: '0 30px 70px rgba(4, 44, 108, 0.25)',
					opacity: entrada,
					transform: `translateY(${(1 - entrada) * 40}px) scale(${0.95 + entrada * 0.05})`,
				}}
			>
				<div style={{position: 'absolute', left: borde, top: borde, width: ancho, height: alto, borderRadius: 52, overflow: 'hidden', background: '#000'}}>
					<Cortes grab={grab} cortes={cortes} />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: cx + ancho / 2 + 40,
					top: 420,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					fontFamily,
					background: 'white',
					color: colores.azulOscuro,
					fontWeight: 500,
					fontSize: 26,
					padding: '14px 24px',
					borderRadius: 999,
					boxShadow: '0 10px 30px rgba(4, 44, 108, 0.12)',
					opacity: spring({frame: frame - 8, fps, config: {damping: 16}}),
				}}
			>
				<span style={{width: 14, height: 14, borderRadius: '50%', background: colores.azul}} />
				En tu celular
			</div>
		</>
	);
};

/* ============ INTRO ============ */
export const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const titulo = spring({frame: frame - 5, fps, config: {damping: 16}});
	const sub = spring({frame: frame - 18, fps, config: {damping: 16}});
	const tarjeta = spring({frame: frame - 30, fps, config: {damping: 12}});
	const tachado = interpolate(frame, [60, 80], [0, 1], clamp);
	const llave = spring({frame: frame - 85, fps, config: {damping: 10}});
	const sello = spring({frame: frame - 110, fps, config: {damping: 9, mass: 0.6}});
	// Aparece cuando la voz dice "Google Workspace"
	const workspace = spring({frame: frame - seg(8.9), fps, config: {damping: 12}});
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 160, top: 300, fontFamily, color: colores.azulOscuro}}>
				<div style={{fontSize: 28, fontWeight: 500, color: colores.azul, letterSpacing: 2, textTransform: 'uppercase', opacity: titulo}}>
					Tutorial · Google Workspace
				</div>
				<div style={{fontSize: 104, fontWeight: 700, lineHeight: 1.02, marginTop: 12, opacity: titulo, transform: `translateY(${(1 - titulo) * 40}px)`}}>
					Crea tu llave
					<br />
					de acceso
				</div>
				<div style={{fontSize: 38, fontWeight: 300, marginTop: 24, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`}}>
					Inicia sesión más rápido y seguro.
				</div>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 16,
						marginTop: 34,
						padding: '14px 26px 14px 16px',
						borderRadius: 999,
						background: 'white',
						boxShadow: '0 14px 30px rgba(4, 44, 108, 0.14)',
						fontSize: 30,
						fontWeight: 500,
						opacity: Math.min(1, workspace * 1.4),
						transform: `translateY(${(1 - workspace) * 24}px) scale(${0.8 + workspace * 0.2})`,
						transformOrigin: '0% 50%',
					}}
				>
					<Img src={staticFile('llave/google-workspace.png')} style={{width: 52, height: 52}} />
					Google Workspace
				</div>
			</div>
			{/* Tarjeta: de contraseña a llave de acceso */}
			<div
				style={{
					position: 'absolute',
					right: 110,
					top: 270,
					width: 470,
					background: 'white',
					borderRadius: 28,
					boxShadow: '0 30px 60px rgba(4, 44, 108, 0.16)',
					padding: 34,
					fontFamily,
					color: colores.azulOscuro,
					opacity: tarjeta,
					transform: `translateY(${(1 - tarjeta) * 60}px) rotate(${(1 - tarjeta) * 6 + 2}deg)`,
				}}
			>
				<div style={{fontSize: 30, fontWeight: 700}}>Iniciar sesión</div>
				<div style={{marginTop: 22, padding: '16px 20px', borderRadius: 14, background: marca.blancoNube, fontSize: 24, position: 'relative', opacity: 1 - tachado * 0.55}}>
					Contraseña &nbsp;••••••••
					<div style={{position: 'absolute', left: 16, top: '50%', height: 4, width: `${tachado * 92}%`, background: colores.acento, borderRadius: 2}} />
				</div>
				<div
					style={{
						marginTop: 16,
						padding: '16px 20px',
						borderRadius: 14,
						background: colores.azul,
						color: 'white',
						fontSize: 24,
						fontWeight: 500,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						opacity: llave,
						transform: `scale(${0.85 + llave * 0.15})`,
					}}
				>
					<span style={{fontSize: 30}}>🔑</span> Llave de acceso
				</div>
				<div
					style={{
						position: 'absolute',
						right: -30,
						bottom: -34,
						background: colores.acento,
						color: 'white',
						fontWeight: 500,
						fontSize: 26,
						padding: '12px 22px',
						borderRadius: 14,
						transform: `scale(${sello}) rotate(-6deg)`,
						boxShadow: '0 10px 20px rgba(4, 44, 108, 0.18)',
					}}
				>
					Sin contraseñas
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============ ANTES DE EMPEZAR ============ */
export const Antes: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tarjeta = spring({frame: frame - 4, fps, config: {damping: 16}});
	const check = spring({frame: frame - 40, fps, config: {damping: 10}});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily}}>
			<div
				style={{
					marginLeft: 180,
					display: 'flex',
					alignItems: 'center',
					gap: 56,
					background: 'white',
					borderRadius: 32,
					padding: '56px 70px',
					boxShadow: '0 30px 70px rgba(4, 44, 108, 0.15)',
					opacity: tarjeta,
					transform: `translateY(${(1 - tarjeta) * 40}px)`,
				}}
			>
				{/* Celular con correo */}
				<div style={{position: 'relative', width: 170, height: 300, borderRadius: 32, border: `10px solid ${colores.azulOscuro}`, background: marca.blancoNube, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<Img src={staticFile('marca/isotipo-interseguro.png')} style={{width: 92, height: 92 * (190 / 187)}} />
					<div
						style={{
							position: 'absolute',
							right: -34,
							bottom: -26,
							width: 76,
							height: 76,
							borderRadius: '50%',
							background: colores.azul,
							color: 'white',
							fontSize: 44,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `scale(${check})`,
							boxShadow: '0 8px 20px rgba(10, 106, 245, 0.35)',
						}}
					>
						✓
					</div>
				</div>
				<div style={{color: colores.azulOscuro, maxWidth: 640}}>
					<div style={{fontSize: 28, fontWeight: 500, color: colores.azul, letterSpacing: 2, textTransform: 'uppercase'}}>Antes de empezar</div>
					<div style={{fontSize: 52, fontWeight: 700, lineHeight: 1.12, marginTop: 14}}>
						Ten tu correo corporativo configurado en tu celular
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============ PASO 1: Interseguro → Administrar tu Cuenta de Google ============ */
const C1: Corte[] = [
	[0.3, 2.25, 0.55],
	[2.25, 4.35, 0.45],
];
export const Paso1: React.FC = () => {
	const clic = enEscena(C1, 2.2);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.6), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.4), {cx: 0.88, cy: 0.16, zoom: 2.4}],
		[seg(clic + 0.3), {cx: 0.88, cy: 0.16, zoom: 2.4}],
		[seg(clic + 1.0), {cx: 0.86, cy: 0.36, zoom: 2.1}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={1} titulo="Abre tu cuenta de Google" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webCrear.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webCrear" cortes={C1} />
					<Resaltado rect={R.interseguro} desde={seg(1.4)} hasta={seg(clic + 0.2)} etiqueta="Interseguro" lado="abajo" />
					<Resaltado rect={R.administrar} desde={seg(enEscena(C1, 2.9))} hasta={seg(9)} etiqueta="Administrar tu Cuenta de Google" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 2: Seguridad y acceso → Llaves de acceso ============ */
const C2: Corte[] = [
	[5.6, 7.1, 0.75],
	[9.3, 14.1, 1.07],
	[14.1, 15.5, 1],
];
export const Paso2: React.FC = () => {
	const finScroll = enEscena(C2, 12.0);
	const clic = enEscena(C2, 14.05);
	const toma = useToma([
		[0, {cx: 0.2, cy: 0.33, zoom: 2.0}],
		[seg(2.0), {cx: 0.2, cy: 0.33, zoom: 2.0}],
		[seg(2.6), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(finScroll), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(finScroll + 0.6), {cx: 0.5, cy: 0.4, zoom: 2.1}],
		[seg(clic + 0.2), {cx: 0.5, cy: 0.4, zoom: 2.1}],
		[seg(clic + 0.8), {cx: 0.5, cy: 0.5, zoom: 1}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={2} titulo="Ve a “Llaves de acceso”" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webCrear.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webCrear" cortes={C2} />
					<Resaltado rect={R.seguridad} desde={seg(0.4)} hasta={seg(2.0)} etiqueta="Seguridad y acceso" />
					<Resaltado rect={R.llaves} desde={seg(finScroll + 0.3)} hasta={seg(clic + 0.15)} etiqueta="Llaves de acceso y llaves de seguridad" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 3: Crear una llave de acceso → Usar otro dispositivo ============ */
const C3: Corte[] = [
	[15.3, 18.4, 1.0],
	[18.4, 21.65, 0.85],
	[21.65, 23.5, 1],
];
export const Paso3: React.FC = () => {
	const clicCrear = enEscena(C3, 18.3);
	const clicUsar = enEscena(C3, 21.6);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.5), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.3), {cx: 0.33, cy: 0.78, zoom: 2.2}],
		[seg(clicCrear + 0.2), {cx: 0.33, cy: 0.78, zoom: 2.2}],
		[seg(clicCrear + 0.9), {cx: 0.5, cy: 0.55, zoom: 1.6}],
		[seg(clicCrear + 1.8), {cx: 0.5, cy: 0.55, zoom: 1.6}],
		[seg(clicCrear + 2.6), {cx: 0.5, cy: 0.74, zoom: 2.2}],
		[seg(clicUsar + 0.2), {cx: 0.5, cy: 0.74, zoom: 2.2}],
		[seg(clicUsar + 0.8), {cx: 0.5, cy: 0.5, zoom: 1}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={3} titulo="Crea la llave de acceso" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webCrear.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webCrear" cortes={C3} />
					<Resaltado rect={R.crear} desde={seg(1.2)} hasta={seg(clicCrear + 0.2)} etiqueta="Crear una llave de acceso" />
					<Resaltado rect={R.usarOtro} desde={seg(clicCrear + 2.5)} hasta={seg(clicUsar + 0.15)} etiqueta="Usar otro dispositivo" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 4: escanear el QR con el celular → Listo ============ */
const C4a: Corte[] = [[22.0, 23.6, 1]];
const C4b: Corte[] = [
	[2.0, 4.8, 1],
	[10.6, 14.4, 1],
];
const C4c: Corte[] = [
	[32.4, 36.1, 1.85],
	[36.1, 37.3, 1],
];
const P4 = {a: 1.6, b: 2.8 + 3.8}; // duración de las partes A (QR en la computadora) y B (celular)
export const Paso4: React.FC = () => {
	const clicListo = enEscena(C4c, 36.05);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1.4}],
		[seg(1.6), {cx: 0.5, cy: 0.55, zoom: 1.6}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={4} titulo="Escanea el código QR" total={TOTAL_PASOS} />
			<Sequence durationInFrames={seg(P4.a)} layout="none">
				<Marco aspecto={GRABACIONES.webCrear.aspecto}>
					<Camara toma={{cx: 0.47, cy: 0.42, zoom: 1.6}}>
						<Cortes grab="webCrear" cortes={C4a} />
					</Camara>
				</Marco>
			</Sequence>
			<Sequence from={seg(P4.a)} durationInFrames={seg(P4.b)} layout="none">
				<Telefono grab="celCrear" cortes={C4b} />
			</Sequence>
			<Sequence from={seg(P4.a + P4.b)} layout="none">
				<Marco aspecto={GRABACIONES.webCrear.aspecto}>
					<Camara toma={toma}>
						<Cortes grab="webCrear" cortes={C4c} />
						<Resaltado rect={R.listo} desde={seg(0.5)} hasta={seg(clicListo + 0.15)} etiqueta="Listo" lado="abajo" />
					</Camara>
				</Marco>
			</Sequence>
		</AbsoluteFill>
	);
};

/* ============ PASO 5: iniciar sesión → correo → Siguiente → Continuar ============ */
const C5: Corte[] = [
	[2.0, 9.45, 1.1],
	[11.4, 12.3, 1],
	[17.3, 19.1, 1.3],
	[20.95, 21.7, 1],
];
export const Paso5: React.FC = () => {
	const clicSig = enEscena(C5, 9.4);
	const clicCont = enEscena(C5, 21.1);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.4), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.2), {cx: 0.52, cy: 0.55, zoom: 1.35}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={5} titulo="Inicia sesión con tu llave" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webLogin.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webLogin" cortes={C5} />
					<Resaltado rect={R.correo} desde={seg(1.2)} hasta={seg(5.4)} etiqueta="Tu correo corporativo" lado="abajo" />
					<Resaltado rect={R.siguiente} desde={seg(5.6)} hasta={seg(clicSig + 0.15)} etiqueta="Siguiente" lado="abajo" />
					<Resaltado rect={R.continuar} desde={seg(clicSig + 1.4)} hasta={seg(clicCont + 0.2)} etiqueta="Continuar" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 6: escanear el QR → Face ID → Listo ============ */
const C6a: Corte[] = [[21.75, 23.3, 1]];
const C6b: Corte[] = [
	[0, 2.6, 1],
	[5.8, 10.1, 1],
];
const P6a = 1.5;
export const Paso6: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={6} titulo="Confirma con tu rostro o huella" total={TOTAL_PASOS} />
		<Sequence durationInFrames={seg(P6a)} layout="none">
			<Marco aspecto={GRABACIONES.webLogin.aspecto}>
				<Camara toma={{cx: 0.5, cy: 0.45, zoom: 1.6}}>
					<Cortes grab="webLogin" cortes={C6a} />
				</Camara>
			</Marco>
		</Sequence>
		<Sequence from={seg(P6a)} layout="none">
			<Telefono grab="celLogin" cortes={C6b} />
		</Sequence>
	</AbsoluteFill>
);

/* ============ CIERRE ============ */
export const Cierre: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const circulo = spring({frame, fps, config: {damping: 12}});
	const trazo = interpolate(frame, [12, 32], [1, 0], clamp);
	const texto = spring({frame: frame - 25, fps, config: {damping: 16}});
	const etiqueta = spring({frame: frame - 45, fps, config: {damping: 16}});
	const blanco = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);
	const L = 120;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 150, fontFamily}}>
				<svg width={220} height={220} viewBox="0 0 220 220" style={{transform: `scale(${circulo})`}}>
					<circle cx={110} cy={110} r={100} fill={colores.azul} />
					<path d="M62 114 L96 146 L160 80" fill="none" stroke="white" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * trazo} />
				</svg>
				<div style={{fontSize: 88, fontWeight: 700, color: colores.azulOscuro, marginTop: 30, opacity: texto, transform: `translateY(${(1 - texto) * 30}px)`}}>¡Listo!</div>
				<div style={{fontSize: 44, fontWeight: 500, color: colores.texto, marginTop: 10, opacity: texto, transform: `translateY(${(1 - texto) * 30}px)`}}>
					Tu cuenta, <span style={{color: colores.azul}}>más segura y sin contraseñas.</span>
				</div>
				<div
					style={{
						marginTop: 36,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						background: 'white',
						padding: '14px 28px',
						borderRadius: 999,
						boxShadow: '0 10px 30px rgba(4, 44, 108, 0.12)',
						opacity: etiqueta,
						transform: `scale(${0.8 + etiqueta * 0.2})`,
					}}
				>
					<div style={{width: 18, height: 18, borderRadius: 5, background: colores.azul}} />
					<div style={{fontSize: 28, fontWeight: 500, color: colores.azulOscuro}}>Google Workspace · Llave de acceso</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'white', opacity: blanco}} />
		</AbsoluteFill>
	);
};
