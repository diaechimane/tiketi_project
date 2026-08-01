/**
 * TIKETI — Module Notifications Push Avancées
 * ─────────────────────────────────────────────
 * Comment intégrer dans TIKETI_MVP.jsx :
 *
 * 1. Copiez ce fichier dans votre projet React
 * 2. Dans TIKETI_MVP.jsx, ajoutez en haut :
 *    import { NotifProvider, useNotif, Notifications, NotifSettings, NotifBadge } from './TIKETI_Notifications';
 * 3. Enveloppez <TIKETI /> dans <NotifProvider> dans votre index.jsx
 * 4. Ajoutez l'onglet "Notifications" dans BottomNav
 * 5. Ajoutez <NotifBadge /> sur l'icône cloche de la nav
 * 6. Déclenchez les notifs depuis vos composants avec useNotif()
 */

import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ─── COULEURS (cohérence avec TIKETI_MVP.jsx) ────────────────────────────────
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
  purple:  "#3C3489",
  purpleLt:"#EEEDFE",
  gray:    "#4A4A4A",
  border:  "#e0e0e0",
  bg:      "#F5F7FA",
  white:   "#FFFFFF",
};

// ─── TYPES DE NOTIFICATIONS ──────────────────────────────────────────────────
const TYPES = {
  DEPART:      { icon: "🚌", label: "Départ",        color: C.blue,   bg: C.blueLt   },
  PAIEMENT:    { icon: "✅", label: "Paiement",       color: C.green,  bg: C.greenLt  },
  RETARD:      { icon: "⏰", label: "Retard",         color: C.amber,  bg: C.amberLt  },
  ANNULATION:  { icon: "❌", label: "Annulation",     color: C.red,    bg: C.redLt    },
  PROMOTION:   { icon: "🎁", label: "Offre spéciale", color: C.purple, bg: C.purpleLt },
  BILLET:      { icon: "🎫", label: "Billet",         color: C.blue,   bg: C.blueLt   },
  FIDELITE:    { icon: "⭐", label: "Fidélité",       color: C.amber,  bg: C.amberLt  },
  INFO:        { icon: "ℹ️", label: "Information",    color: C.gray,   bg: "#F1EFE8"  },
};

