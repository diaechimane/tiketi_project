/**
 * TIKETI — Module Rapports Admin Avancés
 * ───────────────────────────────────────
 * Intégration dans TIKETI_MVP.jsx :
 *
 * 1. import { RapportsAdmin } from './TIKETI_Rapports';
 * 2. Dans le back-office Admin, remplacez l'onglet "Rapports" basique
 *    par : <RapportsAdmin />
 * 3. Le composant est autonome — toutes les données sont en props ou
 *    en constantes (remplacer par des appels API réels en production)
 */

import { useState, useEffect, useRef } from "react";

const C = {
  blue: "#185FA5", blueLt: "#E6F1FB", blueDk: "#0C447C",
  green: "#085041", greenLt: "#E1F5EE",
  amber: "#633806", amberLt: "#FAEEDA",
  red: "#791F1F", redLt: "#FCEBEB",
  purple: "#3C3489", purpleLt: "#EEEDFE",
  gray: "#4A4A4A", border: "#e0e0e0", white: "#FFFFFF", bg: "#F5F7FA",
};

// ─── DONNÉES DE DÉMONSTRATION ────────────────────────────────────────────────

const REVENUS_7J = [
  { jour: "Lun",  date: "26 juil", montant: 312500, billets: 89  },
  { jour: "Mar",  date: "27 juil", montant: 427000, billets: 122 },
  { jour: "Mer",  date: "28 juil", montant: 385000, billets: 110 },
  { jour: "Jeu",  date: "29 juil", montant: 294500, billets: 84  },
  { jour: "Ven",  date: "30 juil", montant: 518000, billets: 148 },
  { jour: "Sam",  date: "31 juil", montant: 672000, billets: 192 },
  { jour: "Dim",  date: "1 août",  montant: 433500, billets: 124 },
];

const REVENUS_30J = Array.from({ length: 30 }, (_, i) => ({
  jour: `J${i + 1}`,
  date: `${i + 1} juil`,
  montant: Math.round(200000 + Math.random() * 500000),
  billets: Math.round(60 + Math.random() * 150),
}));

const LIGNES_PERF = [
  { route: "Abidjan → Yamoussoukro", billets: 1240, revenus: 4340000, taux: 94, variation: +12 },
  { route: "Abidjan → Bouaké",       billets: 820,  revenus: 3280000, taux: 87, variation: +7  },
  { route: "Abidjan → San Pedro",    billets: 610,  revenus: 2318000, taux: 78, variation: -3  },
  { route: "Abidjan → Man",          billets: 390,  revenus: 1950000, taux: 71, variation: +5  },
  { route: "Abidjan → Korhogo",      billets: 280,  revenus: 1680000, taux: 65, variation: -8  },
];

const PAIEMENTS_REPARTITION = [
  { moyen: "Orange Money",     pct: 42, montant: 5821000, color: "#FF6B00" },
  { moyen: "MTN Mobile Money", pct: 28, montant: 3880000, color: "#FFCC00" },
  { moyen: "Wave",             pct: 18, montant: 2494000, color: "#1B5EF2" },
  { moyen: "Carte bancaire",   pct: 12, montant: 1662000, color: "#185FA5" },
];

const HEURES_AFFLUENCE = [
  { h: "05h", val: 12 }, { h: "06h", val: 78 }, { h: "07h", val: 92 },
  { h: "08h", val: 65 }, { h: "09h", val: 48 }, { h: "10h", val: 35 },
  { h: "11h", val: 28 }, { h: "12h", val: 42 }, { h: "13h", val: 38 },
  { h: "14h", val: 55 }, { h: "15h", val: 48 }, { h: "16h", val: 62 },
  { h: "17h", val: 85 }, { h: "18h", val: 70 }, { h: "19h", val: 32 },
  { h: "20h", val: 15 },
];

// ─── COMPOSANTS GRAPHIQUES ────────────────────────────────────────────────────

function BarChart({ data, color = C.blue, height = 120 }) {
  const max = Math.max(...data.map(d => d.montant));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height, paddingBottom: 20, position: "relative" }}>
      {data.map((d, i) => {
        const pct = (d.montant / max) * 100;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
              <div style={{ width: "100%", height: `${pct}%`, background: color, borderRadius: "3px 3px 0 0", minHeight: 4, transition: "height .3s ease" }} title={`${(d.montant/1000).toFixed(0)}K FCFA`} />
            </div>
            <div style={{ fontSize: 9, color: "#bbb", marginTop: 4, textAlign: "center" }}>{d.jour}</div>
          </div>
        );
      })}
    </div>
  );
}

