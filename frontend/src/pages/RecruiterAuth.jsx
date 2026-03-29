import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Building2, User, ArrowRight, RefreshCw,
  Github, Shield, CheckCircle2, Eye, EyeOff, Search, Bookmark
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function InputField({ label, type = "text", value, onChange, placeholder, disabled, icon, rightSlot }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full py-2.5 rounded-lg border border-border bg-background text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors
            ${icon ? "pl-10" : "pl-3"} ${rightSlot ? "pr-10" : "pr-3"}`}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      icon={<Lock className="w-4 h-4" />}
      rightSlot={
        <button type="button" onClick={() => setShow(v => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

// OTP digit boxes
function OTPInput({ value, onChange, disabled }) {
  const digits = (value + "      ").slice(0, 6).split("");

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }
    if (/^\d$/.test(e.key)) {
      const next = (value.slice(0, idx) + e.key + value.slice(idx + 1)).slice(0, 6);
      onChange(next.trim());
      if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i} id={`otp-${i}`}
          type="text" inputMode="numeric" maxLength={1}
          value={d.trim()} onChange={() => { }}
          onKeyDown={e => handleKey(e, i)} onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-12 text-center text-xl font-bold font-mono rounded-lg border-2 bg-background
            focus:outline-none transition-colors disabled:opacity-50
            ${d.trim() ? "border-primary text-primary" : "border-border text-foreground"}
            focus:border-primary`}
          autoFocus={i === 0 && !disabled}
        />
      ))}
    </div>
  );
}

function ErrorMsg({ msg }) {
  if (!msg) return null;
  return <p className="text-sm text-destructive flex items-center gap-1.5"><span>⚠</span>{msg}</p>;
}

function SubmitBtn({ loading, label, disabled }) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary
        text-primary-foreground font-medium hover:bg-primary/90
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1">
      {loading
        ? <RefreshCw className="w-4 h-4 animate-spin" />
        : <>{label} <ArrowRight className="w-4 h-4" /></>}
    </button>
  );
}

