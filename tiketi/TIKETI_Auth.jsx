/**
 * TIKETI — Module PWA & Mode Hors Connexion
 * Composants React : OfflineBanner, BoutonInstaller, ParametresPWA
 * Hooks : useOffline, useInstallPWA
 * Fonction : registerSW
 */
import { useState, useEffect, useCallback } from "react";

const C = {
  blue: "#185FA5", blueLt: "#E6F1FB", blueDk: "#0C447C",
  green: "#085041", greenLt: "#E1F5EE",
  amber: "#633806", amberLt: "#FAEEDA",
  red: "#791F1F", redLt: "#FCEBEB",
  gray: "#4A4A4A", border: "#e0e0e0", white: "#FFFFFF", bg: "#F5F7FA",
};

// ── Enregistrement du Service Worker ──────────────────
export function registerSW() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[TIKETI SW] Enregistré :", reg.scope);
          reg.addEventListener("updatefound", () => {
            const newSW = reg.installing;
            newSW?.addEventListener("statechange", () => {
              if (newSW.state === "installed" && navigator.serviceWorker.controller) {
                // Nouvelle version disponible — notifier l'utilisateur
                window.dispatchEvent(new CustomEvent("tiketi-sw-update"));
              }
            });
          });
        })
        .catch((err) => console.error("[TIKETI SW] Échec :", err));
    });
  }
}

// ── Hook : état de la connexion ───────────────────────
export function useOffline() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [since,   setSince]   = useState(null);

  useEffect(() => {
    function onOffline() { setOffline(true);  setSince(new Date()); }
    function onOnline()  { setOffline(false); setSince(null); }
    window.addEventListener("offline", onOffline);
    window.addEventListener("online",  onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online",  onOnline);
    };
  }, []);

  return { offline, since };
}

// ── Hook : installation PWA (bouton "Ajouter à l'écran d'accueil") ──
export function useInstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function onBeforeInstall(e) { e.preventDefault(); setPrompt(e); }
    function onAppInstalled()   { setInstalled(true); setPrompt(null); }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled",        onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled",        onAppInstalled);
    };
  }, []);

  const installer = useCallback(async () => {
    if (!prompt) return;
    const { outcome } = await prompt.prompt();
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }, [prompt]);

  return { canInstall: !!prompt, installed, installer };
}

// ── Bannière hors connexion (à placer en haut de l'app) ──
export function OfflineBanner() {
  const { offline, since } = useOffline();
  const [dismissed, setDismissed] = useState(false);
  const [reconnected, setReconnected] = useState(false);

  useEffect(() => {
    if (!offline && since) {
      setReconnected(true);
      setDismissed(false);
      const t = setTimeout(() => setReconnected(false), 3000);
      return () => clearTimeout(t);
    }
  }, [offline, since]);

  if (dismissed) return null;

  if (reconnected) return (
    <div style={{ background: C.greenLt, borderBottom: `0.5px solid #9FE1CB`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.green, fontWeight: 500 }}>
      <span>✅</span> Connexion rétablie — données synchronisées
    </div>
  );

  if (!offline) return null;

  return (
    <div style={{ background: C.amberLt, borderBottom: `0.5px solid #FAC775`, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14 }}>📵</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>Hors connexion</div>
        <div style={{ fontSize: 10, color: C.amber, opacity: 0.8 }}>Vos billets restent accessibles. Les nouvelles réservations seront synchronisées à la reconnexion.</div>
      </div>
      <button onClick={() => setDismissed(true)} style={{ background: "none", border: "none", color: C.amber, fontSize: 16, cursor: "pointer" }}>✕</button>
    </div>
  );
}

// ── Bouton d'installation PWA ─────────────────────────
export function BoutonInstaller() {
  const { canInstall, installed, installer } = useInstallPWA();

  if (installed) return (
    <div style={{ background: C.greenLt, border: `0.5px solid #9FE1CB`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: C.green }}>
      <span style={{ fontSize: 18 }}>✅</span>
      <div>
        <div style={{ fontWeight: 600, marginBottom: 1 }}>TIKETI est installée</div>
        <div style={{ fontSize: 10, opacity: 0.8 }}>Retrouvez l'icône sur votre écran d'accueil</div>
      </div>
    </div>
  );

  if (!canInstall) return (
    <div style={{ background: C.blueLt, border: `0.5px solid #B5D4F4`, borderRadius: 10, padding: "10px 14px", fontSize: 11, color: C.blueDk, lineHeight: 1.5 }}>
      📲 Pour installer TIKETI sur votre téléphone, appuyez sur <strong>Partager</strong> puis <strong>"Sur l'écran d'accueil"</strong> (iOS) ou sur le menu ⋮ puis <strong>"Installer l'application"</strong> (Android).
    </div>
  );

  return (
    <button onClick={installer}
      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", borderRadius: 12, background: C.blue, color: C.white, border: "none", cursor: "pointer", textAlign: "left" }}>
      <span style={{ fontSize: 22 }}>📲</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Installer TIKETI</div>
        <div style={{ fontSize: 10, opacity: 0.8 }}>Accès rapide depuis votre écran d'accueil, même sans connexion</div>
      </div>
      <span style={{ marginLeft: "auto", fontSize: 18, opacity: 0.8 }}>›</span>
    </button>
  );
}

