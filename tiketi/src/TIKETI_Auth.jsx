/**
 * TIKETI — Module Authentification
 * ──────────────────────────────────
 * Intégration dans TIKETI_MVP.jsx :
 *
 * 1. import { AuthProvider, useAuth, ProtectedRoute } from './TIKETI_Auth';
 * 2. Enveloppez <TIKETI /> dans <AuthProvider>
 * 3. Remplacez le sélecteur de profil par <ProtectedRoute>
 * 4. Utilisez useAuth() pour accéder à l'utilisateur connecté partout
 */

import { useState, createContext, useContext, useEffect } from "react";

// ─── COULEURS ────────────────────────────────────────────────────────────────
const C = {
  blue:    "#185FA5", blueLt: "#E6F1FB", blueDk: "#0C447C",
  green:   "#085041", greenLt: "#E1F5EE",
  red:     "#791F1F", redLt:   "#FCEBEB",
  gray:    "#4A4A4A", border:  "#e0e0e0",
  bg:      "#F5F7FA", white:   "#FFFFFF",
};

const s = {
  app:        { fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh", maxWidth: 420, margin: "0 auto" },
  body:       { padding: "24px 20px" },
  input:      { width: "100%", padding: "11px 14px", borderRadius: 10, border: `0.5px solid ${C.border}`, fontSize: 13, background: C.white, boxSizing: "border-box", outline: "none", marginBottom: 10 },
  inputErr:   { borderColor: "#F09595" },
  label:      { fontSize: 11, fontWeight: 600, color: C.gray, display: "block", marginBottom: 4 },
  btnPrimary: { display: "block", width: "100%", padding: 12, borderRadius: 10, background: C.blue, color: C.white, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center" },
  btnGhost:   { display: "block", width: "100%", padding: 11, borderRadius: 10, background: C.white, color: C.blue, fontSize: 13, fontWeight: 500, border: `0.5px solid ${C.border}`, cursor: "pointer", textAlign: "center" },
  errBox:     { background: C.redLt, border: `0.5px solid #F7C1C1`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.red, marginBottom: 12 },
  card:       { background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 14, padding: "20px" },
};

// ─── UTILISATEURS DE DÉMONSTRATION ───────────────────────────────────────────
const USERS_DEMO = [
  { id: "u1", nom: "Dia Koné",      email: "dia@tiketi.ci",     tel: "0701234567", motdepasse: "tiketi123", profil: "voyageur", points: 780 },
  { id: "u2", nom: "Contrôleur 01", email: "ctrl@tiketi.ci",    tel: "0702345678", motdepasse: "ctrl2026",  profil: "controleur", points: 0 },
  { id: "u3", nom: "Admin TIKETI",  email: "admin@tiketi.ci",   tel: "0703456789", motdepasse: "admin2026", profil: "admin", points: 0 },
];

// ─── CONTEXTE AUTH ───────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restauration de session depuis localStorage (simulé)
  useEffect(() => {
    const saved = sessionStorage.getItem("tiketi_user");
    if (saved) {
      try { setUser(JSON.parse(saved)); setToken("jwt_demo_token"); } catch(_) {}
    }
    setLoading(false);
  }, []);

  function connecter(email, mdp) {
    const u = USERS_DEMO.find(x => x.email === email && x.motdepasse === mdp);
    if (!u) return { ok: false, erreur: "Email ou mot de passe incorrect." };
    const { motdepasse: _, ...userSafe } = u;
    const jwt = `jwt_${u.id}_${Date.now()}`;
    setUser(userSafe);
    setToken(jwt);
    sessionStorage.setItem("tiketi_user", JSON.stringify(userSafe));
    return { ok: true, user: userSafe };
  }

  function inscrire(data) {
    if (USERS_DEMO.find(x => x.email === data.email))
      return { ok: false, erreur: "Cet email est déjà utilisé." };
    if (data.motdepasse !== data.confirmation)
      return { ok: false, erreur: "Les mots de passe ne correspondent pas." };
    if (data.motdepasse.length < 6)
      return { ok: false, erreur: "Le mot de passe doit contenir au moins 6 caractères." };
    const newUser = { id: "u_" + Date.now(), nom: data.nom, email: data.email, tel: data.tel, profil: "voyageur", points: 0 };
    USERS_DEMO.push({ ...newUser, motdepasse: data.motdepasse });
    setUser(newUser);
    setToken(`jwt_${newUser.id}_${Date.now()}`);
    sessionStorage.setItem("tiketi_user", JSON.stringify(newUser));
    return { ok: true, user: newUser };
  }

  function deconnecter() {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("tiketi_user");
  }

  function resetMotDePasse(email) {
    const u = USERS_DEMO.find(x => x.email === email);
    if (!u) return { ok: false, erreur: "Aucun compte trouvé avec cet email." };
    return { ok: true, message: `Un lien de réinitialisation a été envoyé à ${email}.` };
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, connecter, inscrire, deconnecter, resetMotDePasse }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

// ─── ROUTE PROTÉGÉE ──────────────────────────────────────────────────────────
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const [authPage, setAuthPage] = useState("connexion");
  if (loading) return <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}><Spinner /></div>;
  if (!user) return <AuthFlow page={authPage} setPage={setAuthPage} />;
  return children;
}

