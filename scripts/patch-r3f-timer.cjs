/* Keep React Three Fiber 9.6 compatible with Three r184 until R3F ships its Timer migration. */
const fs = require("fs");
const path = require("path");

const files = [
  ["events-b389eeca.esm.js", "THREE"],
  ["events-f19bcc32.cjs.dev.js", "THREE__namespace"],
  ["events-583399dd.cjs.prod.js", "THREE__namespace"],
];

const timerClock = (namespace) => `(() => {
  const timer = new ${namespace}.Timer(); let elapsed = 0; let old = 0; let running = true;
  return {
    get elapsedTime() { return elapsed; }, set elapsedTime(value) { elapsed = value; },
    get oldTime() { return old; }, set oldTime(value) { old = value; },
    start() { timer.reset(); running = true; }, stop() { running = false; },
    getDelta() { if (!running) return 0; timer.update(); const delta = timer.getDelta(); old = elapsed; elapsed += delta; return delta; },
    getElapsedTime() { this.getDelta(); return elapsed; }
  };
})()`;

for (const [file, namespace] of files) {
  const target = path.join(__dirname, "..", "node_modules", "@react-three", "fiber", "dist", file);
  if (!fs.existsSync(target)) continue;
  const source = fs.readFileSync(target, "utf8");
  const legacy = `clock: new ${namespace}.Clock(),`;
  if (source.includes(legacy)) fs.writeFileSync(target, source.replace(legacy, `clock: ${timerClock(namespace)},`));
}