// ─── DONNÉES DE DÉMONSTRATION ────────────────────────────────────────────────
const NOTIFS_DEMO = [
  {
    id: "n1", type: "DEPART", lu: false, archivee: false,
    titre: "Départ dans 2 heures",
    corps: "Votre car Abidjan → Yamoussoukro part à 06h00. Soyez à la gare 30 min avant.",
    trajet: "Abidjan → Yamoussoukro",
    heure: "06:00",
    ts: Date.now() - 1000 * 60 * 15,
    action: { label: "Voir le billet", page: "billet" },
  },
  {
    id: "n2", type: "PAIEMENT", lu: false, archivee: false,
    titre: "Paiement confirmé",
    corps: "Votre paiement de 3 500 FCFA via Orange Money a été accepté. Référence : TK-2026-A7X.",
    montant: "3 500 FCFA",
    ts: Date.now() - 1000 * 60 * 45,
    action: { label: "Voir le billet", page: "billet" },
  },
  {
    id: "n3", type: "RETARD", lu: true, archivee: false,
    titre: "Retard de 20 minutes",
    corps: "Le car Abidjan → Bouaké (07h00) est retardé de 20 min en raison du trafic à Anyama. Nouveau départ estimé : 07h20.",
    trajet: "Abidjan → Bouaké",
    ts: Date.now() - 1000 * 60 * 90,
    action: { label: "Suivre le car", page: "suivi" },
  },
  {
    id: "n4", type: "PROMOTION", lu: true, archivee: false,
    titre: "Offre week-end : −20 %",
    corps: "Voyagez vendredi ou samedi et bénéficiez de 20 % de réduction sur toutes les lignes. Valable jusqu'au 10 août.",
    ts: Date.now() - 1000 * 60 * 60 * 3,
    action: { label: "Réserver maintenant", page: "accueil" },
  },
  {
    id: "n5", type: "FIDELITE", lu: true, archivee: false,
    titre: "150 points TIKETI gagnés !",
    corps: "Vous avez gagné 150 points sur votre dernier voyage. Total : 780 points. Encore 220 points pour atteindre le niveau Argent.",
    ts: Date.now() - 1000 * 60 * 60 * 5,
    action: { label: "Voir mes points", page: "profil" },
  },
  {
    id: "n6", type: "INFO", lu: true, archivee: true,
    titre: "Nouveau terminal à Bouaké",
    corps: "À partir du 1er septembre, les départs pour Bouaké se font depuis le nouveau terminal de la gare du Nord.",
    ts: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
];

// ─── PRÉFÉRENCES PAR DÉFAUT ──────────────────────────────────────────────────
const PREFS_DEFAUT = {
  DEPART:     { active: true,  avance: 120, canal: ["push", "sms"] },
  PAIEMENT:   { active: true,  canal: ["push"] },
  RETARD:     { active: true,  canal: ["push", "sms"] },
  ANNULATION: { active: true,  canal: ["push", "sms", "email"] },
  PROMOTION:  { active: false, canal: ["push"] },
  BILLET:     { active: true,  canal: ["push", "email"] },
  FIDELITE:   { active: true,  canal: ["push"] },
  INFO:       { active: false, canal: [] },
};

// ─── CONTEXTE GLOBAL ─────────────────────────────────────────────────────────
const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifs, setNotifs]   = useState(NOTIFS_DEMO);
  const [prefs, setPrefs]     = useState(PREFS_DEFAUT);
  const [toast, setToast]     = useState(null);
  const timerRef              = useRef(null);

  const nonLues = notifs.filter(n => !n.lu && !n.archivee).length;

  // Envoyer une nouvelle notification
  const envoyer = useCallback((type, titre, corps, opts = {}) => {
    const n = {
      id:       "n_" + Date.now(),
      type,
      lu:       false,
      archivee: false,
      titre,
      corps,
      ts:       Date.now(),
      ...opts,
    };
    if (prefs[type]?.active) {
      setNotifs(prev => [n, ...prev]);
      setToast(n);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), 4500);
    }
  }, [prefs]);

  const marquerLu       = id => setNotifs(p => p.map(n => n.id === id ? { ...n, lu: true } : n));
  const marquerTousLus  = ()  => setNotifs(p => p.map(n => ({ ...n, lu: true })));
  const archiver        = id  => setNotifs(p => p.map(n => n.id === id ? { ...n, archivee: true } : n));
  const supprimer       = id  => setNotifs(p => p.filter(n => n.id !== id));
  const updatePref      = (type, champ, val) =>
    setPrefs(p => ({ ...p, [type]: { ...p[type], [champ]: val } }));

  // Simulation : notif de départ dans 5 secondes pour la démo
  useEffect(() => {
    const t = setTimeout(() => {
      envoyer("DEPART", "Rappel : départ dans 30 minutes",
        "Votre car Abidjan → Yamoussoukro part à 06h00. Direction la gare !",
        { trajet: "Abidjan → Yamoussoukro", action: { label: "Voir le billet", page: "billet" } }
      );
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <NotifContext.Provider value={{ notifs, prefs, toast, nonLues, envoyer, marquerLu, marquerTousLus, archiver, supprimer, updatePref }}>
      {children}
      <ToastNotif toast={toast} onClose={() => setToast(null)} />
    </NotifContext.Provider>
  );
}

export function useNotif() {
  return useContext(NotifContext);
}

// ─── BADGE (nombre non lus) ──────────────────────────────────────────────────
export function NotifBadge() {
  const { nonLues } = useNotif();
  if (nonLues === 0) return null;
  return (
    <span style={{
      position: "absolute", top: 2, right: 2,
      minWidth: 16, height: 16, borderRadius: 8,
      background: C.red, color: C.white,
      fontSize: 9, fontWeight: 700,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 3px", border: `1.5px solid ${C.white}`,
    }}>
      {nonLues > 9 ? "9+" : nonLues}
    </span>
  );
}

// ─── TOAST (bannière surgissante) ────────────────────────────────────────────
function ToastNotif({ toast, onClose }) {
  if (!toast) return null;
  const t = TYPES[toast.type];
  return (
    <div style={{
      position: "fixed", top: 52, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: 380,
      background: C.white, border: `0.5px solid ${C.border}`,
      borderRadius: 12, padding: "10px 12px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      zIndex: 1000, display: "flex", alignItems: "flex-start", gap: 10,
      animation: "slideDown 0.25s ease",
    }}>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
        {t.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 2 }}>{toast.titre}</div>
        <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {toast.corps}
        </div>
      </div>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 16, padding: 0, flexShrink: 0 }}>✕</button>
    </div>
  );
}