function MiniBarChart({ data, color = C.blue, height = 60 }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
            <div style={{ width: "100%", height: `${(d.val / max) * 100}%`, background: d.val > 70 ? C.red : d.val > 45 ? C.amber : color, borderRadius: "2px 2px 0 0", minHeight: 2 }} title={`${d.h} : ${d.val}%`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const segments = data.map(d => {
    const seg = { ...d, dashOffset: offset, dash: (d.pct / 100) * circ };
    offset += seg.dash;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((s, i) => (
        <circle key={i} cx={size/2} cy={size/2} r={r}
          fill="none" stroke={s.color} strokeWidth={10}
          strokeDasharray={`${s.dash} ${circ - s.dash}`}
          strokeDashoffset={-s.dashOffset}
          strokeLinecap="butt" />
      ))}
    </svg>
  );
}

function TauxRemplissage({ taux }) {
  const color = taux >= 85 ? C.green : taux >= 65 ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
      <div style={{ flex: 1, height: 5, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${taux}%`, height: "100%", background: color, borderRadius: 3, transition: "width .4s ease" }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 32, textAlign: "right" }}>{taux}%</span>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export function RapportsAdmin({ setPage }) {
  const [periode, setPeriode] = useState("7j");
  const [section, setSection] = useState("revenus");
  const dataBar = periode === "7j" ? REVENUS_7J : REVENUS_30J;

  const totalRevenus = dataBar.reduce((s, d) => s + d.montant, 0);
  const totalBillets = dataBar.reduce((s, d) => s + d.billets, 0);
  const moyJour      = Math.round(totalRevenus / dataBar.length);
  const variationPct = "+14%"; // simulé

  const sections = [
    { id: "revenus",   label: "Revenus"  },
    { id: "lignes",    label: "Lignes"   },
    { id: "paiements", label: "Paiements"},
    { id: "affluence", label: "Affluence"},
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ background: C.blue, padding: "10px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12 }}>
          <button onClick={() => setPage?.("admin")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Rapports & Analytiques</span>
        </div>
        {/* Sélecteur période */}
        <div style={{ display: "flex", gap: 6, paddingBottom: 12 }}>
          {[["7j","7 jours"],["30j","30 jours"]].map(([id, label]) => (
            <button key={id} onClick={() => setPeriode(id)}
              style={{ padding: "5px 14px", borderRadius: 20, border: `1px solid ${periode === id ? "#fff" : "rgba(255,255,255,0.3)"}`, background: periode === id ? "#fff" : "transparent", color: periode === id ? C.blue : "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: periode === id ? 600 : 400, cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>
        {/* Onglets sections */}
        <div style={{ display: "flex", borderTop: "0.5px solid rgba(255,255,255,0.2)" }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: section === s.id ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: section === s.id ? 600 : 400, cursor: "pointer", borderBottom: `2px solid ${section === s.id ? "#fff" : "transparent"}` }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>

        {/* ── REVENUS ── */}
        {section === "revenus" && (
          <>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "Revenus totaux",    val: `${(totalRevenus/1000000).toFixed(2)} M FCFA`, color: C.blue,   icon: "💰" },
                { label: "Billets vendus",     val: totalBillets.toLocaleString("fr-FR"),           color: C.green,  icon: "🎫" },
                { label: "Revenu moyen/jour",  val: `${(moyJour/1000).toFixed(0)}K FCFA`,           color: C.amber,  icon: "📊" },
                { label: "Variation vs période préc.", val: variationPct,                             color: C.green,  icon: "📈" },
              ].map(k => (
                <div key={k.label} style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{k.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: k.color, marginBottom: 2 }}>{k.val}</div>
                  <div style={{ fontSize: 10, color: "#999" }}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Graphique barres revenus */}
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "14px 14px 6px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>Revenus par jour</div>
                <div style={{ fontSize: 10, color: "#999" }}>en FCFA</div>
              </div>
              <BarChart data={dataBar.slice(-7)} color={C.blue} height={120} />
            </div>

            {/* Top 3 jours */}
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 10 }}>Meilleurs jours</div>
              {[...dataBar].sort((a, b) => b.montant - a.montant).slice(0, 3).map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 2 ? `0.5px solid ${C.border}` : "none" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 11, background: i === 0 ? "#FAEEDA" : i === 1 ? C.blueLt : "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i === 0 ? C.amber : i === 1 ? C.blue : "#999" }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: C.gray }}>{d.jour} {d.date}</div>
                    <div style={{ fontSize: 10, color: "#999" }}>{d.billets} billets vendus</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.blue }}>{(d.montant / 1000).toFixed(0)}K FCFA</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── LIGNES ── */}
        {section === "lignes" && (
          <>
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray, marginBottom: 12 }}>Performance par ligne</div>
              {LIGNES_PERF.map((l, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: i < LIGNES_PERF.length - 1 ? `0.5px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.gray, flex: 1 }}>{l.route}</div>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 12, background: l.variation > 0 ? C.greenLt : C.redLt, color: l.variation > 0 ? C.green : C.red, fontWeight: 600, marginLeft: 8, whiteSpace: "nowrap" }}>
                      {l.variation > 0 ? "+" : ""}{l.variation}%
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: "#999", minWidth: 60 }}>Remplissage</span>
                    <TauxRemplissage taux={l.taux} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "#999" }}>{l.billets} billets · {(l.revenus / 1000000).toFixed(2)} M FCFA</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparatif graphique taux remplissage */}
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 10 }}>Taux de remplissage global</div>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative" }}>
                  <DonutChart data={[
                    { pct: 82, color: C.blue },
                    { pct: 18, color: "#f0f0f0" },
                  ]} size={80} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.blue }}>82%</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>82% moyen</div>
                  <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>Toutes lignes confondues</div>
                  <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>↑ +6 pts vs mois précédent</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── PAIEMENTS ── */}
        {section === "paiements" && (
          <>
            {/* Donut */}
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray, marginBottom: 14 }}>Répartition des paiements</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <DonutChart data={PAIEMENTS_REPARTITION} size={100} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray }}>Total</div>
                    <div style={{ fontSize: 9, color: "#999" }}>13.86M</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {PAIEMENTS_REPARTITION.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, flex: 1, color: C.gray }}>{p.moyen}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.gray }}>{p.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Détail par moyen */}
            {PAIEMENTS_REPARTITION.map((p, i) => (
              <div key={i} style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: p.color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {p.moyen === "Orange Money" ? "🟠" : p.moyen === "MTN Mobile Money" ? "🟡" : p.moyen === "Wave" ? "🔵" : "💳"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.gray }}>{p.moyen}</div>
                  <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>{(p.montant / 1000000).toFixed(2)} M FCFA · {p.pct}% des transactions</div>
                </div>
                <div style={{ height: 28, background: "#f5f5f5", borderRadius: 6, overflow: "hidden", width: 50 }}>
                  <div style={{ width: `${p.pct}%`, height: "100%", background: p.color, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── AFFLUENCE ── */}
        {section === "affluence" && (
          <>
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "14px 14px 10px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>Réservations par heure</div>
                <div style={{ fontSize: 10, color: "#999" }}>% du pic journalier</div>
              </div>
              <MiniBarChart data={HEURES_AFFLUENCE} height={80} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {["05h","","","","09h","","","","13h","","","","17h","","","20h"].map((h, i) => (
                  <span key={i} style={{ fontSize: 8, color: "#bbb", flex: 1, textAlign: "center" }}>{h}</span>
                ))}
              </div>
              {/* Légende couleurs */}
              <div style={{ display: "flex", gap: 10, marginTop: 10, justifyContent: "center" }}>
                {[[C.green,"Normal"],[C.amber,"Modéré"],[C.red,"Pic"]].map(([c,l])=>(
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: 9, color: "#999" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pics d'affluence */}
            <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 10 }}>Créneaux les plus chargés</div>
              {[
                { h: "07h00 – 08h00", pct: 92, label: "Pic matin",   color: C.red   },
                { h: "17h00 – 18h00", pct: 85, label: "Pic soir",    color: C.red   },
                { h: "06h00 – 07h00", pct: 78, label: "Ouverture",   color: C.amber },
                { h: "16h00 – 17h00", pct: 62, label: "Après-midi",  color: C.amber },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: i < 3 ? `0.5px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.gray, minWidth: 90 }}>{c.h}</span>
                  <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${c.pct}%`, height: "100%", background: c.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 10, color: c.color, fontWeight: 600, minWidth: 28 }}>{c.pct}%</span>
                  <span style={{ fontSize: 9, color: "#bbb", minWidth: 60 }}>{c.label}</span>
                </div>
              ))}
            </div>

            {/* Recommandations */}
            <div style={{ background: C.blueLt, border: `0.5px solid #B5D4F4`, borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.blueDk, marginBottom: 8 }}>💡 Recommandations</div>
              {[
                "Ajouter un départ à 07h30 sur la ligne Abidjan→Yamoussoukro (taux 92%)",
                "Proposer une réduction de 15% sur les départs 11h–13h pour équilibrer la charge",
                "Envoyer des notifications push aux voyageurs habituels du 17h pour remplir les cars du soir",
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderTop: i > 0 ? `0.5px dashed #B5D4F4` : "none", fontSize: 11, color: C.blueDk, lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0 }}>→</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bouton export */}
        <button style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, background: C.green, color: C.white, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center", marginTop: 14 }}>
          📥 Exporter en PDF / Excel
        </button>

      </div>
    </div>
  );
}

export default { RapportsAdmin };
