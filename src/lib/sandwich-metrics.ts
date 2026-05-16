export type Metric = {
  key: string;
  label: string;
  unit: string;
  value: number; // 0..100
  raw: string;   // formatted readout
  tone: "good" | "warn" | "bad" | "info";
};

const LABELS: Array<Omit<Metric, "value" | "raw" | "tone"> & { gen: () => { raw: string; value: number; tone: Metric["tone"] } }> = [
  { key: "hunger", label: "Operator Hunger Index", unit: "kcal/min", gen: () => {
    const v = rand(10, 100); return { value: v, raw: `${v.toFixed(1)} kcal/min`, tone: v > 60 ? "good" : v > 30 ? "warn" : "bad" };
  }},
  { key: "bread", label: "Bread Structural Integrity", unit: "MPa", gen: () => {
    const v = rand(20, 99); return { value: v, raw: `${(v / 10).toFixed(2)} MPa`, tone: v > 50 ? "good" : "warn" };
  }},
  { key: "cheese", label: "Cheese-to-Filling Ratio", unit: ":1", gen: () => {
    const v = rand(15, 95); const r = (v / 30).toFixed(2); return { value: v, raw: `${r} : 1`, tone: v > 70 ? "good" : v > 40 ? "warn" : "bad" };
  }},
  { key: "snack", label: "Ambient Snack Pressure", unit: "kPa", gen: () => {
    const v = rand(20, 100); return { value: v, raw: `${(v * 1.013).toFixed(1)} kPa`, tone: v > 60 ? "warn" : "good" };
  }},
  { key: "mayo", label: "Mayonnaise Drift Vector", unit: "°", gen: () => {
    const v = rand(0, 100); return { value: v, raw: `${(v * 3.6).toFixed(1)}° NE`, tone: v < 50 ? "good" : "warn" };
  }},
  { key: "crumb", label: "Crumb Trajectory Forecast", unit: "ppm", gen: () => {
    const v = rand(5, 95); return { value: v, raw: `${(v * 12).toFixed(0)} ppm`, tone: v < 40 ? "good" : v < 70 ? "warn" : "bad" };
  }},
  { key: "lettuce", label: "Lettuce Crispness Coefficient", unit: "η", gen: () => {
    const v = rand(0, 100); return { value: v, raw: `η = 0.${String(v).padStart(2,"0")}`, tone: v > 65 ? "good" : v > 35 ? "warn" : "bad" };
  }},
  { key: "guilt", label: "Calorific Guilt Buffer", unit: "%", gen: () => {
    const v = rand(0, 100); return { value: v, raw: `${v.toFixed(0)} %`, tone: v < 40 ? "good" : v < 70 ? "warn" : "bad" };
  }},
  { key: "lunar", label: "Lunar Bread Alignment", unit: "rad", gen: () => {
    const v = rand(0, 100); return { value: v, raw: `${(v / 100 * 6.283).toFixed(3)} rad`, tone: "info" };
  }},
  { key: "condiment", label: "Condiment Saturation Vector", unit: "g/cm²", gen: () => {
    const v = rand(15, 100); return { value: v, raw: `${(v / 50).toFixed(3)} g/cm²`, tone: v > 80 ? "warn" : "good" };
  }},
  { key: "filling", label: "Filling Centroid Stability", unit: "mm", gen: () => {
    const v = rand(10, 95); return { value: v, raw: `Δ ${(100 - v) / 10} mm`, tone: v > 60 ? "good" : "warn" };
  }},
  { key: "pickle", label: "Pickle Brine Containment", unit: "ml", gen: () => {
    const v = rand(0, 100); return { value: v, raw: `${v.toFixed(0)} ml leak`, tone: v < 30 ? "good" : v < 70 ? "warn" : "bad" };
  }},
];

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateMetrics(): Metric[] {
  return LABELS.map(({ gen, ...rest }) => {
    const g = gen();
    return { ...rest, ...g };
  });
}

export const TELEMETRY_LINES = [
  "init: thermal mapping bread surface...",
  "calibrating mayonnaise interferometer...",
  "uplink to LETTUCE-7 satellite established",
  "cross-referencing operator BMI against treaty article 12.3",
  "spinning up crouton inertia gyros",
  "warning: pickle eigenvalue exceeds nominal",
  "negotiating with refrigerator subsystem",
  "checksum: rye-512 OK",
  "verifying lunar phase against condiment table",
  "engaging counter-soggy maneuvers",
  "RNG seed entropy: 0xC0FFEE",
  "ENGAGE: protein folding analysis (turkey)",
  "deploying crumb containment field",
  "sandbox geometry resolved: 3.14 layers",
  "operator stomach gravity: 9.81 m/s²",
  "checking treaty: USDA Bilateral Accord 1972",
  "reticulating splines... reticulating sandwiches",
  "TIER-1 carb embargo lifted",
  "GASTRO-NAV lock acquired",
  "encrypting bite trajectory with AES-256-MUSTARD",
  "validating jurisdiction: KITCHEN_AIRSPACE",
  "compiling regret coefficient... 0.04",
  "telemetry: butter half-life 11.2s",
  "thermal envelope: WARM_ENOUGH",
  "engaging napkin proximity sensor",
  "calibrating jaw articulation matrix",
  "ALERT: nearby colleague triangulating your lunch",
  "cross-link with COOKIE-COMMAND degraded",
  "checking pantry quorum (3/5 nodes online)",
  "load-balancing across both hands",
];
