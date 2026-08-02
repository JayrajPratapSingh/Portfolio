# Sea creature models (day-mode home)

Drop CC0-licensed `.glb` files here and they replace the procedural creatures
automatically. If a file is missing, the scene falls back to the built-in
procedural version — nothing breaks.

Expected filenames (wired in `src/components/landing/day/SeaLife.tsx`):

- `shark.glb`  — patrols across the mid-deep (~65–82% scroll)
- `turtle.glb` — glides on the left (~68–86% scroll)
- `whale.glb`  — drifts across the deepest water (~88–100% scroll)

## Where to get free models (CC0 / public domain)

- https://poly.pizza  (search "shark", "sea turtle", "whale" — download glB)
- https://quaternius.com  (stylized packs)
- https://sketchfab.com  (filter Downloadable + License = CC0)
- https://github.com/KhronosGroup/glTF-Sample-Assets

## Turn the loader on

After adding the files, set `HAS_MODELS = true` at the top of
`src/components/landing/day/SeaLife.tsx`. Until then the loader is off (no
fetches / 404s) and the procedural creatures render.

## After adding a file

The model's real-world size / facing axis varies per asset. Tune these in
`SeaLife.tsx` on the matching `<GLTFCreature>`:

- `scale` — overall size
- `behavior` → `g.rotation.set(0, <yaw>, 0)` — which way it faces

Keep files small (< ~2–3 MB, Draco-compressed if possible) to hold 60fps.
