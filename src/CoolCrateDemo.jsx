import React, { useState, useMemo } from "react";
import { Snowflake, Leaf, Clock, MapPin, TrendingDown, CheckCircle2, AlertTriangle, Sun, Droplets, Info, Sparkles } from "lucide-react";

// Reference shelf-life days: ambientLife @ 25°C, coldLife inside CoolCrate (~4°C, high humidity)
const PRODUCE = {
  tomato:   { label: "Tomato",       ambientLife: 4,   coldLife: 20, icon: "🍅" },
  potato:   { label: "Potato",       ambientLife: 30,  coldLife: 150, icon: "🥔" },
  apple:    { label: "Apple",        ambientLife: 14,  coldLife: 90, icon: "🍎" },
  banana:   { label: "Banana",       ambientLife: 3,   coldLife: 14, icon: "🍌" },
  onion:    { label: "Onion",        ambientLife: 25,  coldLife: 120, icon: "🧅" },
  mango:    { label: "Mango",        ambientLife: 5,   coldLife: 21, icon: "🥭" },
  leafy:    { label: "Leafy Greens", ambientLife: 1.5, coldLife: 10, icon: "🥬" },
  okra:     { label: "Okra",         ambientLife: 2.5, coldLife: 12, icon: "🫑" },
  brinjal:  { label: "Brinjal",      ambientLife: 5,   coldLife: 21, icon: "🍆" },
  cucumber: { label: "Cucumber",     ambientLife: 4,   coldLife: 18, icon: "🥒" },
};

// Quick example scenarios so anyone can understand the tool in one click
const PRESETS = [
  { label: "Tomatoes left in the sun", produceKey: "tomato", daysSince: 2, temp: 38 },
  { label: "Fresh leafy greens, hot day", produceKey: "leafy", daysSince: 1, temp: 34 },
  { label: "Potatoes, cool morning", produceKey: "potato", daysSince: 3, temp: 24 },
  { label: "Mangoes, just harvested", produceKey: "mango", daysSince: 0, temp: 30 },
];

