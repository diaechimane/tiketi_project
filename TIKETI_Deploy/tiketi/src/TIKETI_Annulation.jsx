/**
 * TIKETI — Module Annulation & Remboursement
 * ────────────────────────────────────────────
 * Intégration dans TIKETI_MVP.jsx :
 *
 * 1. import { Annulation, HistoriqueRemboursements } from './TIKETI_Annulation';
 * 2. Dans MesBillets, ajoutez un bouton "Annuler" sur chaque billet actif
 * 3. onClick → setPage("annulation") + setReservationAnnuler(reservation)
 * 4. Ajoutez les cases "annulation" et "remboursements" dans votre routeur
 */

import { useState } from "react";

// ─── COULEURS ────────────────────────────────────────────────────────────────
const C = {
  blue:    "#185FA5", blueLt:  "#E6F1FB", blueDk:  "#0C447C",
  green:   "#085041", greenLt: "#E1F5EE",
  red:     "#791F1F", redLt:   "#FCEBEB",
  amber:   "#633806", amberLt: "#FAEEDA",
  gray:    "#4A4A4A", border:  "#e0e0e0",
  bg:      "#F5F7FA", white:   "#FFFFFF",
};

const s = {
  app:        { fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" },
  body:       { padding: "14px 16px" },
  card:       { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 },
  label:      { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#aaa", display: "block", marginBottom: 6 },
  btnPrimary: { display: "block", width: "100%", padding: 12, borderRadius: 10, background: C.blue, color: C.white, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center" },
  btnDanger:  { display: "block", width: "100%", padding: 12, borderRadius: 10, background: C.red,  color: C.white, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center" },
  btnGhost:   { display: "block", width: "100%", padding: 11, borderRadius: 10, background: C.white, color: C.gray, fontSize: 13, border: `0.5px solid ${C.border}`, cursor: "pointer", textAlign: "center" },
};

// ─── POLITIQUE DE REMBOURSEMENT ───────────────────────────────────────────────
const POLITIQUE = [
  { delai: "> 48h avant le départ",    taux: 100, couleur: C.green,   bg: C.greenLt, label: "Remboursement intégral" },
  { delai: "24h – 48h avant le départ",taux: 75,  couleur: C.blue,    bg: C.blueLt,  label: "75 % remboursés" },
  { delai: "6h – 24h avant le départ", taux: 50,  couleur: C.amber,   bg: C.amberLt, label: "50 % remboursés" },
  { delai: "< 6h avant le départ",     taux: 0,   couleur: C.red,     bg: C.redLt,   label: "Non remboursable" },
];

// ─── DONNÉES DE DÉMONSTRATION ─────────────────────────────────────────────────
const RESERVATIONS_DEMO = [
  {
    id: "TK-2026-A7X", trajet: "Abidjan → Yamoussoukro", heure: "06:00",
    date: "Lun 4 août 2026", sieges: [14], montant: 3500,
    paiement: "Orange Money", heuresAvant: 52,
  },
  {
    id: "TK-2026-B3Y", trajet: "Abidjan → Bouaké", heure: "07:00",
    date: "Mar 5 août 2026", sieges: [3, 4], montant: 8000,
    paiement: "MTN Mobile Money", heuresAvant: 30,
  },
  {
    id: "TK-2026-C1Z", trajet: "Abidjan → San Pedro", heure: "09:00",
    date: "Mer 6 août 2026", sieges: [22], montant: 3800,
    paiement: "Wave", heuresAvant: 4,
  },
];

const REMBOURSEMENTS_DEMO = [
  {
    id: "RMB-001", ref: "TK-2026-X8A", trajet: "Abidjan → Man",
    montantPaye: 5000, montantRembourse: 5000, taux: 100,
    statut: "versé", date: "28 juillet 2026", moyen: "Orange Money",
  },
  {
    id: "RMB-002", ref: "TK-2026-Y5B", trajet: "Abidjan → Korhogo",
    montantPaye: 6500, montantRembourse: 4875, taux: 75,
    statut: "en cours", date: "30 juillet 2026", moyen: "MTN Mobile Money",
  },
];

// ─── CALCUL DU REMBOURSEMENT ──────────────────────────────────────────────────
function calculerRemboursement(heuresAvant, montant) {
  if (heuresAvant > 48) return { taux: 100, montant, tranche: POLITIQUE[0] };
  if (heuresAvant > 24) return { taux: 75,  montant: Math.round(montant * 0.75), tranche: POLITIQUE[1] };
  if (heuresAvant > 6)  return { taux: 50,  montant: Math.round(montant * 0.5),  tranche: POLITIQUE[2] };
  return                       { taux: 0,   montant: 0,                           tranche: POLITIQUE[3] };
}

// ─── ÉCRAN PRINCIPAL : ANNULATION ────────────────────────────────────────────
export function Annulation({ setPage, reservation: resoProp }) {
  const [etape,        setEtape]        = useState("choix");    // choix | confirmation | succes
  const [raison,       setRaison]       = useState("");
  const [raisonCustom, setRaisonCustom] = useState("");
  const [loading,      setLoading]      = useState(false);
  const [resoSelectee, setResoSelectee] = useState(resoProp || null);

  const reso  = resoSelectee;
  const remb  = reso ? calculerRemboursement(reso.heuresAvant, reso.montant) : null;

  const raisons = [
    "Changement de programme",
    "Problème de santé",
    "Billet en double",
    "Retard de la compagnie",
    "Autre raison",
  ];

  function confirmerAnnulation() {
    setLoading(true);
    setTimeout(() => { setLoading(false); setEtape("succes"); }, 1500);
  }

  // ── Sélection du billet (si pas de billet pré-sélectionné) ──
  if (!reso) return (
    <div style={s.app}>
      <NavBar titre="Annuler un billet" onBack={() => setPage?.("billets")} />
      <div style={s.body}>
        <p style={s.label}>Choisissez le billet à annuler</p>
        {RESERVATIONS_DEMO.map(r => {
          const rb = calculerRemboursement(r.heuresAvant, r.montant);
          return (
            <div key={r.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => setResoSelectee(r)}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>{r.trajet}</div>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "#bbb" }}>{r.id}</span>
              </div>
              <div style={{ fontSize: 11, color: "#999", marginBottom: 8 }}>{r.date} · {r.heure} · Siège(s) {r.sieges.join(", ")}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.gray }}>{r.montant.toLocaleString("fr-FR")} FCFA</span>
                <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: rb.tranche.bg, color: rb.tranche.couleur, fontWeight: 500 }}>
                  Remb. {rb.taux}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Étape succès ──────────────────────────────────────────────
  if (etape === "succes") return (
    <div style={s.app}>
      <div style={{ background: remb.taux > 0 ? C.green : C.red, padding: "32px 20px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 10 }}>{remb.taux > 0 ? "✅" : "❌"}</div>
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Annulation confirmée</div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{reso.id}</div>
      </div>
      <div style={s.body}>
        <div style={{ ...s.card, marginBottom: 14 }}>
          {[
            ["Trajet annulé", reso.trajet],
            ["Date", `${reso.date} · ${reso.heure}`],
            ["Siège(s)", reso.sieges.join(", ")],
            ["Montant payé", `${reso.montant.toLocaleString("fr-FR")} FCFA`],
            ["Remboursement", `${remb.montant.toLocaleString("fr-FR")} FCFA (${remb.taux}%)`],
            ["Moyen de paiement", reso.paiement],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `0.5px dashed ${C.border}` }}>
              <span style={{ fontSize: 11, color: "#999" }}>{k}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: k === "Remboursement" ? (remb.taux > 0 ? C.green : C.red) : C.gray }}>{v}</span>
            </div>
          ))}
        </div>

        {remb.taux > 0 ? (
          <div style={{ background: C.greenLt, border: `0.5px solid #9FE1CB`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.green, marginBottom: 4 }}>
              💸 Remboursement de {remb.montant.toLocaleString("fr-FR")} FCFA en cours
            </div>
            <div style={{ fontSize: 11, color: C.green, lineHeight: 1.5 }}>
              Le montant sera crédité sur votre {reso.paiement} dans un délai de 24 à 72 heures ouvrables.
            </div>
          </div>
        ) : (
          <div style={{ background: C.redLt, border: `0.5px solid #F7C1C1`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.red, marginBottom: 4 }}>
              ⚠ Aucun remboursement
            </div>
            <div style={{ fontSize: 11, color: C.red, lineHeight: 1.5 }}>
              L'annulation intervient moins de 6h avant le départ. Conformément à la politique TIKETI, aucun remboursement n'est possible.
            </div>
          </div>
        )}

        <button style={s.btnPrimary} onClick={() => setPage?.("billets")}>Retour à mes billets</button>
        <button style={{ ...s.btnGhost, marginTop: 8 }} onClick={() => setPage?.("accueil")}>Réserver un nouveau trajet</button>
      </div>
    </div>
  );

  // ── Étape confirmation ────────────────────────────────────────
  if (etape === "confirmation") return (
    <div style={s.app}>
      <NavBar titre="Confirmer l'annulation" onBack={() => setEtape("choix")} />
      <div style={s.body}>

        {/* Récapitulatif billet */}
        <p style={s.label}>Billet concerné</p>
        <div style={{ ...s.card, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.gray, marginBottom: 4 }}>{reso.trajet}</div>
          <div style={{ fontSize: 11, color: "#999" }}>{reso.date} · {reso.heure} · Siège(s) {reso.sieges.join(", ")}</div>
        </div>

        {/* Montant remboursé */}
        <div style={{ background: remb.tranche.bg, border: `0.5px solid ${remb.tranche.couleur}22`, borderRadius: 12, padding: "14px", marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: remb.tranche.couleur, marginBottom: 4 }}>{remb.tranche.label}</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: remb.tranche.couleur }}>
            {remb.montant.toLocaleString("fr-FR")} FCFA
          </div>
          <div style={{ fontSize: 11, color: remb.tranche.couleur, marginTop: 4, opacity: 0.8 }}>
            sur {reso.montant.toLocaleString("fr-FR")} FCFA payés · {remb.taux}%
          </div>
          {remb.taux > 0 && (
            <div style={{ fontSize: 10, color: remb.tranche.couleur, marginTop: 6, opacity: 0.7 }}>
              Remboursement sur {reso.paiement} sous 24–72h
            </div>
          )}
        </div>

        {/* Raison */}
        <p style={s.label}>Raison de l'annulation</p>
        <div style={{ ...s.card, marginBottom: 14 }}>
          <p style={{ fontSize: 12, color: C.gray, fontStyle: "italic" }}>
            "{raison === "Autre raison" ? raisonCustom : raison}"
          </p>
        </div>

        {/* Avertissement final */}
        <div style={{ background: C.redLt, border: `0.5px solid #F7C1C1`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 11, color: C.red, lineHeight: 1.5 }}>
          ⚠ Cette action est <strong>irréversible</strong>. Le billet {reso.id} sera définitivement annulé.
        </div>

        <button style={{ ...s.btnDanger, opacity: loading ? 0.7 : 1 }} onClick={confirmerAnnulation} disabled={loading}>
          {loading ? "Annulation en cours…" : "Confirmer l'annulation définitive"}
        </button>
        <button style={{ ...s.btnGhost, marginTop: 8 }} onClick={() => setEtape("choix")}>
          Retour — garder mon billet
        </button>
      </div>
    </div>
  );

  // ── Étape choix (par défaut) ──────────────────────────────────
  return (
    <div style={s.app}>
      <NavBar titre="Annuler un billet" onBack={() => setPage?.("billets")} />
      <div style={s.body}>

        {/* Billet sélectionné */}
        <p style={s.label}>Billet à annuler</p>
        <div style={{ ...s.card, marginBottom: 14, background: C.blueLt, border: `0.5px solid #B5D4F4` }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.blueDk, marginBottom: 4 }}>{reso.trajet}</div>
          <div style={{ fontSize: 11, color: C.blue, marginBottom: 4 }}>{reso.date} · {reso.heure}</div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: C.blue }}>Siège(s) : {reso.sieges.join(", ")}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.blueDk }}>{reso.montant.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>

        {/* Aperçu remboursement */}
        <p style={s.label}>Remboursement applicable</p>
        <div style={{ background: remb.tranche.bg, borderRadius: 12, padding: "14px", marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: remb.tranche.couleur, marginBottom: 2 }}>
            {remb.montant.toLocaleString("fr-FR")} FCFA
          </div>
          <div style={{ fontSize: 12, color: remb.tranche.couleur, fontWeight: 500, marginBottom: 4 }}>
            {remb.tranche.label}
          </div>
          <div style={{ fontSize: 10, color: remb.tranche.couleur, opacity: 0.8 }}>
            {reso.heuresAvant > 6
              ? `Départ dans ${reso.heuresAvant}h — ${remb.taux}% remboursé sur ${reso.paiement}`
              : `Départ dans moins de 6h — aucun remboursement possible`}
          </div>
        </div>

        {/* Politique complète */}
        <p style={s.label}>Politique d'annulation TIKETI</p>
        <div style={{ ...s.card, marginBottom: 14 }}>
          {POLITIQUE.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < POLITIQUE.length - 1 ? `0.5px dashed ${C.border}` : "none" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{p.delai}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: p.couleur }}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Raison */}
        <p style={s.label}>Raison de l'annulation</p>
        <div style={{ ...s.card, marginBottom: 14 }}>
          {raisons.map(r => (
            <label key={r} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", cursor: "pointer", borderBottom: r !== raisons[raisons.length - 1] ? `0.5px solid ${C.border}` : "none" }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, border: `1.5px solid ${raison === r ? C.blue : C.border}`, background: raison === r ? C.blue : C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {raison === r && <div style={{ width: 8, height: 8, borderRadius: 4, background: C.white }} />}
              </div>
              <span style={{ fontSize: 12, color: C.gray }} onClick={() => setRaison(r)}>{r}</span>
            </label>
          ))}
          {raison === "Autre raison" && (
            <textarea
              rows={2}
              placeholder="Précisez votre raison…"
              value={raisonCustom}
              onChange={e => setRaisonCustom(e.target.value)}
              style={{ width: "100%", marginTop: 8, padding: "8px 10px", borderRadius: 8, border: `0.5px solid ${C.border}`, fontSize: 12, resize: "none", outline: "none", boxSizing: "border-box" }}
            />
          )}
        </div>

        <button
          style={{ ...s.btnDanger, opacity: (!raison || (raison === "Autre raison" && !raisonCustom)) ? 0.4 : 1 }}
          disabled={!raison || (raison === "Autre raison" && !raisonCustom)}
          onClick={() => setEtape("confirmation")}>
          Continuer vers la confirmation
        </button>
        <button style={{ ...s.btnGhost, marginTop: 8 }} onClick={() => setPage?.("billets")}>
          Garder mon billet
        </button>
      </div>
    </div>
  );
}