// ─── ÉCRAN NOTIFICATIONS ─────────────────────────────────────────────────────
export function Notifications({ setPage }) {
  const { notifs, nonLues, marquerLu, marquerTousLus, archiver, supprimer } = useNotif();
  const [onglet, setOnglet] = useState("toutes");
  const [detail, setDetail] = useState(null);

  const filtrees = notifs.filter(n => {
    if (onglet === "toutes")  return !n.archivee;
    if (onglet === "nonlues") return !n.lu && !n.archivee;
    if (onglet === "archives")return n.archivee;
    return true;
  });

  function ago(ts) {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60)   return "À l'instant";
    if (d < 3600) return `Il y a ${Math.floor(d/60)} min`;
    if (d < 86400)return `Il y a ${Math.floor(d/3600)} h`;
    return `Il y a ${Math.floor(d/86400)} j`;
  }

  if (detail) return <DetailNotif n={detail} onClose={() => setDetail(null)} setPage={setPage} />;

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.blue, padding: "10px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setPage?.("accueil")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Notifications</span>
            {nonLues > 0 && (
              <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 10 }}>{nonLues}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {nonLues > 0 && (
              <button onClick={marquerTousLus} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer" }}>
                Tout lire
              </button>
            )}
            <button onClick={() => setPage?.("notif-settings")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>⚙️</button>
          </div>
        </div>
        {/* Onglets */}
        <div style={{ display: "flex" }}>
          {[
            { id: "toutes",   label: "Toutes" },
            { id: "nonlues",  label: `Non lues${nonLues > 0 ? ` (${nonLues})` : ""}` },
            { id: "archives", label: "Archives" },
          ].map(o => (
            <button key={o.id} onClick={() => setOnglet(o.id)} style={{
              flex: 1, padding: "8px 0", border: "none", background: "transparent",
              color: onglet === o.id ? "#fff" : "rgba(255,255,255,0.6)",
              fontSize: 12, fontWeight: onglet === o.id ? 600 : 400, cursor: "pointer",
              borderBottom: `2px solid ${onglet === o.id ? "#fff" : "transparent"}`,
            }}>{o.label}</button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div style={{ padding: "12px 16px" }}>
        {filtrees.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#bbb" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
            <div style={{ fontSize: 13, color: "#999" }}>Aucune notification</div>
          </div>
        ) : (
          filtrees.map(n => {
            const t = TYPES[n.type];
            return (
              <div key={n.id} onClick={() => { marquerLu(n.id); setDetail(n); }}
                style={{
                  background: n.lu ? C.white : "#EEF5FF",
                  border: `0.5px solid ${n.lu ? C.border : "#B5D4F4"}`,
                  borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                  cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start",
                  position: "relative",
                }}>
                {/* Pastille non-lu */}
                {!n.lu && (
                  <div style={{ position: "absolute", top: 14, right: 14, width: 7, height: 7, borderRadius: "50%", background: C.blue }} />
                )}
                {/* Icône */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {t.icon}
                </div>
                {/* Contenu */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: n.lu ? 500 : 700, color: C.gray, paddingRight: 16 }}>{n.titre}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#888", lineHeight: 1.4, marginBottom: 5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textOverflow: "ellipsis" }}>
                    {n.corps}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: t.bg, color: t.color, fontWeight: 500 }}>
                      {t.label}
                    </span>
                    <span style={{ fontSize: 10, color: "#bbb" }}>{ago(n.ts)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── ÉCRAN DÉTAIL D'UNE NOTIFICATION ─────────────────────────────────────────
function DetailNotif({ n, onClose, setPage }) {
  const { archiver, supprimer } = useNotif();
  const t = TYPES[n.type];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <div style={{ background: C.blue, padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Détail</span>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        {/* Carte principale */}
        <div style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
              {t.icon}
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: t.color, marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.gray }}>{n.titre}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: C.gray, lineHeight: 1.6, margin: "0 0 14px" }}>{n.corps}</p>
          {n.trajet && (
            <div style={{ background: C.blueLt, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.blueDk, fontWeight: 500, marginBottom: 12 }}>
              🚌 {n.trajet}{n.heure ? ` · ${n.heure}` : ""}
            </div>
          )}
          {n.montant && (
            <div style={{ background: C.greenLt, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 12 }}>
              ✅ Montant réglé : {n.montant}
            </div>
          )}
          {n.action && (
            <button onClick={() => { setPage?.(n.action.page); onClose(); }}
              style={{ display: "block", width: "100%", padding: "11px", borderRadius: 10, background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              {n.action.label}
            </button>
          )}
        </div>
        {/* Actions secondaires */}
        {!n.archivee && (
          <button onClick={() => { archiver(n.id); onClose(); }}
            style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, background: C.white, color: C.gray, fontSize: 12, border: `0.5px solid ${C.border}`, cursor: "pointer", marginBottom: 8 }}>
            📦 Archiver cette notification
          </button>
        )}
        <button onClick={() => { supprimer(n.id); onClose(); }}
          style={{ display: "block", width: "100%", padding: "10px", borderRadius: 10, background: C.white, color: C.red, fontSize: 12, border: `0.5px solid #F7C1C1`, cursor: "pointer" }}>
          🗑 Supprimer
        </button>
      </div>
    </div>
  );
}

// ─── ÉCRAN PARAMÈTRES NOTIFICATIONS ──────────────────────────────────────────
export function NotifSettings({ setPage }) {
  const { prefs, updatePref } = useNotif();

  const canaux = [
    { id: "push",  label: "Push",  icon: "📱" },
    { id: "sms",   label: "SMS",   icon: "💬" },
    { id: "email", label: "Email", icon: "📧" },
  ];

  const avanceOptions = [
    { val: 30,  label: "30 min avant" },
    { val: 60,  label: "1 h avant"    },
    { val: 120, label: "2 h avant"    },
    { val: 240, label: "4 h avant"    },
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <div style={{ background: C.blue, padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPage?.("notifications")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Paramètres notifications</span>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 11, color: "#999", marginBottom: 14 }}>
          Choisissez quand et comment TIKETI vous contacte pour chaque type d'événement.
        </p>

        {Object.entries(TYPES).map(([key, t]) => {
          const p = prefs[key] || {};
          return (
            <div key={key} style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
              {/* En-tête type */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: p.active ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                    {t.icon}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: C.gray }}>{t.label}</span>
                </div>
                {/* Toggle */}
                <div onClick={() => updatePref(key, "active", !p.active)}
                  style={{ width: 42, height: 24, borderRadius: 12, background: p.active ? C.blue : "#ddd", cursor: "pointer", position: "relative", transition: "background .2s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: "#fff", position: "absolute", top: 3, left: p.active ? 21 : 3, transition: "left .2s" }} />
                </div>
              </div>

              {/* Sous-options (si activé) */}
              {p.active && (
                <>
                  {/* Canaux */}
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#bbb", marginBottom: 6 }}>Via</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {canaux.map(c => {
                        const actif = (p.canal || []).includes(c.id);
                        return (
                          <button key={c.id} onClick={() => {
                            const next = actif
                              ? (p.canal || []).filter(x => x !== c.id)
                              : [...(p.canal || []), c.id];
                            updatePref(key, "canal", next);
                          }} style={{
                            padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 500,
                            background: actif ? C.blueLt : "#f5f5f5",
                            color: actif ? C.blue : "#999",
                            border: `0.5px solid ${actif ? "#B5D4F4" : "#e0e0e0"}`,
                          }}>
                            {c.icon} {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Délai (uniquement pour DEPART) */}
                  {key === "DEPART" && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "#bbb", marginBottom: 6 }}>Me rappeler</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {avanceOptions.map(o => (
                          <button key={o.val} onClick={() => updatePref(key, "avance", o.val)} style={{
                            padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 500,
                            background: p.avance === o.val ? C.blueLt : "#f5f5f5",
                            color: p.avance === o.val ? C.blue : "#999",
                            border: `0.5px solid ${p.avance === o.val ? "#B5D4F4" : "#e0e0e0"}`,
                          }}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DÉCLENCHEURS PRÊTS À L'EMPLOI ───────────────────────────────────────────
/**
 * Copiez-collez ces appels depuis vos composants existants :
 *
 * const { envoyer } = useNotif();
 *
 * // Après paiement réussi (dans Paiement.jsx) :
 * envoyer("PAIEMENT", "Paiement confirmé",
 *   `Votre paiement de ${montant} FCFA via ${methode} a été accepté.`,
 *   { montant: `${montant} FCFA`, action: { label: "Voir le billet", page: "billet" } }
 * );
 *
 * // Rappel de départ (depuis un timer ou WebSocket) :
 * envoyer("DEPART", "Départ dans 2 heures",
 *   `Votre car ${depart} → ${arrivee} part à ${heure}. Soyez à la gare 30 min avant.`,
 *   { trajet: `${depart} → ${arrivee}`, heure, action: { label: "Voir le billet", page: "billet" } }
 * );
 *
 * // Retard (depuis WebSocket GPS) :
 * envoyer("RETARD", `Retard de ${minutes} minutes`,
 *   `Le car ${trajet} est retardé. Nouveau départ estimé : ${nouvelleHeure}.`,
 *   { trajet, action: { label: "Suivre le car", page: "suivi" } }
 * );
 *
 * // Promotion (depuis admin ou campagne) :
 * envoyer("PROMOTION", "Offre spéciale",
 *   "Profitez de 20 % de réduction ce week-end sur toutes les lignes.",
 *   { action: { label: "Réserver", page: "accueil" } }
 * );
 *
 * // Points fidélité gagnés :
 * envoyer("FIDELITE", `${points} points TIKETI gagnés !`,
 *   `Total : ${total} points. Encore ${reste} points pour le niveau suivant.`,
 *   { action: { label: "Voir mes points", page: "profil" } }
 * );
 */

export default { NotifProvider, useNotif, Notifications, NotifSettings, NotifBadge };
