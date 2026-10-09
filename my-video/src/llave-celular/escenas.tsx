import React from 'react';
import {AbsoluteFill, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Camara, Marco, Paso, Rect, Resaltado, useToma} from '../tutorial/componentes';
import {colores, fontFamily, marca} from '../tutorial/tema';
import {Corte, Cortes, enEscena, GRABACIONES, Telefono} from '../llave/escenas';
import {seg} from '../llave/tiempo';

const TOTAL_PASOS = 9;

/* ============ Coordenadas medidas sobre las grabaciones a resolución completa ============ */
// Celular (cel-link.mp4 y cel-qr.mp4, 828×1792)
const RC: Record<string, Rect> = {
	link: {x: 0.06, y: 0.533, w: 0.4, h: 0.032},
	crearInicio: {x: 0.068, y: 0.456, w: 0.864, h: 0.05},
	contrasena: {x: 0.056, y: 0.32, w: 0.884, h: 0.063},
	siguiente: {x: 0.676, y: 0.49, w: 0.264, h: 0.04},
	crearCuenta: {x: 0.384, y: 0.4, w: 0.516, h: 0.042},
	continuarFaceId: {x: 0.348, y: 0.911, w: 0.304, h: 0.045},
	listo: {x: 0.712, y: 0.68, w: 0.188, h: 0.043},
	iniciarConLlave: {x: 0.18, y: 0.697, w: 0.64, h: 0.031},
};
// Laptop (web-probar.mp4, 1920×1048)
const RW: Record<string, Rect> = {
	correo: {x: 0.515, y: 0.412, w: 0.273, h: 0.059},
	siguiente: {x: 0.723, y: 0.641, w: 0.065, h: 0.043},
	continuar: {x: 0.722, y: 0.66, w: 0.066, h: 0.043},
	probarOtro: {x: 0.621, y: 0.638, w: 0.08, h: 0.03},
	usarLlave: {x: 0.523, y: 0.485, w: 0.265, h: 0.04},
	usarTelefono: {x: 0.379, y: 0.406, w: 0.242, h: 0.062},
};

/* ============ PASO 1: abrir el link de WhatsApp ============ */
const C1: Corte[] = [
	[2.4, 4.8, 1],
	[5.2, 7.6, 1],
];
export const Paso1: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={1} titulo="Abre el link en tu celular" total={TOTAL_PASOS} />
		<Telefono grab="celLink" cortes={C1}>
			<Resaltado rect={RC.link} desde={seg(0.4)} hasta={seg(enEscena(C1, 4.75))} etiqueta="Toca el link" lado="abajo" />
		</Telefono>
	</AbsoluteFill>
);

/* ============ PASO 2: Crear una llave de acceso (página del link) ============ */
const C2: Corte[] = [[9.0, 12.6, 1]];
export const Paso2: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={2} titulo="Crea tu llave de acceso" total={TOTAL_PASOS} />
		<Telefono grab="celLink" cortes={C2}>
			<Resaltado rect={RC.crearInicio} desde={seg(0.3)} hasta={seg(enEscena(C2, 12.55))} etiqueta="Crear una llave de acceso" lado="abajo" />
		</Telefono>
	</AbsoluteFill>
);

/* ============ PASO 3: contraseña → Siguiente ============ */
const C3: Corte[] = [
	[15.9, 17.6, 1],
	[17.6, 32.8, 5.5],
	[32.8, 34.5, 1],
];
export const Paso3: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={3} titulo="Ingresa tu contraseña" total={TOTAL_PASOS} />
		<Telefono grab="celLink" cortes={C3}>
			{/* la página se reacomoda al abrir el teclado (18,7 s); el campo se marca después */}
			<Resaltado rect={RC.contrasena} desde={seg(enEscena(C3, 18.9))} hasta={seg(enEscena(C3, 32.6))} />
			<Resaltado rect={RC.siguiente} desde={seg(enEscena(C3, 32.9))} hasta={seg(enEscena(C3, 34.4))} etiqueta="Siguiente" lado="abajo" />
		</Telefono>
	</AbsoluteFill>
);

