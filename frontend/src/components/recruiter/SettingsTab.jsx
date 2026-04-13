import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Settings, Lock, LogOut, RefreshCw, CheckCircle2, Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

function PasswordInput({ label, value, onChange, placeholder, show, onToggleShow }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          value={value} onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        {onToggleShow && (
          <button type="button" onClick={onToggleShow}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsTab({ recruiter, onLogout }) {
  // ── profile form ────────────────────────────────────────────────────────────
  const [editName, setEditName] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [openToReferral, setOpenToReferral] = useState(false);
  const [referralCompany, setReferralCompany] = useState("");
  const [referralNote, setReferralNote] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // ── change password ─────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  useEffect(() => {
    if (recruiter) {
      setEditName(recruiter.name || "");
      setEditCompany(recruiter.company || "");
      setEditDesignation(recruiter.designation || "");
      setOpenToReferral(Boolean(recruiter.openToReferral));
      setReferralCompany(recruiter.referralCompany || "");
      setReferralNote(recruiter.referralNote || "");
    }
  }, [recruiter]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.put(`${API}/api/recruiter/auth/profile`,
        {
          name: editName,
          company: editCompany,
          designation: editDesignation,
          openToReferral,
          referralCompany: openToReferral ? referralCompany : "",
          referralNote: openToReferral ? referralNote : "",
        },
        { withCredentials: true }
      );
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError(""); setPwdSuccess(false);
    if (!currentPwd || !newPwd || !confirmPwd) return setPwdError("All fields are required");
    if (newPwd.length < 8) return setPwdError("New password must be at least 8 characters");
    if (newPwd !== confirmPwd) return setPwdError("Passwords do not match");
    setSavingPwd(true);
    try {
      await axios.put(`${API}/api/recruiter/auth/change-password`,
        { currentPassword: currentPwd, newPassword: newPwd },
        { withCredentials: true }
      );
      setPwdSuccess(true);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err) {
      setPwdError(err.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <motion.div key="settings"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="max-w-lg space-y-6">

      {/* Profile */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" /> Recruiter Profile
        </h3>
        <form onSubmit={saveProfile} className="space-y-4">
          {[
            { label: "Full Name *", value: editName, onChange: setEditName, placeholder: "Jane Smith" },
            { label: "Company", value: editCompany, onChange: setEditCompany, placeholder: "Acme Inc." },
            { label: "Designation", value: editDesignation, onChange: setEditDesignation, placeholder: "Senior Recruiter" },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
              <input value={f.value} onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <input value={recruiter?.email || ""} disabled
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-secondary/50 text-sm text-muted-foreground cursor-not-allowed" />
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-foreground">Open to referral requests</p>
                <p className="text-xs text-muted-foreground">Show your recruiter profile in referral discovery.</p>
              </div>
              <input
                type="checkbox"
                checked={openToReferral}
                onChange={(e) => setOpenToReferral(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/40"
              />
            </label>

            {openToReferral && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Referral Company</label>
                  <input
                    value={referralCompany}
                    onChange={(e) => setReferralCompany(e.target.value)}
                    placeholder="Example: Google, Microsoft"
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Referral Note</label>
                  <textarea
                    value={referralNote}
                    onChange={(e) => setReferralNote(e.target.value)}
                    rows={3}
                    placeholder="Tell users what role or profile you can refer for."
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={savingProfile}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {savingProfile
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</>
              : profileSaved
                ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
                : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" /> Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput
            label="Current Password"
            value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
            placeholder="Current password"
            show={showCurrentPwd} onToggleShow={() => setShowCurrentPwd(v => !v)}
          />
          <PasswordInput
            label="New Password"
            value={newPwd} onChange={e => setNewPwd(e.target.value)}
            placeholder="At least 8 characters"
            show={showNewPwd} onToggleShow={() => setShowNewPwd(v => !v)}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
            placeholder="Repeat new password"
            show={false}
          />
          {pwdError && <p className="text-sm text-destructive">⚠ {pwdError}</p>}
          {pwdSuccess && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Password changed!
            </p>
          )}
          <button type="submit" disabled={savingPwd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {savingPwd ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating…</> : "Update Password"}
          </button>
        </form>
      </div>

      {/* Sign Out */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <h3 className="font-semibold text-destructive mb-2">Sign Out</h3>
        <p className="text-sm text-muted-foreground mb-4">You'll need your password to sign back in.</p>
        <button onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </motion.div>
  );
}
