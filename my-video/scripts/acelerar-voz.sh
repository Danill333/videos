#!/bin/sh
# Acelera la locución del video Llave de acceso sin cambiar el tono (debe coincidir con VELOCIDAD en src/llave/tiempo.ts).
# Uso: sh scripts/acelerar-voz.sh 1.05 [llave | llave-celular]
set -e
V=${1:-1.05}
cd "$(dirname "$0")/../public/${2:-llave}"
mkdir -p voz-rapida
for f in voz/*.wav; do k=$(basename "$f" .wav)
	ffmpeg -v error -y -i "voz/$k.wav" -af "atempo=$V" "voz-rapida/$k.wav"
done
