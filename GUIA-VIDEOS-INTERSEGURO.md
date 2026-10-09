# Guía de videos tutoriales Interseguro

Estilo aprobado para los videos tutoriales (primer video: "Delegar aprobaciones en Freshservice").
El proyecto de Remotion está en la carpeta `my-video`.

## Cómo abrir el proyecto
1. En la app de Claude, pestaña **Code**, abre una sesión nueva en la carpeta **Documentos › Videos Interseguro**.
2. Para ver y editar el video: en la carpeta `my-video` ejecuta `npm run dev` (abre Remotion Studio).
3. Para exportar: `npx remotion render DelegarAprobaciones out/delegar-aprobaciones.mp4 --concurrency=2 --timeout=120000`
   (con concurrencia 2 para que la Mac no se quede sin memoria; tarda unos 15 minutos).

## Estilo visual
- Formato 1920×1080, 30 fps.
- Intro y cierre sobre fondo blanco, sin footer. Logo Interseguro arriba a la izquierda en todas las escenas (archivo entregado, sin cambiarle el color).
- Fuente **Interseguro Sans**: Bold para títulos, Medium para etiquetas y botones, Book para subtítulos y textos.
- Colores oficiales: Azul Interseguro `#0A6AF5` (principal y resaltados), Azul 4 `#042C6C` (textos y caja de subtítulos), Azul 1 `#80DFFF` (palabras clave en subtítulos), Magenta `#F32682` solo como detalle. Nada de amarillo.
- Pasos con la etiqueta "Paso X de N", la grabación de pantalla dentro de una tarjeta, zoom al botón de cada paso y recuadros con etiqueta que marcan dónde hacer clic.
- Los recuadros se miden sobre la grabación a resolución completa para que queden exactamente sobre el botón o campo.
- Los clics y zooms se sincronizan con la palabra que dice la voz.
- Final: el cierre se desvanece a blanco → logo centrado que aparece y se desvanece → pantalla completamente en blanco.

## Mascota Botis
- PNG con fondo transparente, una pose por escena (saludando, señalando, pensando, duda, celebrando).
- Solo se anima la imagen completa: flotar, respirar, balanceo leve, entrada y cambio de pose. Lleva una sombra suave. Nunca se modifica el dibujo.

## Audio
- Locución propia, limpiada: reducción de ruido, anti-golpes, silencio total en las pausas, ecualización para una voz más ligera. Nivel −16 LUFS.
- Música de fondo original (tecnológica y amena), muy baja; baja sola mientras habla la voz (`volumenMusica` = 0,3).
- Grabar la voz con Notas de Voz o QuickTime en la Mac, no por WhatsApp (WhatsApp provoca golpes y silencios bruscos).

## Qué enviar para un video nuevo
1. Guion con la voz dividida por escenas.
2. Grabación de pantalla del proceso completo, de principio a fin.
3. Locución grabada (con una pausa de 2 segundos entre frases).
4. Poses de Botis que encajen con el tema (PNG con fondo transparente), si se necesitan nuevas.

## Referencias
- Manual de marca: `Brand IS.pdf` (fuentes, paleta, uso del logo).
- Fuentes: carpeta `my-video/public/fuentes`.