// ── Écran : paramètres PWA & offline ─────────────────
export function ParametresPWA({ setPage }) {
  const { offline }          = useOffline();
  const { canInstall, installed, installer } = useInstallPWA();
  const [cacheSize,  setCacheSize]  = useState("calcul en cours…");
  const [syncing,    setSyncing]    = useState(false);
  const [syncDone,   setSyncDone]   = useState(false);
  const [swUpdate,   setSwUpdate]   = useState(false);

  useEffect(() => {
    // Calcul taille du cache
    if ("storage" in navigator && "estimate" in navigator.storage) {
      navigator.storage.estimate().then(({ usage }) => {
        setCacheSize(usage ? `${(usage / 1024 / 1024).toFixed(1)} Mo` : "N/A");
      });
    } else {
      setCacheSize("~4 Mo (estimé)");
    }
    // Écouter mise à jour SW
    window.addEventListener("tiketi-sw-update", () => setSwUpdate(true));
  }, []);

  function forcerSync() {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSyncDone(true); setTimeout(() => setSyncDone(false), 3000); }, 1500);
  }

  function viderCache() {
    if ("caches" in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
        .then(() => setCacheSize("0 Mo"));
    }
  }

  const items = [
    {
      icon: offline ? "📵" : "✅",
      titre: offline ? "Hors connexion" : "Connecté",
      desc: offline ? "Mode hors ligne actif — billets en cache" : "Toutes les données sont à jour",
      bg: offline ? C.amberLt : C.greenLt,
      color: offline ? C.amber : C.green,
    },
    {
      icon: "💾",
      titre: "Cache local",
      desc: `${cacheSize} utilisés — billets, trajets et ressources statiques`,
      bg: C.blueLt,
      color: C.blueDk,
      action: { label: "Vider le cache", fn: viderCache },
    },
    {
      icon: "🔄",
      titre: "Synchronisation",
      desc: syncDone ? "Synchronisation terminée ✓" : "Réservations et annulations en attente",
      bg: C.blueLt,
      color: C.blueDk,
      action: { label: syncing ? "Sync…" : "Synchroniser", fn: forcerSync },
    },
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" }}>
      <div style={{ background: C.blue, padding: "10px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setPage?.("accueil")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer" }}>←</button>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>Application & mode hors ligne</span>
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        {swUpdate && (
          <div style={{ background: C.amberLt, border: `0.5px solid #FAC775`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amber }}>Mise à jour disponible</div>
              <div style={{ fontSize: 10, color: C.amber }}>Rechargez pour bénéficier des dernières améliorations</div>
            </div>
            <button onClick={() => window.location.reload()} style={{ background: C.amber, color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>
              Recharger
            </button>
          </div>
        )}

        {/* Installation */}
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#bbb", marginBottom: 8 }}>Installation</p>
        <div style={{ marginBottom: 14 }}>
          <BoutonInstaller />
        </div>

        {/* Statuts */}
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#bbb", marginBottom: 8 }}>Statut & cache</p>
        {items.map((it, i) => (
          <div key={i} style={{ background: it.bg, border: `0.5px solid ${it.color}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>{it.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: it.color, marginBottom: 2 }}>{it.titre}</div>
              <div style={{ fontSize: 10, color: it.color, opacity: 0.8 }}>{it.desc}</div>
            </div>
            {it.action && (
              <button onClick={it.action.fn} style={{ background: it.color, color: "#fff", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
                {it.action.label}
              </button>
            )}
          </div>
        ))}

        {/* Ce qui est disponible offline */}
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", color: "#bbb", marginBottom: 8, marginTop: 14 }}>Disponible hors connexion</p>
        {[
          ["🎫", "Mes billets actifs et QR codes",        true],
          ["📋", "Historique des réservations",           true],
          ["🔔", "Notifications déjà reçues",             true],
          ["🔍", "Recherche de trajets",                  false],
          ["💳", "Paiement et nouvelle réservation",      false],
          ["📍", "Suivi GPS en temps réel",               false],
        ].map(([icon, label, dispo]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `0.5px solid ${C.border}` }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 12, flex: 1, color: C.gray }}>{label}</span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, background: dispo ? C.greenLt : "#f0f0f0", color: dispo ? C.green : "#bbb", fontWeight: 500 }}>
              {dispo ? "✓ Offline" : "Connexion requise"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default { registerSW, useOffline, useInstallPWA, OfflineBanner, BoutonInstaller, ParametresPWA };
