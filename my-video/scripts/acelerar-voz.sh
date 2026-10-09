#!/bin/sh
# Acelera la locución del video Llave de acceso sin cambiar el tono (debe coincidir con VELOCIDAD en src/llave/tiempo.ts).
# Uso: sh scripts/acelerar-voz.sh 1.05
set -e
V=${1:-1.05}
cd "$(dirname "$0")/../public/llave"
mkdir -p voz-rapida
for k in intro antes paso1 paso2 paso3 paso4 paso5 paso6 cierre; do
	ffmpeg -v error -y -i "voz/$k.wav" -af "atempo=$V" "voz-rapida/$k.wav"
done
