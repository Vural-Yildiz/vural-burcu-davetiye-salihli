# Controlled envelope animation

`render_envelope.py` renders 13 seconds of native artwork at 720×1280 and 25 fps: a rigid gold BV seal releases, the paper flap rotates around its hinge and the card slides behind the front pocket. Letters are drawn once. The final frames match assets/scene-10.webp. The envelope is a new vector-style design inspired by the existing black/gold direction; it is not a pixel-identical reconstruction of the photographic reference.

Dependencies: Python, Pillow, NumPy and FFmpeg. Run `python tools/film/render_envelope.py --output /tmp/envelope.mp4`. `add_sound(source, destination)` adds original synthesized paper/chime effects. `--preview` writes a contact sheet for layout review.

Validation: rendered all 325 frames, decoded the whole MP4 with FFmpeg without errors, inspected representative frames and checked H.264/AAC, 720×1280, 13 seconds. This is an envelope draft, not the completed door-to-invitation film.

The corrected HeyGen doorway was reported as 9 seconds, 720×1280, resource `video_sjgu56`. The resource API exposes only a PNG preview; asset 89b6f6de4f28492a8bb1ced4fc668eee returns 404. The agent confirmed it cannot export a standard MP4 with its available tools. Do not claim that this clip has been downloaded or reviewed. Obtain the actual clip from the user before assembly and preserve the final image/HTML button alignment. intro-config.js remains empty until the complete film is verified.
