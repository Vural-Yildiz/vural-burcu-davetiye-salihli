# Film üretimi

Python 3, Pillow, NumPy ve FFmpeg gerekir. Kapı kaynağı, HeyGen'deki incelenmiş 9 saniyelik Enchanted Gateway MP4'üdür. Yerel dosyayı `door.mp4` olarak sağlayın.

```sh
ffmpeg -y -ss 8.8 -i door.mp4 -frames:v 1 /tmp/door-final.png
python tools/film/render_envelope.py --background /tmp/door-final.png --output /tmp/envelope.mp4
python tools/film/assemble.py door.mp4 /tmp/envelope.mp4 assets/intro.mp4
node tests/intro-state.cjs
```

`render_envelope.py`, sabit BV harflerini ve zarfın hareketini yerel çizim katmanlarıyla üretir. `assemble.py`, 0,6 saniyelik geçiş ve özgün ambient sesle 22 saniyelik web videosu oluşturur. Son kare mevcut `assets/scene-10.webp` görselidir; gerçek tıklanabilir düğme HTML katmanındadır. Video yolu `intro-config.js` üzerinden ayarlanır.

Üretim kaynaklarını ve kalite sınırlamalarını `VIDEO_PRODUCTION.md` açıklar.
