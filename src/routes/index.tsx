import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MissionPatch } from "@/components/MissionPatch";
import { Panel } from "@/components/Panel";
import { generateMetrics, TELEMETRY_LINES, type Metric } from "@/lib/sandwich-metrics";

export const Route = createFileRoute("/")({
  component: SandwichCommand,
});

type Phase = "idle" | "analyzing" | "verdict";
type Verdict = { ok: boolean; reason: string };

const REASONS_OK = [
  "All quadrants nominal. Proceed with sandwich.",
  "GASTRO-NAV lock confirmed. You have the window.",
  "Treaty compliance verified. Consume immediately.",
  "Lunar bread alignment within 0.02 rad. Go for bite.",
];
const REASONS_NO = [
  "Mayonnaise drift exceeds tolerance. Stand down.",
  "Pickle brine containment breach imminent.",
  "Calorific guilt buffer overflow detected.",
  "Snack pressure differential unsafe at this altitude.",
];

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function clock() {
  const d = new Date();
  return d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

function MetricBar({ m }: { m: Metric }) {
  const toneColor =
    m.tone === "good" ? "bg-success" :
    m.tone === "warn" ? "bg-amber" :
    m.tone === "bad"  ? "bg-destructive" :
    "bg-primary";
  const label =
    m.tone === "good" ? "OK" :
    m.tone === "warn" ? "MARGINAL" :
    m.tone === "bad"  ? "CRITICAL" : "INFO";
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="uppercase tracking-wider text-muted-foreground">{m.label}</span>
        <span className="tabular-nums text-foreground">{m.raw}</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-sm bg-input">
        <div
          className={`h-full ${toneColor} transition-all duration-500`}
          style={{ width: `${m.value}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_5px,oklch(0_0_0/15%)_5px_6px)]" />
      </div>
      <div className="flex justify-between text-[9px] uppercase tracking-widest text-muted-foreground/70">
        <span>0</span>
        <span className={
          m.tone === "good" ? "text-success" :
          m.tone === "warn" ? "text-amber" :
          m.tone === "bad" ? "text-destructive" : "text-primary"
        }>{label}</span>
        <span>100</span>
      </div>
    </div>
  );
}

function SandwichCommand() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [metrics, setMetrics] = useState<Metric[]>(() => generateMetrics());
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [override, setOverride] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [now, setNow] = useState(clock());
  const [opId] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const i = window.setInterval(() => setNow(clock()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  function runAnalysis(forceOk?: boolean) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("analyzing");
    setOverride(Boolean(forceOk));
    setVerdict(null);
    setProgress(0);
    setLog([]);

    const DURATION = 4200;
    const start = performance.now();
    const tick = () => {
      const p = Math.min(100, ((performance.now() - start) / DURATION) * 100);
      setProgress(p);
      // re-roll metrics partway for that "live computing" feel
      if (Math.random() < 0.35) setMetrics(generateMetrics());
      if (p < 100) {
        timers.current.push(window.setTimeout(tick, 90));
      }
    };
    tick();

    // streaming log
    const logTimer = window.setInterval(() => {
      setLog((l) => {
        const next = [...l, `[${new Date().toISOString().slice(11,19)}] ${pick(TELEMETRY_LINES)}`];
        return next.slice(-80);
      });
    }, 110);
    timers.current.push(logTimer as unknown as number);

    timers.current.push(window.setTimeout(() => {
      clearInterval(logTimer);
      const finalMetrics = generateMetrics();
      setMetrics(finalMetrics);
      const score = finalMetrics.reduce((acc, m) => acc + (m.tone === "good" ? 2 : m.tone === "warn" ? 0 : m.tone === "bad" ? -2 : 1), 0);
      const ok = forceOk ? true : score >= 0;
      setVerdict({
        ok,
        reason: forceOk ? "OVERRIDE PROTOCOL ENGAGED. Command authority assumed by operator." : (ok ? pick(REASONS_OK) : pick(REASONS_NO)),
      });
      setPhase("verdict");
    }, DURATION));
  }

  const verdictTone = phase === "verdict" && verdict ? (verdict.ok ? "go" : "no") : "idle";

  const flyByLines = useMemo(() => {
    const arr: string[] = [];
    for (let i = 0; i < 24; i++) arr.push(pick(TELEMETRY_LINES));
    return arr;
  }, [phase === "analyzing"]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative min-h-screen px-4 py-6 sm:px-8 ${verdictTone === "go" ? "text-foreground" : verdictTone === "no" ? "text-foreground" : ""}`}>
      {/* global tint when verdict */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 transition-opacity duration-700 ${verdictTone === "go" ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.20 145 / 22%), transparent 70%)" }}
      />
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 transition-opacity duration-700 ${verdictTone === "no" ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse at center, oklch(0.55 0.26 25 / 25%), transparent 70%)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 scanlines opacity-30" />

      <div className="relative mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-4 border border-border bg-panel/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <MissionPatch size={84} />
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-[0.3em] text-primary text-glow-green leading-none">
                Sandwich Command
              </h1>
              <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Decision Engine v9.7.34 · Classified · Crumb-Eyes Only
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>OP // <span className="text-primary">{opId}</span></span>
                <span>{now}</span>
                <span>STATION // <span className="text-primary">PANTRY-04</span></span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
            <StatusDot tone="good" label="UPLINK" />
            <StatusDot tone="good" label="OVEN" />
            <StatusDot tone={Math.random() > 0.6 ? "warn" : "good"} label="FRIDGE" />
            <StatusDot tone="good" label="JAW" />
            <StatusDot tone="bad" label="DIET" />
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="mt-6 grid grid-cols-12 gap-4">
          {/* LEFT — metrics */}
          <section className="col-span-12 lg:col-span-5 space-y-4">
            <Panel label="Primary Telemetry" code="0xA1" status={phase === "analyzing" ? "STREAMING" : "STANDBY"} statusTone={phase === "analyzing" ? "amber" : "muted"}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {metrics.slice(0, 6).map((m) => <MetricBar key={m.key} m={m} />)}
              </div>
            </Panel>
            <Panel label="Secondary Telemetry" code="0xA2" status={phase === "analyzing" ? "STREAMING" : "STANDBY"} statusTone={phase === "analyzing" ? "amber" : "muted"}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {metrics.slice(6).map((m) => <MetricBar key={m.key} m={m} />)}
              </div>
            </Panel>
          </section>

          {/* CENTER — verdict + controls */}
          <section className="col-span-12 lg:col-span-4 space-y-4">
            <Panel
              label="Verdict Console"
              code="0xFF"
              status={phase === "idle" ? "AWAITING ORDERS" : phase === "analyzing" ? "PROCESSING" : verdict?.ok ? "AUTHORIZED" : "DENIED"}
              statusTone={phase === "verdict" ? (verdict?.ok ? "primary" : "destructive") : phase === "analyzing" ? "amber" : "muted"}
            >
              <div className="relative flex min-h-[260px] flex-col items-center justify-center text-center">
                {phase === "idle" && (
                  <div className="space-y-3 py-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Awaiting operator input</div>
                    <div className="text-2xl font-bold uppercase tracking-widest text-primary text-glow-green">
                      Should I eat<br/>a sandwich?
                    </div>
                    <div className="text-xs text-muted-foreground">Press <span className="text-accent">ANALYZE</span> to begin mission.</div>
                  </div>
                )}

                {phase === "analyzing" && (
                  <div className="w-full">
                    <div className="text-xs uppercase tracking-[0.3em] text-amber text-glow-amber">
                      <span className="shake inline-block">▲</span> Analyzing<span className="blink">_</span>
                    </div>
                    <div className="mt-3 text-3xl font-bold uppercase tracking-widest text-amber text-glow-amber shake">
                      ANALYZING…
                    </div>
                    <div className="mt-4 h-3 w-full overflow-hidden rounded-sm border border-border bg-input">
                      <div className="h-full bg-amber transition-[width] duration-100" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
                      <span>{progress.toFixed(1)}% complete</span>
                      <span>ETA {((4200 - (progress/100)*4200)/1000).toFixed(1)}s</span>
                    </div>
                    <div className="mt-4 h-32 overflow-hidden rounded-sm border border-border bg-background/50 p-2 text-left">
                      <div className="marquee-up text-[10px] leading-relaxed text-primary/80">
                        {[...flyByLines, ...flyByLines].map((l, i) => (
                          <div key={i}>&gt; {l}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {phase === "verdict" && verdict && (
                  <div className="w-full space-y-4 py-4">
                    {verdict.ok ? (
                      <>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-success">verdict transmitted</div>
                        <div className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-success text-glow-green">
                          SANDWICH<br/>AUTHORIZED 🥪
                        </div>
                        <div className="mx-auto max-w-xs text-xs text-muted-foreground">{verdict.reason}</div>
                        {override && (
                          <div className="inline-block rounded-sm border border-accent px-2 py-1 text-[10px] uppercase tracking-widest text-accent">
                            Override Protocol · Logged
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-destructive">verdict transmitted</div>
                        <div className="text-3xl sm:text-4xl font-extrabold uppercase tracking-widest text-destructive text-glow-red">
                          STAND DOWN,<br/>SOLDIER 🚫
                        </div>
                        <div className="mx-auto max-w-xs text-xs text-muted-foreground">{verdict.reason}</div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            <Panel label="Command Inputs" code="0xC0" status="ARMED" statusTone="amber">
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => runAnalysis(false)}
                  disabled={phase === "analyzing"}
                  className="group relative rounded-sm border-2 border-primary bg-primary/10 px-4 py-4 text-sm font-bold uppercase tracking-[0.3em] text-primary text-glow-green transition hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">[ ▶ ]</span>
                  {phase === "analyzing" ? "Computing…" : "Initiate Sandwich Analysis"}
                </button>
                <button
                  onClick={() => runAnalysis(true)}
                  disabled={phase === "analyzing"}
                  className="group relative rounded-sm border-2 border-destructive bg-destructive/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.3em] text-destructive text-glow-red transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">[ ! ]</span>
                  Override Protocol Ω
                </button>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  ⚠ Override bypasses USDA Treaty Article 12.3. Use is logged but never enforced.
                </p>
              </div>
            </Panel>
          </section>

          {/* RIGHT — stream + diagnostics */}
          <section className="col-span-12 lg:col-span-3 space-y-4">
            <Panel
              label="Telemetry Stream"
              code="TTY1"
              status={phase === "analyzing" ? "LIVE" : "IDLE"}
              statusTone={phase === "analyzing" ? "amber" : "muted"}
            >
              <div className="h-[280px] overflow-hidden rounded-sm border border-border bg-background/60 p-2 text-[10px] leading-relaxed">
                {log.length === 0 ? (
                  <div className="text-muted-foreground">
                    &gt; awaiting signal<span className="blink">_</span>
                  </div>
                ) : (
                  <div className="flex flex-col-reverse">
                    {[...log].reverse().map((l, i) => (
                      <div key={i} className={i === 0 ? "text-primary" : "text-muted-foreground"}>
                        &gt; {l}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            <Panel label="Subsystem Diag" code="0xDB" status="NOMINAL" statusTone="primary">
              <ul className="space-y-1.5 text-[11px]">
                {[
                  ["Bread Toaster Bus", "ONLINE", "good"],
                  ["Mayo Pressure Loop", phase === "analyzing" ? "SPIKING" : "STABLE", phase === "analyzing" ? "warn" : "good"],
                  ["Lettuce Hydraulics", "OK", "good"],
                  ["Crumb Vacuum", "STANDBY", "muted"],
                  ["Regret Compiler", "RUNNING", "good"],
                  ["Refrigerator Quorum", "3/5", "warn"],
                ].map(([k, v, tone]) => (
                  <li key={k as string} className="flex items-center justify-between border-b border-border/40 pb-1">
                    <span className="text-muted-foreground uppercase tracking-wider">{k}</span>
                    <span className={
                      tone === "good" ? "text-success" :
                      tone === "warn" ? "text-amber" :
                      tone === "bad" ? "text-destructive" : "text-muted-foreground"
                    }>{v}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel label="ASCII Sandwich" code="0xEA" status="RENDERED" statusTone="muted">
              <pre className="overflow-hidden text-[9px] leading-tight text-primary/80">
{`     .-""""""-.
    /  ^ ^  ^  \\
   |~  *  ~  ~  |
   |~~~~~~~~~~~~|
    \\.~.~.~.~./
     |||||||||||
    /===========\\
   '~~~~~~~~~~~~~'
`}
              </pre>
            </Panel>
          </section>
        </main>

        {/* TICKER */}
        <footer className="mt-6 overflow-hidden rounded-sm border border-border bg-panel/80 backdrop-blur-sm">
          <div className="border-b border-border px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            BROADCAST · ALL UNITS
          </div>
          <div className="relative h-7 overflow-hidden">
            <div className="ticker absolute top-1/2 flex -translate-y-1/2 whitespace-nowrap text-[11px] uppercase tracking-widest text-primary">
              {Array.from({ length: 2 }).map((_, k) => (
                <span key={k} className="flex">
                  {[
                    "◆ Reminder: do not eat over the keyboard",
                    "◆ Pickle brine spill in sector 7",
                    "◆ Mustard reserves at 12% — ration accordingly",
                    "◆ Operators are reminded that the sandwich is its own reward",
                    "◆ Toaster temperature normalized to 218°C",
                    "◆ Per directive 4711-A, all crusts are now optional",
                    "◆ Lunar window for BLT closes in 03:14:00",
                  ].map((t, i) => <span key={`${k}-${i}`} className="mx-8">{t}</span>)}
                </span>
              ))}
            </div>
          </div>
        </footer>

        <div className="mt-4 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          © Sandwich Command · Established 1973 · Per Aspera Ad Condimentum
        </div>
      </div>
    </div>
  );
}

function StatusDot({ tone, label }: { tone: "good" | "warn" | "bad"; label: string }) {
  const c = tone === "good" ? "bg-success" : tone === "warn" ? "bg-amber" : "bg-destructive";
  const t = tone === "good" ? "text-success" : tone === "warn" ? "text-amber" : "text-destructive";
  return (
    <div className="flex items-center gap-1.5 rounded-sm border border-border bg-background/60 px-2 py-1">
      <span className={`inline-block size-1.5 rounded-full ${c} ${tone === "good" ? "pulse-ring" : ""}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className={t}>{tone === "good" ? "OK" : tone === "warn" ? "WARN" : "FAIL"}</span>
    </div>
  );
}
