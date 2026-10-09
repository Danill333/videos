import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
	ASPECTO_GRABACION,
	Camara,
	Grabacion,
	Marco,
	Paso,
	Resaltado,
	useToma,
} from './componentes';
import {colores, fontFamily, marca, seg} from './tema';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/* ============ INTRO ============ */
export const Intro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const titulo = spring({frame: frame - 5, fps, config: {damping: 16}});
	const sub = spring({frame: frame - 18, fps, config: {damping: 16}});
	const tarjeta = spring({frame: frame - 30, fps, config: {damping: 12}});
	const avion = interpolate(frame, [20, 140], [-300, 2200], clamp);
	const sello = spring({frame: frame - 70, fps, config: {damping: 9, mass: 0.6}});
	const dias = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
	return (
		<AbsoluteFill>
			{/* Avión cruzando */}
			<div
				style={{
					position: 'absolute',
					left: avion,
					top: 140 + Math.sin(frame / 10) * 12 - avion * 0.03,
					fontSize: 90,
					transform: 'rotate(-8deg)',
				}}
			>
				✈️
			</div>
			<div style={{position: 'absolute', left: 160, top: 300, fontFamily, color: colores.azulOscuro}}>
				<div
					style={{
						fontSize: 28,
						fontWeight: 500,
						color: colores.azul,
						letterSpacing: 2,
						textTransform: 'uppercase',
						opacity: titulo,
					}}
				>
					Tutorial · Freshservice
				</div>
				<div
					style={{
						fontSize: 104,
						fontWeight: 700,
						lineHeight: 1.02,
						marginTop: 12,
						opacity: titulo,
						transform: `translateY(${(1 - titulo) * 40}px)`,
					}}
				>
					Delegar
					<br />
					aprobaciones
				</div>
				<div
					style={{
						fontSize: 38,
						fontWeight: 300,
						marginTop: 24,
						color: colores.texto,
						opacity: sub,
						transform: `translateY(${(1 - sub) * 20}px)`,
					}}
				>
					¿Vacaciones o ausencia? Deja todo en orden.
				</div>
			</div>
			{/* Calendario de ausencia */}
			<div
				style={{
					position: 'absolute',
					right: 110,
					top: 250,
					width: 470,
					background: 'white',
					borderRadius: 28,
					boxShadow: '0 30px 60px rgba(4, 44, 108, 0.16)',
					padding: 32,
					fontFamily,
					opacity: tarjeta,
					transform: `translateY(${(1 - tarjeta) * 60}px) rotate(${(1 - tarjeta) * 6 + 2}deg)`,
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
					<div style={{fontSize: 30, fontWeight: 700, color: colores.azulOscuro}}>Mis vacaciones</div>
					<div style={{fontSize: 56}}>🏖️</div>
				</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginTop: 20}}>
					{dias.map((d, i) => {
						const marcado = interpolate(frame, [45 + i * 3, 52 + i * 3], [0, 1], clamp);
						const enRango = i >= 3 && i <= 11;
						return (
							<div
								key={d}
								style={{
									height: 52,
									borderRadius: 12,
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									fontSize: 22,
									fontWeight: 500,
									background: enRango ? `rgba(10, 106, 245, ${0.1 + marcado * 0.9})` : marca.blancoNube,
									color: enRango && marcado > 0.5 ? 'white' : colores.texto,
								}}
							>
								{d}
							</div>
						);
					})}
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
					Fuera de oficina
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============ Cortes de la grabación ============ */
// Cada corte: [segundo inicial, segundo final, velocidad] de la grabación original
type Corte = [number, number, number];

const duracionCortes = (cortes: Corte[]) => cortes.reduce((s, [a, b, v]) => s + (b - a) / v, 0);

const Cortes: React.FC<{cortes: Corte[]}> = ({cortes}) => {
	let inicio = 0;
	return (
		<>
			{cortes.map(([a, b, v], i) => {
				const dura = seg((b - a) / v);
				const desde = inicio;
				inicio += dura;
				const ultimo = i === cortes.length - 1;
				return (
					<Sequence key={i} from={desde} durationInFrames={ultimo ? Infinity : dura} layout="none">
						<AbsoluteFill>
							<Grabacion desdeSegundo={a} velocidad={v} />
						</AbsoluteFill>
					</Sequence>
				);
			})}
		</>
	);
};

// Momento (en segundos de la escena) en que ocurre un segundo de la grabación original
const enEscena = (cortes: Corte[], segundoOriginal: number) => {
	let t = 0;
	for (const [a, b, v] of cortes) {
		if (segundoOriginal <= b) return t + Math.max(0, segundoOriginal - a) / v;
		t += (b - a) / v;
	}
	return t;
};

/* ============ INGRESO ============ */
const CORTES_INGRESO: Corte[] = [
	[5.6, 12.3, 1.4], // pantalla de login → clic en "Sign in with Google"
	[13.8, 15.8, 1], // elegir la cuenta
];
const BOTON_GOOGLE = {x: 0.356, y: 0.592, w: 0.288, h: 0.037};
const CUENTA = {x: 0.508, y: 0.366, w: 0.34, h: 0.082};

export const Ingreso: React.FC = () => {
	const c = CORTES_INGRESO;
	const clicGoogle = enEscena(c, 12.1);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.6), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.4), {cx: 0.5, cy: 0.6, zoom: 1.8}],
		[seg(clicGoogle + 0.3), {cx: 0.5, cy: 0.6, zoom: 1.8}],
		[seg(clicGoogle + 0.9), {cx: 0.6, cy: 0.42, zoom: 1.5}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={1} titulo="Ingresa al portal" />
			<Marco aspecto={ASPECTO_GRABACION}>
				<Camara toma={toma}>
					<Cortes cortes={c} />
					<Resaltado rect={BOTON_GOOGLE} desde={seg(1.2)} hasta={seg(clicGoogle + 0.3)} etiqueta="Iniciar sesión con Google" lado="abajo" />
					<Resaltado rect={CUENTA} desde={seg(enEscena(c, 13.9))} hasta={seg(enEscena(c, 15.8))} etiqueta="Tu cuenta corporativa" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ MI PERFIL ============ */
const CORTES_PERFIL: Corte[] = [
	[22.5, 26.6, 1], // portal → clic en avatar → menú
	[27.3, 28.8, 1], // página de Mi perfil
];
const AVATAR = {x: 0.957, y: 0.028, w: 0.033, h: 0.056};
const MI_PERFIL = {x: 0.817, y: 0.206, w: 0.169, h: 0.055};

export const MiPerfil: React.FC = () => {
	const c = CORTES_PERFIL;
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.3), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.1), {cx: 0.85, cy: 0.2, zoom: 2}],
		[seg(enEscena(c, 26.6)), {cx: 0.85, cy: 0.2, zoom: 2}],
		[seg(enEscena(c, 26.6) + 0.6), {cx: 0.5, cy: 0.5, zoom: 1}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={2} titulo="Ve a “Mi perfil”" />
			<Marco aspecto={ASPECTO_GRABACION}>
				<Camara toma={toma}>
					<Cortes cortes={c} />
					<Resaltado rect={AVATAR} desde={seg(0.5)} hasta={seg(enEscena(c, 24.1))} />
					<Resaltado rect={MI_PERFIL} desde={seg(enEscena(c, 24.4))} hasta={seg(enEscena(c, 26.5))} etiqueta="Mi perfil" lado="izquierda" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ AÑADIR DELEGACIÓN ============ */
const CORTES_ANADIR: Corte[] = [
	[28.8, 30.1, 0.43], // acercamiento a "Añadir delegación" y clic (en cámara lenta, al ritmo de la voz)
	[30.1, 50.9, 1.6], // completar el formulario
];
const ANADIR = {x: 0.722, y: 0.25, w: 0.121, h: 0.03};
// Coordenadas medidas sobre la grabación a resolución completa (cuadrícula 0–1)
const CAMPOS = [
	{rect: {x: 0.3268, y: 0.3249, w: 0.3452, h: 0.0448}, etiqueta: 'Busca y elige a quién delegas', desde: 32.5, hasta: 37.3},
	{rect: {x: 0.3268, y: 0.446, w: 0.2645, h: 0.0412}, etiqueta: 'Fecha y hora de inicio', desde: 37.3, hasta: 43.2},
	{rect: {x: 0.3268, y: 0.5625, w: 0.2645, h: 0.0405}, etiqueta: 'Fecha y hora de fin', desde: 43.2, hasta: 47.5},
	{rect: {x: 0.3268, y: 0.6773, w: 0.3459, h: 0.0867}, etiqueta: 'Notas (motivo)', desde: 47.5, hasta: 50.9},
];

export const AnadirDelegacion: React.FC = () => {
	const c = CORTES_ANADIR;
	// Igual que en "Mi perfil": vista completa → acercamiento al botón mientras la voz dice
	// "Selecciona Añadir delegación" (0,8–3,2 s) → clic sobre "delegación" → se aleja a la ventana
	const clic = enEscena(c, 30.1);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.3), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.1), {cx: 0.785, cy: 0.28, zoom: 2.2}],
		[seg(clic + 0.3), {cx: 0.785, cy: 0.28, zoom: 2.2}],
		[seg(clic + 1.1), {cx: 0.5, cy: 0.5, zoom: 1.35}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={3} titulo="Añade la delegación" />
			<Marco aspecto={ASPECTO_GRABACION}>
				<Camara toma={toma}>
					<Cortes cortes={c} />
					<Resaltado rect={ANADIR} desde={seg(0.9)} hasta={seg(clic + 0.2)} etiqueta="Añadir delegación" lado="abajo" />
					{CAMPOS.map((campo) => (
						<Resaltado
							key={campo.etiqueta}
							rect={campo.rect}
							desde={seg(enEscena(c, campo.desde))}
							hasta={seg(enEscena(c, campo.hasta))}
							etiqueta={campo.etiqueta}
						/>
					))}
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ CONFIRMAR ============ */
// Sincronizado con la locución: "Finalmente, revisa la información (1,7–3,3 s)
// y haz clic en (3,5 s)… Delegar (4,9 s)". El clic cae sobre la palabra "Delegar".
const CORTES_CONFIRMAR: Corte[] = [
	[50.9, 51.5, 0.2], // formulario completo: se revisa la información (cámara lenta)
	[51.5, 52.25, 0.34], // el cursor va hasta "Delegar" y hace clic
	[52.25, 57.3, 1.58], // mensaje de confirmación
];
const FORMULARIO = {x: 0.3268, y: 0.3, w: 0.3459, h: 0.464};
const BOTON_DELEGAR = {x: 0.6252, y: 0.8167, w: 0.0656, h: 0.047};
const AVISO = {x: 0.7238, y: 0.0302, w: 0.27, h: 0.0916};

export const Confirmar: React.FC = () => {
	const c = CORTES_CONFIRMAR;
	const clic = enEscena(c, 52.25);
	const aviso = enEscena(c, 53.3);
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1.35}],
		[seg(3.4), {cx: 0.5, cy: 0.5, zoom: 1.35}],
		[seg(4.4), {cx: 0.66, cy: 0.8, zoom: 2}],
		[seg(clic + 0.2), {cx: 0.66, cy: 0.8, zoom: 2}],
		[seg(aviso), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(aviso + 0.3), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(aviso + 1), {cx: 0.82, cy: 0.2, zoom: 1.8}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={4} titulo="Confirma con “Delegar”" />
			<Marco aspecto={ASPECTO_GRABACION}>
				<Camara toma={toma}>
					<Cortes cortes={c} />
					<Resaltado rect={FORMULARIO} desde={seg(1.6)} hasta={seg(3.4)} etiqueta="Revisa la información" />
					<Resaltado rect={BOTON_DELEGAR} desde={seg(4.5)} hasta={seg(clic + 0.1)} etiqueta="Delegar" lado="abajo" />
					<Resaltado rect={AVISO} desde={seg(aviso + 0.9)} hasta={seg(duracionCortes(c))} etiqueta="¡Aprobaciones delegadas!" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ CIERRE ============ */
export const Cierre: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const circulo = spring({frame, fps, config: {damping: 12}});
	const trazo = interpolate(frame, [12, 32], [1, 0], clamp);
	const texto = spring({frame: frame - 25, fps, config: {damping: 16}});
	const etiqueta = spring({frame: frame - 45, fps, config: {damping: 16}});
	// se desvanece a blanco al terminar, para dar paso al logo final
	const blanco = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1], clamp);
	const L = 120;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 150, fontFamily}}>
				<svg width={220} height={220} viewBox="0 0 220 220" style={{transform: `scale(${circulo})`}}>
					<circle cx={110} cy={110} r={100} fill={colores.azul} />
					<circle cx={110} cy={110} r={100} fill="none" stroke="rgba(10, 106, 245, 0.25)" strokeWidth={24 * (1 - circulo) + 1} />
					<path
						d="M62 114 L96 146 L160 80"
						fill="none"
						stroke="white"
						strokeWidth={18}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray={L}
						strokeDashoffset={L * trazo}
					/>
				</svg>
				<div
					style={{
						fontSize: 88,
						fontWeight: 700,
						color: colores.azulOscuro,
						marginTop: 30,
						opacity: texto,
						transform: `translateY(${(1 - texto) * 30}px)`,
					}}
				>
					¡Listo!
				</div>
				<div
					style={{
						fontSize: 44,
						fontWeight: 500,
						color: colores.texto,
						marginTop: 10,
						opacity: texto,
						transform: `translateY(${(1 - texto) * 30}px)`,
					}}
				>
					Delega tus aprobaciones de forma <span style={{color: colores.azul}}>rápida y sencilla.</span>
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
					<div style={{fontSize: 28, fontWeight: 500, color: colores.azulOscuro}}>Freshservice · Mesa de Ayuda</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'white', opacity: blanco}} />
		</AbsoluteFill>
	);
};

/* ============ FINAL: logo Interseguro que se desvanece hasta dejar la pantalla en blanco ============ */
export const Final: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const aparece = interpolate(frame, [4, 22], [0, 1], clamp);
	const desaparece = interpolate(frame, [durationInFrames - 30, durationInFrames - 8], [1, 0], clamp);
	const escala = interpolate(frame, [0, durationInFrames], [0.96, 1.02]);
	return (
		<AbsoluteFill style={{background: 'white', alignItems: 'center', justifyContent: 'center'}}>
			<Img
				src={staticFile('marca/logo-interseguro.png')}
				style={{height: 110, opacity: aparece * desaparece, transform: `scale(${escala})`}}
			/>
		</AbsoluteFill>
	);
};