//left panel
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between w-2/5 bg-card border-r border-border p-12">
      <div>
        <Link to="/" className="flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Github className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">SkillHire</span>
        </Link>
        <h2 className="text-3xl font-bold leading-tight mb-4">
          Hire developers<br />by <span className="text-primary">actual skill</span>,<br />not just résumés.
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Search thousands of developers ranked by real GitHub activity, LeetCode performance, and project quality.
        </p>
      </div>
      <div className="space-y-4">
        {[
          { icon: <Shield className="w-4 h-4 text-primary" />, text: "Verified GitHub-backed profiles" },
          { icon: <Search className="w-4 h-4 text-blue-500" />, text: "Filter by skills, college & batch" },
          { icon: <Bookmark className="w-4 h-4 text-green-500" />, text: "Save shortlists and track candidates" },
          { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, text: "Objective scores, no self-reported data" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
            {item.icon} <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN FORM
// ═══════════════════════════════════════════════════════════════════════════════
function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required");

    setLoading(true);
    try {
      await axios.post(`${API}/api/recruiter/auth/login`,
        { email, password }, { withCredentials: true });
      await onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="login"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
      <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
      <p className="text-sm text-muted-foreground mb-7">Sign in to your recruiter account</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Work Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          disabled={loading}
          icon={<Mail className="w-4 h-4" />}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Your password"
          disabled={loading}
        />
        <ErrorMsg msg={error} />
        <SubmitBtn loading={loading} label="Sign In" />
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        Don't have an account?{" "}
        <button onClick={onSwitchToRegister} className="text-primary font-medium hover:underline">
          Create one
        </button>
      </p>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTER FORM — step 1: details, step 2: OTP
// ═══════════════════════════════════════════════════════════════════════════════
function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [regStep, setRegStep] = useState("details"); // "details" | "otp"
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const t = setInterval(() => setResendTimer(v => {
      if (v <= 1) { clearInterval(t); return 0; }
      return v - 1;
    }), 1000);
  };

  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !name || !password) return setError("Email, name and password are required");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setLoading(true);
    try {
      await axios.post(`${API}/api/recruiter/auth/register/send-otp`,
        { email, name, company, designation, password },
        { withCredentials: true }
      );
      startResendTimer();
      setRegStep("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (otp.length !== 6) return setError("Enter the 6-digit code");

    setLoading(true);
    try {
      await axios.post(`${API}/api/recruiter/auth/register/verify-otp`,
        { email, otp }, { withCredentials: true });
      await onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError(""); setOtp("");
    try {
      await axios.post(`${API}/api/recruiter/auth/register/resend-otp`,
        { email }, { withCredentials: true });
      startResendTimer();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend");
    }
  };

  return (
    <AnimatePresence mode="wait">

      {/* ── Step 1: registration details ── */}
      {regStep === "details" && (
        <motion.div key="details"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <h1 className="text-2xl font-bold mb-1">Create account</h1>
          <p className="text-sm text-muted-foreground mb-7">
            Set up your recruiter account to start hiring
          </p>

          <form onSubmit={handleDetailSubmit} className="space-y-3">
            <InputField
              label="Full Name *"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jane Smith"
              disabled={loading}
              icon={<User className="w-4 h-4" />}
            />
            <InputField
              label="Work Email *"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              disabled={loading}
              icon={<Mail className="w-4 h-4" />}
            />
            <InputField
              label="Company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="Acme Inc."
              disabled={loading}
              icon={<Building2 className="w-4 h-4" />}
            />
            <InputField
              label="Designation"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              placeholder="Senior Recruiter"
              disabled={loading}
              icon={<User className="w-4 h-4" />}
            />
            <PasswordField
              label="Password *  (min 8 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              disabled={loading}
            />
            <PasswordField
              label="Confirm Password *"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              disabled={loading}
            />

            {/* Password strength hint */}
            {password.length > 0 && (
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= n * 3
                      ? n <= 1 ? "bg-red-500" : n <= 2 ? "bg-yellow-500" : n <= 3 ? "bg-blue-500" : "bg-green-500"
                      : "bg-border"
                    }`} />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {password.length < 8 ? "Too short" : password.length < 10 ? "Fair" : password.length < 12 ? "Good" : "Strong"}
                </span>
              </div>
            )}

            <ErrorMsg msg={error} />
            <SubmitBtn loading={loading} label="Send Verification Code" />
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">
              Sign in
            </button>
          </p>
        </motion.div>
      )}

      {/* ── Step 2: OTP verification ── */}
      {regStep === "otp" && (
        <motion.div key="otp"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Verify your email</h1>
          <p className="text-sm text-muted-foreground mb-1">
            We sent a 6-digit code to
          </p>
          <p className="font-semibold text-sm mb-6">{email}</p>

          <form onSubmit={handleOTPSubmit} className="space-y-5">
            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
            <ErrorMsg msg={error} />
            <SubmitBtn loading={loading} label="Verify & Create Account" disabled={otp.length < 6} />
          </form>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => { setRegStep("details"); setOtp(""); setError(""); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Change details
            </button>
            <button onClick={handleResend} disabled={resendTimer > 0}
              className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed">
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function RecruiterAuth() {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading: authLoading, refreshUser } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"

  // Redirect if already logged in as recruiter
  useEffect(() => {
    if (!authLoading && isAuthenticated && role === "recruiter") navigate("/recruiter/dashboard");
  }, [authLoading, isAuthenticated, role, navigate]);

  const handleSuccess = async () => {
    await refreshUser();
    navigate("/recruiter/dashboard");
  };

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <BrandPanel />

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Logo — mobile only */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Github className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">SkillHire</span>
          </Link>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-secondary p-1 mb-8">
            {[
              { id: "login", label: "Sign In" },
              { id: "register", label: "Register" },
            ].map(t => (
              <button key={t.id} onClick={() => setMode(t.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}>
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <LoginForm
                key="login"
                onSuccess={handleSuccess}
                onSwitchToRegister={() => setMode("register")}
              />
            ) : (
              <RegisterForm
                key="register"
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