// ─── FLOW D'AUTHENTIFICATION ─────────────────────────────────────────────────
function AuthFlow({ page, setPage }) {
  return (
    <div style={s.app}>
      {page === "connexion"    && <Connexion    setPage={setPage} />}
      {page === "inscription"  && <Inscription  setPage={setPage} />}
      {page === "reset"        && <ResetPassword setPage={setPage} />}
      {page === "reset-ok"     && <ResetOK      setPage={setPage} />}
    </div>
  );
}

// ─── ÉCRAN : CONNEXION ───────────────────────────────────────────────────────
function Connexion({ setPage }) {
  const { connecter } = useAuth();
  const [email,  setEmail]  = useState("");
  const [mdp,    setMdp]    = useState("");
  const [erreur, setErreur] = useState("");
  const [loading,setLoading]= useState(false);
  const [showMdp,setShowMdp]= useState(false);

  function soumettre() {
    setErreur("");
    if (!email || !mdp) return setErreur("Remplissez tous les champs.");
    setLoading(true);
    setTimeout(() => {
      const res = connecter(email, mdp);
      setLoading(false);
      if (!res.ok) setErreur(res.erreur);
    }, 800);
  }

  return (
    <>
      <EnTeteAuth />
      <div style={s.body}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: C.gray, marginBottom: 6 }}>Connexion</h2>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 20 }}>Accédez à votre espace TIKETI</p>

        {erreur && <div style={s.errBox}>⚠ {erreur}</div>}

        <label style={s.label}>Email ou téléphone</label>
        <input style={s.input} type="email" placeholder="dia@tiketi.ci" value={email} onChange={e => setEmail(e.target.value)} />

        <label style={s.label}>Mot de passe</label>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <input style={{ ...s.input, marginBottom: 0, paddingRight: 40 }} type={showMdp ? "text" : "password"} placeholder="••••••••" value={mdp} onChange={e => setMdp(e.target.value)} onKeyDown={e => e.key === "Enter" && soumettre()} />
          <button onClick={() => setShowMdp(v => !v)} style={{ position: "absolute", right: 12, top: 11, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#aaa" }}>
            {showMdp ? "🙈" : "👁"}
          </button>
        </div>
        <button onClick={() => setPage("reset")} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", marginBottom: 18, padding: 0 }}>
          Mot de passe oublié ?
        </button>

        <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={soumettre} disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <div style={{ textAlign: "center", margin: "16px 0 8px", fontSize: 12, color: "#bbb" }}>ou</div>

        <button style={s.btnGhost} onClick={() => setPage("inscription")}>Créer un compte TIKETI</button>

        <div style={{ background: C.blueLt, borderRadius: 10, padding: "10px 14px", marginTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.blueDk, marginBottom: 6 }}>Comptes de démonstration</p>
          {[
            { label: "Voyageur",    email: "dia@tiketi.ci",   mdp: "tiketi123" },
            { label: "Contrôleur",  email: "ctrl@tiketi.ci",  mdp: "ctrl2026"  },
            { label: "Admin",       email: "admin@tiketi.ci", mdp: "admin2026" },
          ].map(c => (
            <button key={c.email} onClick={() => { setEmail(c.email); setMdp(c.mdp); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.blue, padding: "3px 0" }}>
              → {c.label} : {c.email}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── ÉCRAN : INSCRIPTION ─────────────────────────────────────────────────────
function Inscription({ setPage }) {
  const { inscrire } = useAuth();
  const [form, setForm]     = useState({ nom: "", email: "", tel: "", motdepasse: "", confirmation: "" });
  const [erreur, setErreur] = useState("");
  const [loading,setLoading]= useState(false);
  const [etape, setEtape]   = useState(1); // 1 = infos perso, 2 = mot de passe

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function validerEtape1() {
    if (!form.nom || !form.email || !form.tel) return setErreur("Tous les champs sont requis.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setErreur("Email invalide.");
    setErreur(""); setEtape(2);
  }

  function soumettre() {
    setErreur(""); setLoading(true);
    setTimeout(() => {
      const res = inscrire(form);
      setLoading(false);
      if (!res.ok) setErreur(res.erreur);
    }, 900);
  }

  return (
    <>
      <EnTeteAuth />
      <div style={s.body}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          {etape === 2 && <button onClick={() => setEtape(1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.gray }}>←</button>}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.gray, marginBottom: 2 }}>Créer un compte</h2>
            <p style={{ fontSize: 12, color: "#999" }}>Étape {etape} sur 2</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20 }}>
          <div style={{ height: "100%", width: etape === 1 ? "50%" : "100%", background: C.blue, borderRadius: 2, transition: "width .3s" }} />
        </div>

        {erreur && <div style={s.errBox}>⚠ {erreur}</div>}

        {etape === 1 ? (
          <>
            <label style={s.label}>Nom complet</label>
            <input style={s.input} type="text" placeholder="Dia Koné" value={form.nom} onChange={e => set("nom", e.target.value)} />
            <label style={s.label}>Adresse email</label>
            <input style={s.input} type="email" placeholder="dia@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
            <label style={s.label}>Numéro de téléphone</label>
            <input style={s.input} type="tel" placeholder="07 00 00 00 00" value={form.tel} onChange={e => set("tel", e.target.value)} />
            <button style={s.btnPrimary} onClick={validerEtape1}>Continuer</button>
          </>
        ) : (
          <>
            <label style={s.label}>Mot de passe</label>
            <input style={s.input} type="password" placeholder="Min. 6 caractères" value={form.motdepasse} onChange={e => set("motdepasse", e.target.value)} />
            <label style={s.label}>Confirmer le mot de passe</label>
            <input style={s.input} type="password" placeholder="Répétez le mot de passe" value={form.confirmation} onChange={e => set("confirmation", e.target.value)} />

            {/* Indicateur de force */}
            {form.motdepasse && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                  {[1,2,3].map(n => (
                    <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: form.motdepasse.length >= n*3 ? (n === 3 ? C.green : n === 2 ? "#F59E0B" : C.red) : C.border }} />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: form.motdepasse.length >= 9 ? C.green : form.motdepasse.length >= 6 ? "#F59E0B" : C.red }}>
                  {form.motdepasse.length >= 9 ? "Fort" : form.motdepasse.length >= 6 ? "Moyen" : "Faible"}
                </span>
              </div>
            )}

            <div style={{ background: C.blueLt, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: C.blueDk, marginBottom: 16 }}>
              En créant un compte, vous acceptez les conditions d'utilisation et la politique de confidentialité TIKETI.
            </div>
            <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={soumettre} disabled={loading}>
              {loading ? "Création du compte…" : "Créer mon compte"}
            </button>
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 16 }}>
          Déjà un compte ?{" "}
          <button onClick={() => setPage("connexion")} style={{ background: "none", border: "none", color: C.blue, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Se connecter
          </button>
        </p>
      </div>
    </>
  );
}

// ─── ÉCRAN : RESET MOT DE PASSE ──────────────────────────────────────────────
function ResetPassword({ setPage }) {
  const { resetMotDePasse } = useAuth();
  const [email,  setEmail]  = useState("");
  const [erreur, setErreur] = useState("");
  const [loading,setLoading]= useState(false);

  function soumettre() {
    setErreur(""); setLoading(true);
    setTimeout(() => {
      const res = resetMotDePasse(email);
      setLoading(false);
      if (!res.ok) setErreur(res.erreur);
      else setPage("reset-ok");
    }, 800);
  }

  return (
    <>
      <EnTeteAuth />
      <div style={s.body}>
        <button onClick={() => setPage("connexion")} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: C.gray, marginBottom: 14 }}>←</button>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: C.gray, marginBottom: 6 }}>Mot de passe oublié</h2>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 20, lineHeight: 1.5 }}>
          Saisissez votre email. Vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>
        {erreur && <div style={s.errBox}>⚠ {erreur}</div>}
        <label style={s.label}>Votre adresse email</label>
        <input style={s.input} type="email" placeholder="dia@tiketi.ci" value={email} onChange={e => setEmail(e.target.value)} />
        <button style={{ ...s.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={soumettre} disabled={loading}>
          {loading ? "Envoi…" : "Envoyer le lien"}
        </button>
      </div>
    </>
  );
}