const SLOTS = [
  { time: "6:00 AM", capacity: 82 },
  { time: "10:00 AM", capacity: 55 },
  { time: "2:00 PM", capacity: 24 },
  { time: "6:00 PM", capacity: 9 },
];

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function CoolCrateDemo() {
  const [produceKey, setProduceKey] = useState("tomato");
  const [daysSince, setDaysSince] = useState(1);
  const [temp, setTemp] = useState(32);
  const [showInfo, setShowInfo] = useState(false);

  const produce = PRODUCE[produceKey];

  const result = useMemo(() => {
    const Q10 = 2;
    const refTemp = 25;
    const adjustedAmbientLife = produce.ambientLife * Math.pow(Q10, (refTemp - temp) / 10);
    const remainingAmbient = clamp(adjustedAmbientLife - daysSince, 0, 999);
    const remainingCold = clamp(produce.coldLife - daysSince, 0, 999);

    let risk = "safe";
    if (remainingAmbient <= 0.5) risk = "critical";
    else if (remainingAmbient <= 1.5) risk = "warning";

    const gainDays = Math.max(remainingCold - remainingAmbient, 0);
    const multiplier = remainingAmbient > 0 ? (remainingCold / Math.max(remainingAmbient, 0.3)) : (produce.coldLife / produce.ambientLife);

    const bestSlot = risk === "critical"
      ? SLOTS.reduce((a, b) => (a.capacity < b.capacity ? a : b))
      : risk === "warning"
      ? SLOTS.find(s => s.capacity < 70) || SLOTS[0]
      : null;

    // scale the bar chart to whatever produce has the longest cold life, so short and long-life items both read clearly
    const barMax = Math.max(produce.coldLife, remainingCold, remainingAmbient, 4);

    return { remainingAmbient, remainingCold, risk, gainDays, multiplier, bestSlot, barMax };
  }, [produce, daysSince, temp]);

  const riskCopy = {
    critical: { label: "Critical — sell or store today", sub: "In plain terms: this batch will spoil before tomorrow if left as it is. Act now.", color: "#C1543C", Icon: AlertTriangle },
    warning:  { label: "At risk — book storage within 24 hrs", sub: "In plain terms: shelf life is running low. Booking a slot soon will avoid loss.", color: "#E8A33D", Icon: Clock },
    safe:     { label: "Safe to hold, no action needed yet", sub: "In plain terms: this batch is still fresh. No rush to store it today.", color: "#6B9B6E", Icon: CheckCircle2 },
  }[result.risk];

  const applyPreset = (p) => {
    setProduceKey(p.produceKey);
    setDaysSince(p.daysSince);
    setTemp(p.temp);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#142E24", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        .disp { font-family: 'Fraunces', serif; }
        .num { font-family: 'IBM Plex Mono', monospace; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: #3A5B4C; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #E8A33D; cursor: pointer; border: 4px solid #142E24; box-shadow: 0 0 0 1px #E8A33D55; }
        select { -webkit-appearance: none; appearance: none; }
        .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; }
        .card { background: #1B3A2F; border-radius: 18px; border: 1px solid #294839; }
        .preset-btn { transition: transform 0.15s ease, background 0.15s ease; cursor: pointer; }
        .preset-btn:hover { transform: translateY(-2px); background: #2A4C3D !important; }
        @media (max-width: 640px) {
          .wrap { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="wrap" style={{ padding: "72px 32px 40px", maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#E8A33D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Snowflake size={19} color="#142E24" />
          </div>
          <span style={{ color: "#9FB8A9", letterSpacing: "0.14em", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>CoolCrate · AI Shelf-Life Engine</span>
        </div>
        <h1 className="disp" style={{ color: "#F5F2E8", fontSize: "clamp(30px,4.2vw,48px)", fontWeight: 600, lineHeight: 1.2, maxWidth: 680, margin: 0 }}>
          Predict spoilage before it happens.
        </h1>
        <p style={{ color: "#AFC6B8", fontSize: 16, marginTop: 20, maxWidth: 600, lineHeight: 1.7 }}>
          Pick a vegetable or fruit, tell it how old the batch is and how hot it is outside —
          it tells you, in plain language, whether to sell now, store it, or wait.
        </p>

        {/* Quick presets so anyone can understand with one click */}
        <div style={{ marginTop: 28 }}>
          <div style={{ color: "#7E9A8B", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={13} /> Try an example
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className="preset-btn"
                onClick={() => applyPreset(p)}
                style={{
                  background: "#1B3A2F", border: "1px solid #294839", borderRadius: 999,
                  padding: "10px 18px", color: "#F5F2E8", fontSize: 13.5, fontWeight: 500,
                }}
              >
                {PRODUCE[p.produceKey].icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="wrap" style={{ maxWidth: 1040, margin: "0 auto", padding: "0 32px 28px" }}>
        <div className="card" style={{ padding: "36px 40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div style={{ color: "#9FB8A9", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>Batch details</div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{ background: "none", border: "none", color: "#7E9A8B", display: "flex", alignItems: "center", gap: 5, fontSize: 12, cursor: "pointer", padding: 0 }}
            >
              <Info size={14} /> How does this work?
            </button>
          </div>

          {showInfo && (
            <div style={{ background: "#142E24", borderRadius: 12, padding: "16px 20px", marginBottom: 28, color: "#B7CBBE", fontSize: 13, lineHeight: 1.7 }}>
              Every fruit or vegetable has a natural shelf life — how many days it stays good before spoiling.
              Heat speeds this up: for roughly every 10°C rise in temperature, produce spoils about twice as
              fast (this is called the <span style={{ color: "#E8A33D" }}>Q10 rule</span>, a real food-science
              principle). CoolCrate uses this rule to work out how many days a batch has left, and compares
              that to how much longer it would last inside a CoolCrate cold storage unit.
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 36 }}>
            <div>
              <label style={{ color: "#F5F2E8", fontSize: 13.5, fontWeight: 500, display: "block", marginBottom: 12 }}>Produce type</label>
              <select
                value={produceKey}
                onChange={(e) => setProduceKey(e.target.value)}
                style={{ width: "100%", background: "#142E24", color: "#F5F2E8", border: "1px solid #3A5B4C", borderRadius: 10, padding: "13px 14px", fontSize: 14.5 }}
              >
                {Object.entries(PRODUCE).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ color: "#F5F2E8", fontSize: 13.5, fontWeight: 500, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span>Days since harvest</span>
                <span className="num" style={{ color: "#E8A33D" }}>{daysSince}d</span>
              </label>
              <input type="range" min="0" max="10" step="1" value={daysSince} onChange={(e) => setDaysSince(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <label style={{ color: "#F5F2E8", fontSize: 13.5, fontWeight: 500, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Sun size={14} />Ambient temp</span>
                <span className="num" style={{ color: "#E8A33D" }}>{temp}°C</span>
              </label>
              <input type="range" min="20" max="42" step="1" value={temp} onChange={(e) => setTemp(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk banner */}
      <div className="wrap" style={{ maxWidth: 1040, margin: "0 auto", padding: "0 32px 28px" }}>
        <div className="card" style={{ padding: "26px 40px", borderColor: `${riskCopy.color}55`, display: "flex", alignItems: "flex-start", gap: 16 }}>
          <riskCopy.Icon size={24} color={riskCopy.color} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ color: "#F5F2E8", fontSize: 16.5, fontWeight: 600, marginBottom: 6 }}>{riskCopy.label}</div>
            <div style={{ color: "#9FB8A9", fontSize: 13.5, lineHeight: 1.6 }}>{riskCopy.sub}</div>
          </div>
        </div>
      </div>

      {/* Timeline + Slots */}
      <div className="wrap grid-2" style={{ maxWidth: 1040, margin: "0 auto", padding: "0 32px 72px" }}>

        <div className="card" style={{ padding: "36px 40px" }}>
          <div style={{ color: "#9FB8A9", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 32 }}>Remaining shelf life</div>

          {[
            { label: "Without CoolCrate", days: result.remainingAmbient, color: riskCopy.color, Icon: TrendingDown },
            { label: "With CoolCrate", days: result.remainingCold, color: "#6BA3E8", Icon: Snowflake },
          ].map((row, i) => (
            <div key={i} style={{ marginBottom: i === 0 ? 28 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#D9E5DD", fontSize: 13.5, display: "flex", alignItems: "center", gap: 7 }}><row.Icon size={14} />{row.label}</span>
                <span className="num" style={{ color: row.color, fontSize: 13.5, fontWeight: 600 }}>{row.days.toFixed(1)} days</span>
              </div>
              <div style={{ height: 12, background: "#142E24", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${clamp((row.days / result.barMax) * 100, 2, 100)}%`, background: row.color, borderRadius: 6, transition: "width 0.3s ease" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 32, background: "#142E24", borderRadius: 12, padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ color: "#AFC6B8", fontSize: 13 }}>Shelf-life gain from cold storage</span>
            <span className="num" style={{ color: "#E8A33D", fontSize: 18, fontWeight: 700 }}>+{result.gainDays.toFixed(1)}d · {result.multiplier.toFixed(1)}×</span>
          </div>
        </div>

        <div className="card" style={{ padding: "36px 40px" }}>
          <div style={{ color: "#9FB8A9", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28, display: "flex", alignItems: "center", gap: 7 }}>
            <MapPin size={14} /> Nearest collection point — today's slots
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SLOTS.map((s) => {
              const recommended = result.bestSlot && result.bestSlot.time === s.time;
              return (
                <div key={s.time} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderRadius: 12, padding: "14px 18px",
                  background: recommended ? "#2A4C3D" : "#142E24",
                  border: recommended ? "1.5px solid #E8A33D" : "1px solid #294839",
                }}>
                  <span style={{ color: "#F5F2E8", fontSize: 14, fontWeight: 500 }}>{s.time}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className="num" style={{ color: s.capacity > 70 ? "#C1543C" : "#7FA687", fontSize: 12.5 }}>{s.capacity}% full</span>
                    {recommended && (
                      <span style={{ color: "#142E24", background: "#E8A33D", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "4px 9px", borderRadius: 6 }}>BOOK THIS</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!result.bestSlot && (
            <div style={{ marginTop: 20, color: "#7E9A8B", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8 }}>
              <Leaf size={14} /> No urgent booking needed — recheck tomorrow.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
