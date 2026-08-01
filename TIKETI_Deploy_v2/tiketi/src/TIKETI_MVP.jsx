import { useState } from "react";

// ─── DONNÉES DE DÉMONSTRATION ────────────────────────────────────────────────
const TRAJETS = [
  { id: 1, depart: "Abidjan", arrivee: "Yamoussoukro", heure: "06:00", duree: "3h30", prix: 3500, places: 32, dispo: 14 },
  { id: 2, depart: "Abidjan", arrivee: "Yamoussoukro", heure: "08:00", duree: "3h45", prix: 3500, places: 32, dispo: 6 },
  { id: 3, depart: "Abidjan", arrivee: "Yamoussoukro", heure: "10:00", duree: "3h30", prix: 3500, places: 32, dispo: 0 },
  { id: 4, depart: "Abidjan", arrivee: "Bouaké",       heure: "07:00", duree: "5h00", prix: 4000, places: 45, dispo: 22 },
  { id: 5, depart: "Abidjan", arrivee: "San Pedro",    heure: "09:00", duree: "4h30", prix: 3800, places: 32, dispo: 18 },
  { id: 6, depart: "Abidjan", arrivee: "Man",          heure: "06:30", duree: "6h00", prix: 5000, places: 32, dispo: 9 },
];

const VILLES = ["Abidjan", "Yamoussoukro", "Bouaké", "San Pedro", "Man", "Korhogo", "Daloa", "Gagnoa"];

const RESERVATIONS_DEMO = [
  { id: "TK-2026-001", voyageur: "Kouamé Yao",   trajet: "Abidjan → Yamoussoukro", heure: "06:00", siege: 14, valide: true  },
  { id: "TK-2026-002", voyageur: "Awa Bamba",     trajet: "Abidjan → Bouaké",       heure: "07:00", siege: 3,  valide: false },
  { id: "TK-2026-003", voyageur: "Diallo Karim",  trajet: "Abidjan → Yamoussoukro", heure: "08:00", siege: 27, valide: true  },
];

// ─── COULEURS & STYLES ───────────────────────────────────────────────────────
const C = {
  blue:    "#185FA5",
  blueLt:  "#E6F1FB",
  blueDk:  "#0C447C",
  green:   "#085041",
  greenLt: "#E1F5EE",
  red:     "#791F1F",
  redLt:   "#FCEBEB",
  amber:   "#633806",
  amberLt: "#FAEEDA",
  gray:    "#4A4A4A",
  border:  "#e0e0e0",
  bg:      "#F5F7FA",
  white:   "#FFFFFF",
};