// ─── ÉCRAN : HISTORIQUE DES REMBOURSEMENTS ───────────────────────────────────
export function HistoriqueRemboursements({ setPage }) {
  const statuts = {
    "versé":    { color: C.green,  bg: C.greenLt, label: "Versé" },
    "en cours": { color: C.blue,   bg: C.blueLt,  label: "En cours" },
    "refusé":   { color: C.red,    bg: C.redLt,   label: "Refusé" },
  };

  return (
    <div style={s.app}>
      <NavBar titre="Mes remboursements" onBack={() => setPage?.("billets")} />
      <div style={s.body}>
        {REMBOURSEMENTS_DEMO.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💸</div>
            <div style={{ fontSize: 13 }}>Aucun remboursement</div>
          </div>
        ) : (
          REMBOURSEMENTS_DEMO.map(r => {
            const st = statuts[r.statut] || statuts["en cours"];
            return (
              <div key={r.id} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.gray, marginBottom: 2 }}>{r.trajet}</div>
                    <div style={{ fontSize: 10, color: "#bbb", fontFamily: "monospace" }}>Réf. {r.ref}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: st.bg, color: st.color, fontWeight: 500 }}>
                    {st.label}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `0.5px dashed ${C.border}` }}>
                  <span style={{ fontSize: 11, color: "#999" }}>Payé</span>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{r.montantPaye.toLocaleString("fr-FR")} FCFA</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `0.5px dashed ${C.border}` }}>
                  <span style={{ fontSize: 11, color: "#999" }}>Remboursé ({r.taux}%)</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: r.montantRembourse > 0 ? C.green : C.red }}>
                    {r.montantRembourse.toLocaleString("fr-FR")} FCFA
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: `0.5px dashed ${C.border}` }}>
                  <span style={{ fontSize: 11, color: "#999" }}>Via</span>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{r.moyen}</span>
                </div>
                <div style={{ fontSize: 10, color: "#bbb", marginTop: 6, textAlign: "right" }}>{r.date}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── COMPOSANT BOUTON ANNULER (à insérer dans MesBillets) ───────────────────
export function BoutonAnnuler({ reservation, setPage, setReservationAnnuler }) {
  return (
    <button
      onClick={() => { setReservationAnnuler?.(reservation); setPage?.("annulation"); }}
      style={{ padding: "6px 12px", borderRadius: 8, background: C.redLt, color: C.red, fontSize: 11, fontWeight: 500, border: `0.5px solid #F7C1C1`, cursor: "pointer" }}>
      Annuler
    </button>
  );
}

// ─── UTILITAIRE ──────────────────────────────────────────────────────────────
function NavBar({ titre, onBack }) {
  return (
    <div style={{ background: C.blue, padding: "10px 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{titre}</span>
      </div>
    </div>
  );
}

export default { Annulation, HistoriqueRemboursements, BoutonAnnuler };