/* ============ PASO 4: Crear una llave de acceso (en tu cuenta) ============ */
const C4: Corte[] = [
	[39.0, 42.0, 1.5],
	[44.5, 46.6, 1],
];
export const Paso4: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={4} titulo="Vuelve a crearla en tu cuenta" total={TOTAL_PASOS} />
		<Telefono grab="celLink" cortes={C4}>
			<Resaltado rect={RC.crearCuenta} desde={seg(0.4)} hasta={seg(enEscena(C4, 46.5))} etiqueta="Crear una llave de acceso" lado="abajo" />
		</Telefono>
	</AbsoluteFill>
);

/* ============ PASO 5: Continuar → Face ID → Listo ============ */
const C5: Corte[] = [
	[46.5, 50.6, 1],
	[50.6, 55.4, 1.2],
];
export const Paso5: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={5} titulo="Confirma con tu rostro o huella" total={TOTAL_PASOS} />
		<Telefono grab="celLink" cortes={C5}>
			<Resaltado rect={RC.continuarFaceId} desde={seg(enEscena(C5, 46.8))} hasta={seg(enEscena(C5, 48.2))} etiqueta="Continuar" lado="arriba" />
			<Resaltado rect={RC.listo} desde={seg(enEscena(C5, 51.6))} hasta={seg(enEscena(C5, 54.6))} etiqueta="Listo" lado="abajo" />
		</Telefono>
	</AbsoluteFill>
);

