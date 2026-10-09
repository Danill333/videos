"""Coloca cada pose de Botis 2027 en un lienzo de 2000×2000 con el mismo encuadre que las poses actuales,
para que el componente Botis (RECORTE x580 y480 800×1000) las muestre igual. Solo escala y centra: no toca el dibujo.

Uso: python3 scripts/preparar-botis-2027.py "<carpeta BOTIS - 2027>"
"""
import sys
from pathlib import Path
from PIL import Image

POSES = {
	'Capa 3.png': 'entusiasmado',
	'Capa 4.png': 'duda',
	'Capa 5.png': 'saludando',
	'Capa 6.png': 'laptop',
	'Capa 7.png': 'senalando',
	'Capa 8.png': 'pensando',
	'Capa 9.png': 'idea',
	'Capa 10.png': 'tranquilo',
	'Capa 11.png': 'victoria',
}
LIENZO = 2000
ALTO_MAX, ANCHO_MAX = 870, 780  # tamaño de las poses actuales dentro del recorte de 800×1000
CENTRO_X, BASE_Y = 990, 1460

origen = Path(sys.argv[1])
destino = Path(__file__).resolve().parent.parent / 'public' / 'botis' / '2027'
destino.mkdir(parents=True, exist_ok=True)

for archivo, nombre in POSES.items():
	img = Image.open(origen / archivo).convert('RGBA')
	img = img.crop(img.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox())
	escala = min(ALTO_MAX / img.height, ANCHO_MAX / img.width)
	img = img.resize((round(img.width * escala), round(img.height * escala)), Image.LANCZOS)
	lienzo = Image.new('RGBA', (LIENZO, LIENZO), (0, 0, 0, 0))
	lienzo.alpha_composite(img, (CENTRO_X - img.width // 2, BASE_Y - img.height))
	lienzo.save(destino / f'{nombre}.png', optimize=True)
	print(f'{archivo} -> botis/2027/{nombre}.png ({img.width}×{img.height})')