function ResetOK({ setPage }) {
  return (
    <>
      <EnTeteAuth />
      <div style={{ ...s.body, textAlign: "center", paddingTop: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: C.gray, marginBottom: 8 }}>Email envoyé</h2>
        <p style={{ fontSize: 13, color: "#999", lineHeight: 1.6, marginBottom: 24 }}>
          Vérifiez votre boîte mail et cliquez sur le lien pour créer un nouveau mot de passe.
        </p>
        <button style={s.btnPrimary} onClick={() => setPage("connexion")}>Retour à la connexion</button>
      </div>
    </>
  );
}

// ─── PROFIL UTILISATEUR (à ajouter dans l'écran Profil) ──────────────────────
export function ProfilUtilisateur({ setPage }) {
  const { user, deconnecter } = useAuth();
  if (!user) return null;

  return (
    <div style={s.app}>
      <div style={{ background: C.blue, padding: "10px 16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setPage?.("accueil")} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Mon profil</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 26, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff" }}>
            {user.nom.split(" ").map(w => w[0]).join("").slice(0,2)}
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>{user.nom}</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{user.email}</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "2px 8px", display: "inline-block", marginTop: 4, fontSize: 10, color: "#fff", fontWeight: 500 }}>
              {user.profil.charAt(0).toUpperCase() + user.profil.slice(1)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {user.profil === "voyageur" && (
          <div style={{ background: C.amberLt, border: "0.5px solid #FAC775", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#633806", marginBottom: 2 }}>Points TIKETI</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#633806" }}>{user.points} pts</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 20 }}>⭐</div>
              <div style={{ fontSize: 10, color: "#633806" }}>Niveau Bronze</div>
            </div>
          </div>
        )}

        {[
          { icon: "✏️", label: "Modifier mes informations" },
          { icon: "🔒", label: "Changer le mot de passe" },
          { icon: "🔔", label: "Préférences de notification" },
          { icon: "🎫", label: "Mes réservations" },
          { icon: "📄", label: "Conditions d'utilisation" },
        ].map(item => (
          <div key={item.label} style={{ background: C.white, border: `0.5px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, color: C.gray, flex: 1 }}>{item.label}</span>
            <span style={{ color: "#bbb", fontSize: 16 }}>›</span>
          </div>
        ))}

        <button onClick={deconnecter} style={{ display: "block", width: "100%", padding: 12, borderRadius: 10, background: C.redLt, color: C.red, fontSize: 13, fontWeight: 600, border: `0.5px solid #F7C1C1`, cursor: "pointer", marginTop: 6, textAlign: "center" }}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}

// ─── COMPOSANTS UTILITAIRES ──────────────────────────────────────────────────
function EnTeteAuth() {
  return (
    <div style={{ background: C.blue, padding: "40px 20px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: C.white, letterSpacing: 2, marginBottom: 4 }}>TIKETI</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Votre billet. Votre voyage.</div>
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 28, height: 28, border: `3px solid ${C.blueLt}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 0.7s linear infinite" }}><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style></div>;
}

export default { AuthProvider, useAuth, ProtectedRoute, ProfilUtilisateur };
