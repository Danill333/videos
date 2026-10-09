import {Composition} from 'remotion';
import {HelloWorld} from './HelloWorld';
import {DURACION_LLAVE, LlaveDeAcceso, LlaveProps} from './llave/LlaveDeAcceso';
import {DURACION_LLAVE_CELULAR, LlaveCelularProps, LlaveDesdeCelular} from './llave-celular/LlaveDesdeCelular';
import {Tutorial, TutorialProps} from './tutorial/Tutorial';
import {DURACION_TOTAL, FPS} from './tutorial/tema';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="DelegarAprobaciones"
				component={Tutorial}
				durationInFrames={DURACION_TOTAL}
				fps={FPS}
				width={1920}
				height={1080}
				defaultProps={{botis: true, locucion: 'propia', volumenMusica: 0.3, subtitulos: true} satisfies TutorialProps}
			/>
			<Composition
				id="LlaveDeAcceso"
				component={LlaveDeAcceso}
				durationInFrames={DURACION_LLAVE}
				fps={FPS}
				width={1920}
				height={1080}
				defaultProps={{botis: true, volumenMusica: 0.36, subtitulos: true} satisfies LlaveProps}
			/>
			<Composition
				id="LlaveDesdeCelular"
				component={LlaveDesdeCelular}
				durationInFrames={DURACION_LLAVE_CELULAR}
				fps={FPS}
				width={1920}
				height={1080}
				defaultProps={{botis: true, volumenMusica: 0.36, subtitulos: true} satisfies LlaveCelularProps}
			/>
			<Composition
				id="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{titulo: '¡Hola, Remotion!'}}
			/>
		</>
	);
};