/* ============ TRANSICIÓN: ahora pruébala en tu laptop ============ */
export const Transicion: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tarjeta = spring({frame: frame - 4, fps, config: {damping: 16}});
	const llave = spring({frame: frame - 30, fps, config: {damping: 10}});
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
				{/* Laptop con el isotipo y la llave de acceso */}
				<div style={{position: 'relative', width: 280, height: 210}}>
					<div style={{position: 'absolute', left: 30, top: 0, width: 220, height: 150, borderRadius: 16, border: `10px solid ${colores.azulOscuro}`, background: marca.blancoNube, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<Img src={staticFile('marca/isotipo-interseguro.png')} style={{width: 64, height: 64 * (190 / 187)}} />
					</div>
					<div style={{position: 'absolute', left: 0, top: 160, width: 280, height: 18, borderRadius: '4px 4px 14px 14px', background: colores.azulOscuro}} />
					<div
						style={{
							position: 'absolute',
							right: -24,
							top: -22,
							width: 76,
							height: 76,
							borderRadius: '50%',
							background: colores.azul,
							fontSize: 38,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transform: `scale(${llave})`,
							boxShadow: '0 8px 20px rgba(10, 106, 245, 0.35)',
						}}
					>
						🔑
					</div>
				</div>
				<div style={{color: colores.azulOscuro, maxWidth: 600}}>
					<div style={{fontSize: 28, fontWeight: 500, color: colores.azul, letterSpacing: 2, textTransform: 'uppercase'}}>Ahora</div>
					<div style={{fontSize: 56, fontWeight: 700, lineHeight: 1.12, marginTop: 14}}>Pruébala en tu laptop</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* ============ PASO 6: correo → Siguiente → Continuar ============ */
const C6: Corte[] = [
	[0.0, 2.7, 1],
	[2.7, 4.0, 1.5],
	[4.0, 8.2, 1],
];
export const Paso6: React.FC = () => {
	const toma = useToma([
		[0, {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(0.5), {cx: 0.5, cy: 0.5, zoom: 1}],
		[seg(1.3), {cx: 0.62, cy: 0.55, zoom: 1.5}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={6} titulo="Inicia sesión en tu laptop" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webProbar.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webProbar" cortes={C6} />
					<Resaltado rect={RW.correo} desde={seg(0.3)} hasta={seg(1.4)} etiqueta="Tu correo corporativo" lado="abajo" />
					<Resaltado rect={RW.siguiente} desde={seg(1.5)} hasta={seg(enEscena(C6, 2.6))} etiqueta="Siguiente" lado="abajo" />
					<Resaltado rect={RW.continuar} desde={seg(enEscena(C6, 5.4))} hasta={seg(enEscena(C6, 8.0))} etiqueta="Continuar" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 7: Probar otro método → Usar tu llave de acceso ============ */
const C7: Corte[] = [
	[8.2, 12.3, 1],
	[12.3, 13.4, 1],
	[13.4, 16.4, 1],
];
export const Paso7: React.FC = () => {
	const toma = useToma([[0, {cx: 0.62, cy: 0.55, zoom: 1.5}]]);
	return (
		<AbsoluteFill>
			<Paso numero={7} titulo="Elige usar tu llave de acceso" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webProbar.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webProbar" cortes={C7} />
					<Resaltado rect={RW.probarOtro} desde={seg(enEscena(C7, 9.4))} hasta={seg(enEscena(C7, 12.1))} etiqueta="Probar otro método" lado="abajo" />
					<Resaltado rect={RW.usarLlave} desde={seg(enEscena(C7, 13.8))} hasta={seg(enEscena(C7, 16.1))} etiqueta="Usar tu llave de acceso" lado="abajo" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 8: Continuar → Usar un teléfono o una tablet → QR ============ */
const C8: Corte[] = [
	[16.4, 20.3, 1],
	[20.3, 20.9, 0.4], // cámara lenta: el menú solo dura medio segundo en la grabación
	[20.9, 23.0, 1],
];
export const Paso8: React.FC = () => {
	const toma = useToma([
		[0, {cx: 0.62, cy: 0.55, zoom: 1.5}],
		[seg(enEscena(C8, 19.6)), {cx: 0.62, cy: 0.55, zoom: 1.5}],
		[seg(enEscena(C8, 20.35)), {cx: 0.5, cy: 0.35, zoom: 1.45}],
	]);
	return (
		<AbsoluteFill>
			<Paso numero={8} titulo="Usa tu celular para iniciar sesión" total={TOTAL_PASOS} />
			<Marco aspecto={GRABACIONES.webProbar.aspecto}>
				<Camara toma={toma}>
					<Cortes grab="webProbar" cortes={C8} />
					<Resaltado rect={RW.continuar} desde={seg(enEscena(C8, 17.7))} hasta={seg(enEscena(C8, 19.5))} etiqueta="Continuar" lado="abajo" />
					<Resaltado rect={RW.usarTelefono} desde={seg(enEscena(C8, 20.36))} hasta={seg(enEscena(C8, 20.88))} etiqueta="Usar un teléfono o una tablet" lado="derecha" />
				</Camara>
			</Marco>
		</AbsoluteFill>
	);
};

/* ============ PASO 9: escanear el QR con el celular → ya estás dentro ============ */
const C9a: Corte[] = [[23.0, 24.5, 1]];
const C9b: Corte[] = [
	[0.5, 4.0, 1],
	[8.0, 12.9, 1],
	[15.5, 19.4, 1.3],
];
const P9a = 1.5; // QR en la laptop antes de pasar al celular
export const Paso9: React.FC = () => (
	<AbsoluteFill>
		<Paso numero={9} titulo="Escanea el código QR" total={TOTAL_PASOS} />
		<Sequence durationInFrames={seg(P9a)} layout="none">
			<Marco aspecto={GRABACIONES.webProbar.aspecto}>
				<Camara toma={{cx: 0.5, cy: 0.33, zoom: 1.6}}>
					<Cortes grab="webProbar" cortes={C9a} />
				</Camara>
			</Marco>
		</Sequence>
		<Sequence from={seg(P9a)} layout="none">
			<Telefono grab="celQr" cortes={C9b}>
				<Resaltado rect={RC.iniciarConLlave} desde={seg(enEscena(C9b, 1.2))} hasta={seg(enEscena(C9b, 3.9))} etiqueta="Iniciar sesión con llave de acceso" lado="abajo" />
				<Resaltado rect={RC.continuarFaceId} desde={seg(enEscena(C9b, 8.4))} hasta={seg(enEscena(C9b, 9.6))} etiqueta="Continuar" lado="arriba" />
			</Telefono>
		</Sequence>
	</AbsoluteFill>
);