const s = {
  app:       { fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto", position: "relative" },
  statusBar: { background: C.blue, color: "#fff", padding: "8px 16px", display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 500 },
  navBar:    { background: C.blue, padding: "12px 16px 16px" },
  body:      { padding: "14px 16px" },
  card:      { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 },
  label:     { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: C.gray, marginBottom: 6, display: "block" },
  input:     { width: "100%", padding: "10px 12px", borderRadius: 8, border: `0.5px solid ${C.border}`, fontSize: 13, background: C.white, boxSizing: "border-box", outline: "none" },
  btnPrimary:{ display: "block", width: "100%", padding: "11px", borderRadius: 10, background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center" },
  btnSecond: { display: "block", width: "100%", padding: "10px", borderRadius: 10, background: C.white, color: C.blue, fontSize: 13, fontWeight: 500, border: `1px solid ${C.blue}`, cursor: "pointer", textAlign: "center" },
  bottomNav: { display: "flex", borderTop: `0.5px solid ${C.border}`, background: C.white, position: "sticky", bottom: 0 },
  bnavItem:  { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 4px", gap: 2, cursor: "pointer", border: "none", background: "transparent" },
};

// ─── COMPOSANTS UTILITAIRES ──────────────────────────────────────────────────
function StatusBar() {
  const now = new Date();
  return (
    <div style={s.statusBar}>
      <span>{now.getHours()}:{String(now.getMinutes()).padStart(2,"0")}</span>
      <span>▲ 4G ■</span>
    </div>
  );
}

function BottomNav({ page, setPage, profil }) {
  const itemsVoyageur = [
    { id: "accueil",      icon: "🏠", label: "Accueil" },
    { id: "billets",      icon: "🎫", label: "Mes billets" },
    { id: "suivi",        icon: "📍", label: "Suivi" },
    { id: "profil",       icon: "👤", label: "Profil" },
  ];
  const itemsCtrl = [
    { id: "scanner",      icon: "📷", label: "Scanner" },
    { id: "liste",        icon: "📋", label: "Liste" },
    { id: "rapport",      icon: "📊", label: "Rapport" },
  ];
  const items = profil === "controleur" ? itemsCtrl : itemsVoyageur;
  return (
    <div style={s.bottomNav}>
      {items.map(it => (
        <button key={it.id} style={{ ...s.bnavItem, color: page === it.id ? C.blue : "#999" }} onClick={() => setPage(it.id)}>
          <span style={{ fontSize: 20 }}>{it.icon}</span>
          <span style={{ fontSize: 9 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

function Badge({ children, color = C.blueLt, text = C.blueDk }) {
  return <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: color, color: text, fontWeight: 500, whiteSpace: "nowrap" }}>{children}</span>;
}

// ─── ÉCRAN : ACCUEIL ─────────────────────────────────────────────────────────
function Accueil({ setPage, setTrajetRecherche }) {
  const [depart, setDepart] = useState("Abidjan");
  const [arrivee, setArrivee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [passagers, setPassagers] = useState(1);

  function rechercher() {
    setTrajetRecherche({ depart, arrivee, date, passagers });
    setPage("resultats");
  }

  const populaires = ["Yamoussoukro", "Bouaké", "San Pedro", "Man"];

  return (
    <>
      <StatusBar />
      <div style={{ ...s.navBar, paddingBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>TIKETI</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>🌍 Côte d'Ivoire</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, margin: "0 0 14px" }}>Où voyagez-vous aujourd'hui ?</p>
        <div style={{ background: C.white, borderRadius: 12, padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `0.5px solid ${C.border}` }}>
            <span style={{ color: C.blue, fontSize: 16 }}>📍</span>
            <select value={depart} onChange={e => setDepart(e.target.value)} style={{ ...s.input, border: "none", padding: 0, fontSize: 13, background: "transparent" }}>
              {VILLES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `0.5px solid ${C.border}` }}>
            <span style={{ color: C.green, fontSize: 16 }}>🏁</span>
            <select value={arrivee} onChange={e => setArrivee(e.target.value)} style={{ ...s.input, border: "none", padding: 0, fontSize: 13, background: "transparent" }}>
              <option value="">Ville d'arrivée</option>
              {VILLES.filter(v => v !== depart).map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, paddingTop: 6 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14 }}>📅</span>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...s.input, border: "none", padding: 0, fontSize: 12, background: "transparent" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14 }}>👥</span>
              <button onClick={() => setPassagers(Math.max(1, passagers - 1))} style={{ width: 24, height: 24, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, cursor: "pointer" }}>−</button>
              <span style={{ fontSize: 13, fontWeight: 600, minWidth: 16, textAlign: "center" }}>{passagers}</span>
              <button onClick={() => setPassagers(Math.min(8, passagers + 1))} style={{ width: 24, height: 24, borderRadius: 12, border: `1px solid ${C.border}`, background: C.white, fontSize: 14, cursor: "pointer" }}>+</button>
            </div>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <button style={s.btnPrimary} onClick={rechercher}>Rechercher un trajet</button>

        <p style={{ ...s.label, marginTop: 18 }}>Destinations populaires</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
          {populaires.map(v => (
            <button key={v} onClick={() => { setArrivee(v); setTrajetRecherche({ depart, arrivee: v, date, passagers }); setPage("resultats"); }}
              style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>🚌</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gray }}>{v}</div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 1 }}>Depuis Abidjan</div>
            </button>
          ))}
        </div>

        <p style={s.label}>Dernières réservations</p>
        {RESERVATIONS_DEMO.slice(0, 2).map(r => (
          <div key={r.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gray }}>{r.trajet}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{r.heure} · Siège {r.siege}</div>
            </div>
            <Badge color={C.greenLt} text={C.green}>✓ Valide</Badge>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── ÉCRAN : RÉSULTATS ───────────────────────────────────────────────────────
function Resultats({ setPage, trajetRecherche, setTrajetChoisi }) {
  const filtres = TRAJETS.filter(t =>
    (!trajetRecherche?.depart  || t.depart  === trajetRecherche.depart) &&
    (!trajetRecherche?.arrivee || t.arrivee === trajetRecherche.arrivee)
  );
  const liste = filtres.length > 0 ? filtres : TRAJETS;

  return (
    <>
      <StatusBar />
      <div style={{ ...s.navBar, paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button onClick={() => setPage("accueil")} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {trajetRecherche?.depart || "Abidjan"} → {trajetRecherche?.arrivee || "Yamoussoukro"}
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
              {trajetRecherche?.date ? new Date(trajetRecherche.date).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"short" }) : "Aujourd'hui"} · {trajetRecherche?.passagers || 1} passager(s)
            </div>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <p style={s.label}>{liste.length} trajet(s) disponible(s)</p>
        {liste.map(t => (
          <div key={t.id} style={{ ...s.card, opacity: t.dispo === 0 ? 0.5 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.gray }}>{t.heure}</div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>Durée : {t.duree}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{t.prix.toLocaleString("fr-FR")} F</div>
                <div style={{ fontSize: 10, color: "#999" }}>par personne</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {t.dispo === 0
                ? <Badge color={C.redLt} text={C.red}>Complet</Badge>
                : t.dispo < 10
                ? <Badge color={C.amberLt} text={C.amber}>⚠ {t.dispo} places restantes</Badge>
                : <Badge color={C.greenLt} text={C.green}>{t.dispo} places dispo</Badge>
              }
              <Badge>Direct</Badge>
            </div>
            {t.dispo > 0 && (
              <button style={s.btnPrimary} onClick={() => { setTrajetChoisi(t); setPage("sieges"); }}>
                Choisir ce départ
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ─── ÉCRAN : SÉLECTION DES SIÈGES ────────────────────────────────────────────
function Sieges({ setPage, trajetChoisi, setReservation }) {
  const nbPlaces = trajetChoisi?.places || 32;
  // Sièges occupés aléatoires (fixes pour la démo)
  const occupes = new Set([2, 5, 8, 11, 15, 19, 23, 26, 29]);
  const [selectionnes, setSelectionnes] = useState([]);

  function toggleSiege(n) {
    if (occupes.has(n)) return;
    setSelectionnes(prev =>
      prev.includes(n) ? prev.filter(s => s !== n) : [...prev, n].slice(-2)
    );
  }

  function confirmer() {
    setReservation({ trajet: trajetChoisi, sieges: selectionnes });
    setPage("paiement");
  }

  const total = selectionnes.length * (trajetChoisi?.prix || 3500);

  // Disposition : 2 sièges côté fenêtre gauche + 2 côté fenêtre droite, avec couloir au milieu
  // En CI, numérotation de 1 à n
  const rangs = [];
  let num = 1;
  const nbRangs = Math.ceil(nbPlaces / 4);
  for (let r = 0; r < nbRangs; r++) {
    rangs.push([num, num+1, num+2, num+3].filter(n => n <= nbPlaces));
    num += 4;
  }

  return (
    <>
      <StatusBar />
      <div style={{ ...s.navBar, paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setPage("resultats")} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
          <div>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Choisir votre siège</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{trajetChoisi?.depart} → {trajetChoisi?.arrivee} · {trajetChoisi?.heure}</div>
          </div>
        </div>
      </div>

      <div style={s.body}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {[
            { color: C.blueLt, border: "#B5D4F4", label: "Libre" },
            { color: C.blue,   border: C.blue,    label: "Sélectionné", text: "#fff" },
            { color: "#f0f0f0",border: "#ddd",    label: "Occupé" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color, border: `0.5px solid ${l.border}` }} />
              <span style={{ fontSize: 10, color: C.gray }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 10px", marginBottom: 12, overflowY: "auto", maxHeight: 340 }}>
          <div style={{ textAlign: "center", fontSize: 10, color: "#999", marginBottom: 10, padding: "4px 0", background: C.blueLt, borderRadius: 6, color: C.blueDk, fontWeight: 500 }}>
            🚌 CONDUCTEUR
          </div>
          {/* En-têtes colonnes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 16px 1fr 1fr", gap: 4, marginBottom: 6 }}>
            {["G1","G2","","D1","D2"].map((h,i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#bbb" }}>{h}</div>
            ))}
          </div>
          {rangs.map((rang, ri) => (
            <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 16px 1fr 1fr", gap: 4, marginBottom: 4 }}>
              {[rang[0], rang[1], null, rang[2], rang[3]].map((n, ci) => {
                if (n === null) return <div key={ci} />;
                if (n === undefined) return <div key={ci} />;
                const isOccupe   = occupes.has(n);
                const isSelected = selectionnes.includes(n);
                return (
                  <button key={n} onClick={() => toggleSiege(n)}
                    style={{
                      height: 32, borderRadius: 5, border: "none", cursor: isOccupe ? "default" : "pointer",
                      background: isSelected ? C.blue : isOccupe ? "#f0f0f0" : C.blueLt,
                      color:      isSelected ? "#fff"  : isOccupe ? "#ccc"    : C.blueDk,
                      fontSize: 10, fontWeight: 600,
                    }}>
                    {n}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {selectionnes.length > 0 && (
          <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>Siège(s) : {selectionnes.sort((a,b)=>a-b).join(", ")}</div>
              <div style={{ fontSize: 11, color: "#999" }}>{selectionnes.length} siège(s) sélectionné(s)</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.blue }}>{total.toLocaleString("fr-FR")} F</div>
          </div>
        )}

        <button style={{ ...s.btnPrimary, opacity: selectionnes.length === 0 ? 0.4 : 1 }}
          onClick={confirmer} disabled={selectionnes.length === 0}>
          Confirmer et payer
        </button>
      </div>
    </>
  );
}

// ─── ÉCRAN : PAIEMENT ────────────────────────────────────────────────────────
function Paiement({ setPage, reservation, setPage: goTo }) {
  const [methode, setMethode] = useState("orange");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);

  const montant = (reservation?.sieges?.length || 1) * (reservation?.trajet?.prix || 3500);

  const methodes = [
    { id: "orange", label: "Orange Money", icon: "🟠" },
    { id: "mtn",    label: "MTN Mobile Money", icon: "🟡" },
    { id: "wave",   label: "Wave", icon: "🔵" },
    { id: "carte",  label: "Carte bancaire", icon: "💳" },
  ];

  function payer() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setPage("billet"); }, 1800);
  }

  return (
    <>
      <StatusBar />
      <div style={{ ...s.navBar, paddingBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setPage("sieges")} style={{ background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", padding: 0 }}>←</button>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Paiement</div>
        </div>
      </div>

      <div style={s.body}>
        <div style={{ ...s.card, background: C.blueLt, border: `1px solid #B5D4F4`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, color: C.blueDk, fontWeight: 600 }}>{reservation?.trajet?.depart} → {reservation?.trajet?.arrivee}</div>
              <div style={{ fontSize: 11, color: C.blue, marginTop: 2 }}>{reservation?.trajet?.heure} · Siège(s) {reservation?.sieges?.join(", ")}</div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.blueDk }}>{montant.toLocaleString("fr-FR")} F</div>
          </div>
        </div>

        <p style={s.label}>Mode de paiement</p>
        {methodes.map(m => (
          <button key={m.id} onClick={() => setMethode(m.id)}
            style={{ ...s.card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer", border: `${methode === m.id ? "2px" : "0.5px"} solid ${methode === m.id ? C.blue : C.border}`, marginBottom: 8 }}>
            <span style={{ fontSize: 22 }}>{m.icon}</span>
            <span style={{ fontSize: 13, fontWeight: methode === m.id ? 600 : 400, color: C.gray }}>{m.label}</span>
            <span style={{ marginLeft: "auto", fontSize: 16, color: C.blue }}>{methode === m.id ? "●" : "○"}</span>
          </button>
        ))}

        {methode !== "carte" && (
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Numéro {methodes.find(m=>m.id===methode)?.label}</label>
            <input style={s.input} type="tel" placeholder="07 00 00 00 00" value={numero} onChange={e => setNumero(e.target.value)} />
          </div>
        )}

        {methode === "carte" && (
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Numéro de carte</label>
            <input style={{ ...s.input, marginBottom: 8 }} type="text" placeholder="1234 5678 9012 3456" />
            <div style={{ display: "flex", gap: 8 }}>
              <input style={s.input} type="text" placeholder="MM/AA" />
              <input style={s.input} type="text" placeholder="CVV" />
            </div>
          </div>
        )}

        <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={payer} disabled={loading}>
          {loading ? "Traitement en cours…" : `Payer ${montant.toLocaleString("fr-FR")} FCFA`}
        </button>
        <div style={{ textAlign: "center", fontSize: 10, color: "#999", marginTop: 10 }}>
          🔒 Paiement sécurisé SSL — vos données sont protégées
        </div>
      </div>
    </>
  );
}

// ─── ÉCRAN : BILLET QR CODE ──────────────────────────────────────────────────
function Billet({ setPage, reservation }) {
  const id = "TK-" + Math.random().toString(36).slice(2,8).toUpperCase();

  return (
    <>
      <StatusBar />
      <div style={{ background: C.green, padding: "14px 16px 18px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 50, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: 24 }}>✓</div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Réservation confirmée</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 3 }}>Votre billet est prêt</div>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.card}>
          {/* QR Code SVG simulé */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <svg width="140" height="140" viewBox="0 0 140 140" style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 6, background: "#fff" }}>
              {/* Coin haut-gauche */}
              <rect x="8" y="8" width="42" height="42" fill="none" stroke={C.blue} strokeWidth="3"/>
              <rect x="14" y="14" width="30" height="30" fill={C.blue}/>
              {/* Coin haut-droite */}
              <rect x="90" y="8" width="42" height="42" fill="none" stroke={C.blue} strokeWidth="3"/>
              <rect x="96" y="14" width="30" height="30" fill={C.blue}/>
              {/* Coin bas-gauche */}
              <rect x="8" y="90" width="42" height="42" fill="none" stroke={C.blue} strokeWidth="3"/>
              <rect x="14" y="96" width="30" height="30" fill={C.blue}/>
              {/* Données centrales */}
              {[60,68,76,84,92,100,108].map((x,i) =>
                [60,68,76,84,92,100,108].map((y,j) =>
                  (i+j)%2===0 ? <rect key={`${i}-${j}`} x={x} y={y} width="6" height="6" fill={C.blue}/> : null
                )
              )}
              {/* Texte TIKETI */}
              <text x="70" y="132" textAnchor="middle" fontSize="9" fill={C.gray} fontWeight="600">TIKETI</text>
            </svg>
            <div style={{ fontSize: 10, color: "#999", marginTop: 4, fontFamily: "monospace" }}>{id}</div>
          </div>

          <div style={{ borderTop: `0.5px dashed ${C.border}`, paddingTop: 12 }}>
            {[
              ["Trajet",   `${reservation?.trajet?.depart} → ${reservation?.trajet?.arrivee}`],
              ["Date",     "Lun 1 août 2026"],
              ["Départ",   reservation?.trajet?.heure || "06:00"],
              ["Siège(s)", reservation?.sieges?.join(", ") || "14"],
              ["Passager", "Dia K."],
              ["Montant",  `${((reservation?.sieges?.length||1)*(reservation?.trajet?.prix||3500)).toLocaleString("fr-FR")} FCFA`],
            ].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `0.5px dashed ${C.border}` }}>
                <span style={{ fontSize: 11, color: "#999" }}>{k}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: k === "Montant" ? C.blue : C.gray }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button style={s.btnSecond}>📤 Partager</button>
          <button style={s.btnSecond}>⬇ Télécharger</button>
        </div>
        <div style={{ ...s.card, background: C.blueLt, border: `0.5px solid #B5D4F4`, fontSize: 11, color: C.blueDk, textAlign: "center" }}>
          📵 Ce billet est consultable hors connexion
        </div>
      </div>
    </>
  );
}

// ─── ÉCRAN : MES BILLETS ─────────────────────────────────────────────────────
function MesBillets({ setPage }) {
  return (
    <>
      <StatusBar />
      <div style={s.navBar}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Mes billets</div>
      </div>
      <div style={s.body}>
        <p style={s.label}>Billets actifs</p>
        {RESERVATIONS_DEMO.filter(r => r.valide).map(r => (
          <div key={r.id} style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>{r.trajet}</div>
              <Badge color={C.greenLt} text={C.green}>Valide</Badge>
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>{r.heure} · Siège {r.siege} · {r.id}</div>
            <button style={{ ...s.btnPrimary, marginTop: 10, padding: 8, fontSize: 12 }}>Voir le billet QR</button>
          </div>
        ))}

        <p style={{ ...s.label, marginTop: 14 }}>Historique</p>
        {RESERVATIONS_DEMO.filter(r => !r.valide).map(r => (
          <div key={r.id} style={{ ...s.card, opacity: 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>{r.trajet}</div>
              <Badge color={C.redLt} text={C.red}>Expiré</Badge>
            </div>
            <div style={{ fontSize: 11, color: "#999" }}>{r.heure} · Siège {r.siege}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── ÉCRAN : SUIVI GPS ───────────────────────────────────────────────────────
function Suivi() {
  const [eta, setEta] = useState(47);
  return (
    <>
      <StatusBar />
      <div style={s.navBar}>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Suivi du car en direct</div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>Abidjan → Yamoussoukro · Départ 06:00</div>
      </div>
      <div style={s.body}>
        {/* Carte simulée */}
        <div style={{ height: 200, background: "#e8f0e0", borderRadius: 12, marginBottom: 14, overflow: "hidden", position: "relative", border: `0.5px solid ${C.border}` }}>
          <svg width="100%" height="100%" viewBox="0 0 360 200">
            {/* Route simulée */}
            <polyline points="20,150 80,120 140,100 200,90 260,85 340,80" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
            <polyline points="20,150 80,120 140,100 200,90 260,85 340,80" fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeDasharray="6,3"/>
            {/* Villes */}
            <circle cx="20"  cy="150" r="5" fill={C.blue}/>
            <text x="25" y="165" fontSize="9" fill={C.gray}>Abidjan</text>
            <circle cx="340" cy="80"  r="5" fill={C.green}/>
            <text x="300" y="95" fontSize="9" fill={C.green}>Yamoussoukro</text>
            {/* Bus */}
            <g transform="translate(190,85)">
              <rect x="-12" y="-8" width="24" height="16" rx="3" fill={C.blue}/>
              <text x="0" y="5" textAnchor="middle" fontSize="10" fill="#fff">🚌</text>
            </g>
            {/* Points intermédiaires */}
            <circle cx="80"  cy="120" r="3" fill="#aaa"/>
            <circle cx="140" cy="100" r="3" fill="#aaa"/>
            <circle cx="260" cy="85"  r="3" fill="#aaa"/>
          </svg>
          <div style={{ position: "absolute", top: 8, right: 8, background: C.blue, color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600 }}>
            ● En direct
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div style={{ ...s.card, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.blue }}>{eta} min</div>
            <div style={{ fontSize: 10, color: "#999" }}>Arrivée estimée</div>
          </div>
          <div style={{ ...s.card, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>87 km</div>
            <div style={{ fontSize: 10, color: "#999" }}>Distance restante</div>
          </div>
        </div>

        <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Arrivée prévue à 09h47</div>
            <div style={{ fontSize: 11, color: "#999" }}>17 min de retard — trafic à Toumodi</div>
          </div>
          <Badge color={C.amberLt} text={C.amber}>Retard</Badge>
        </div>

        <button style={{ ...s.btnSecond, marginTop: 10 }} onClick={() => setEta(eta - 1)}>
          🔄 Actualiser la position
        </button>
      </div>
    </>
  );
}

// ─── ÉCRAN : CONTROLEUR ──────────────────────────────────────────────────────
function Controleur({ setPage }) {
  const [scan, setScan] = useState(null); // null | "ok" | "fraude"
  const [valides, setValides] = useState(18);

  function simulerScan(resultat) {
    setScan(resultat);
    if (resultat === "ok") setValides(v => v + 1);
  }

  return (
    <>
      <div style={{ ...s.statusBar, background: C.green }}><span>10:12</span><span>▲ 4G ■</span></div>
      <div style={{ background: C.green, padding: "12px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Contrôle TIKETI</span>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Ligne 04</span>
        </div>
        <div style={{ marginTop: 8, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#fff" }}>
          🚌 Abidjan → Yamoussoukro · 06:00
        </div>
      </div>

      <div style={s.body}>
        {/* Zone de scan simulée */}
        {!scan ? (
          <>
            <div style={{ height: 160, border: `2px dashed ${C.border}`, borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14, background: "#fafafa" }}>
              <span style={{ fontSize: 48 }}>📷</span>
              <span style={{ fontSize: 12, color: "#999" }}>Pointez sur le QR code du voyageur</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div style={{ ...s.card, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{valides}</div>
                <div style={{ fontSize: 10, color: "#999" }}>Validés</div>
              </div>
              <div style={{ ...s.card, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.red }}>{32 - valides}</div>
                <div style={{ fontSize: 10, color: "#999" }}>Restants</div>
              </div>
            </div>
            <button style={{ ...s.btnPrimary, background: C.green, marginBottom: 8 }} onClick={() => simulerScan("ok")}>
              📷 Simuler scan — Billet valide
            </button>
            <button style={{ ...s.btnSecond, borderColor: C.red, color: C.red }} onClick={() => simulerScan("fraude")}>
              ⚠ Simuler scan — Billet invalide
            </button>
          </>
        ) : (
          <>
            <div style={{ background: scan === "ok" ? C.green : C.red, borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 6 }}>{scan === "ok" ? "✅" : "❌"}</div>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{scan === "ok" ? "Billet valide" : "Billet invalide"}</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 }}>
                {scan === "ok" ? "Accès autorisé" : "Refuser l'embarquement"}
              </div>
            </div>
            {scan === "ok" && (
              <div style={{ ...s.card, marginBottom: 12 }}>
                {[["Passager","Kouamé Yao"],["Siège","14"],["Trajet","ABJ → YMK"],["Départ","06:00"]].map(([k,v])=>(
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0", borderBottom:`0.5px solid ${C.border}` }}>
                    <span style={{ fontSize:11, color:"#999" }}>{k}</span>
                    <span style={{ fontSize:11, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
            <button style={{ ...s.btnPrimary, background: C.green, marginBottom: 8 }} onClick={() => setScan(null)}>
              Scanner le suivant
            </button>
            <button style={s.btnSecond} onClick={() => setScan(null)}>Signaler un problème</button>
          </>
        )}
      </div>
    </>
  );
}

// ─── ÉCRAN : ADMIN ───────────────────────────────────────────────────────────
function Admin() {
  const [section, setSection] = useState("dashboard");
  const menus = [
    { id: "dashboard", icon: "📊", label: "Tableau de bord" },
    { id: "lignes",    icon: "🗺",  label: "Lignes" },
    { id: "billets",   icon: "🎫", label: "Réservations" },
  ];
  return (
    <>
      <div style={{ background: C.blue, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>TIKETI Admin</span>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>🔔 Admin</span>
      </div>
      <div style={{ display: "flex", borderBottom: `0.5px solid ${C.border}`, background: C.white, overflowX: "auto" }}>
        {menus.map(m => (
          <button key={m.id} onClick={() => setSection(m.id)}
            style={{ padding: "10px 14px", border: "none", background: "transparent", cursor: "pointer", whiteSpace: "nowrap",
              borderBottom: section === m.id ? `2px solid ${C.blue}` : "2px solid transparent",
              color: section === m.id ? C.blue : "#999", fontSize: 12, fontWeight: section === m.id ? 600 : 400 }}>
            {m.icon} {m.label}
          </button>
        ))}
      </div>
      <div style={s.body}>
        {section === "dashboard" && (
          <>
            <p style={s.label}>Aujourd'hui — 1 août 2026</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[["124","Billets vendus",C.blue],["433 500 F","Recettes",C.green],["8","Départs",C.gray],["3","Annulations",C.red]]
                .map(([v,l,c]) => (
                  <div key={l} style={{ background: C.white, border:`0.5px solid ${C.border}`, borderRadius:10, padding:"10px 12px" }}>
                    <div style={{ fontSize:18, fontWeight:700, color:c }}>{v}</div>
                    <div style={{ fontSize:10, color:"#999", marginTop:2 }}>{l}</div>
                  </div>
                ))}
            </div>
            <p style={s.label}>Départs du jour</p>
            {[
              { route:"ABJ → YMK", heure:"06:00", places:32, dispo:0,  status:"Complet" },
              { route:"ABJ → BKE", heure:"07:00", places:45, dispo:21, status:"En cours" },
              { route:"ABJ → SPD", heure:"09:00", places:32, dispo:26, status:"Faible" },
            ].map(t => (
              <div key={t.heure} style={{ ...s.card, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{t.route}</div>
                  <div style={{ fontSize:11, color:"#999" }}>{t.heure} · {t.places - t.dispo}/{t.places} places</div>
                </div>
                <Badge color={t.dispo===0?C.greenLt:t.dispo<10?C.amberLt:C.redLt} text={t.dispo===0?C.green:t.dispo<10?C.amber:C.red}>
                  {t.status}
                </Badge>
              </div>
            ))}
          </>
        )}
        {section === "lignes" && (
          <>
            <p style={s.label}>Lignes actives</p>
            {[["Abidjan","Yamoussoukro","3 500 F","3h30"],["Abidjan","Bouaké","4 000 F","5h00"],["Abidjan","San Pedro","3 800 F","4h30"],["Abidjan","Man","5 000 F","6h00"]]
              .map(([d,a,p,dur]) => (
                <div key={a} style={{ ...s.card, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{d} → {a}</div>
                    <div style={{ fontSize:11, color:"#999" }}>{dur} · {p}</div>
                  </div>
                  <button style={{ fontSize:11, padding:"4px 10px", borderRadius:6, border:`0.5px solid ${C.border}`, background:C.white, cursor:"pointer", color:C.blue }}>Éditer</button>
                </div>
              ))}
            <button style={{ ...s.btnPrimary, marginTop:6 }}>+ Ajouter une ligne</button>
          </>
        )}
        {section === "billets" && (
          <>
            <p style={s.label}>Dernières réservations</p>
            {RESERVATIONS_DEMO.map(r => (
              <div key={r.id} style={s.card}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{r.voyageur}</div>
                  <Badge color={r.valide?C.greenLt:C.redLt} text={r.valide?C.green:C.red}>{r.valide?"Valide":"Expiré"}</Badge>
                </div>
                <div style={{ fontSize:11, color:"#999" }}>{r.trajet} · {r.heure} · Siège {r.siege}</div>
                <div style={{ fontSize:10, color:"#bbb", marginTop:2, fontFamily:"monospace" }}>{r.id}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}

// ─── SÉLECTEUR DE PROFIL ─────────────────────────────────────────────────────
function SelecteurProfil({ setProfil }) {
  return (
    <div style={{ padding: "24px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.blue, letterSpacing: 2 }}>TIKETI</div>
        <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Application de billetterie — Côte d'Ivoire</div>
      </div>
      <p style={{ ...s.label, textAlign: "center", marginBottom: 14 }}>Choisir un profil pour la démo</p>
      {[
        { id: "voyageur",    icon: "🧳", label: "Voyageur",    desc: "Recherche, réservation et QR code", color: C.blue },
        { id: "controleur",  icon: "🎫", label: "Contrôleur",  desc: "Scan et validation des billets",    color: C.green },
        { id: "admin",       icon: "⚙️",  label: "Administrateur", desc: "Back-office et gestion",        color: C.blueDk },
      ].map(p => (
        <button key={p.id} onClick={() => setProfil(p.id)}
          style={{ ...s.card, display:"flex", alignItems:"center", gap:14, cursor:"pointer", width:"100%", textAlign:"left", marginBottom:10, border:`0.5px solid ${C.border}` }}>
          <div style={{ width:44, height:44, borderRadius:22, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
            {p.icon}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.gray }}>{p.label}</div>
            <div style={{ fontSize:11, color:"#999", marginTop:2 }}>{p.desc}</div>
          </div>
          <span style={{ marginLeft:"auto", color:p.color, fontSize:18 }}>›</span>
        </button>
      ))}
    </div>
  );
}

// ─── APPLICATION PRINCIPALE ──────────────────────────────────────────────────
export default function TIKETI() {
  const [profil, setProfil] = useState(null);
  const [page, setPage] = useState("accueil");
  const [trajetRecherche, setTrajetRecherche] = useState(null);
  const [trajetChoisi, setTrajetChoisi] = useState(null);
  const [reservation, setReservation] = useState(null);

  if (!profil) return (
    <div style={s.app}>
      <SelecteurProfil setProfil={p => { setProfil(p); setPage(p === "controleur" ? "scanner" : p === "admin" ? "admin" : "accueil"); }} />
    </div>
  );

  function renderPage() {
    if (profil === "controleur") return <Controleur setPage={setPage} />;
    if (profil === "admin")      return <Admin />;
    switch(page) {
      case "accueil":  return <Accueil setPage={setPage} setTrajetRecherche={setTrajetRecherche} />;
      case "resultats":return <Resultats setPage={setPage} trajetRecherche={trajetRecherche} setTrajetChoisi={setTrajetChoisi} />;
      case "sieges":   return <Sieges setPage={setPage} trajetChoisi={trajetChoisi} setReservation={setReservation} />;
      case "paiement": return <Paiement setPage={setPage} reservation={reservation} />;
      case "billet":   return <Billet setPage={setPage} reservation={reservation} />;
      case "billets":  return <MesBillets setPage={setPage} />;
      case "suivi":    return <Suivi />;
      default:         return <Accueil setPage={setPage} setTrajetRecherche={setTrajetRecherche} />;
    }
  }

  return (
    <div style={s.app}>
      <div style={{ position:"absolute", top:6, right:8, zIndex:10 }}>
        <button onClick={() => { setProfil(null); setPage("accueil"); }}
          style={{ fontSize:10, padding:"3px 8px", borderRadius:10, border:`0.5px solid ${C.border}`, background:C.white, cursor:"pointer", color:"#999" }}>
          ← Changer de profil
        </button>
      </div>
      {renderPage()}
      {profil === "voyageur" && !["paiement","billet"].includes(page) && (
        <BottomNav page={page} setPage={setPage} profil={profil} />
      )}
    </div>
  );
}
