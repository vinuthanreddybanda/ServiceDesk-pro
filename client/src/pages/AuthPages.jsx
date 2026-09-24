// ============================================
// Login & Register pages
// ============================================
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, User, Eye, EyeOff, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import useAuthStore from '../stores/authStore.js';
import { useToast } from '../components/ui/Toast.jsx';
import { getErrMsg } from '../utils/helpers.js';

function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-burnt/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg bg-amber-burnt flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-100">ServiceDesk</span>
            <span className="text-amber-burnt text-xl font-bold"> Pro</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-7 shadow-modal">
          <h1 className="text-lg font-bold text-slate-100 mb-1">{title}</h1>
          <p className="text-sm text-slate-500 mb-6">{subtitle}</p>
          {children}
        </div>

        <p className="text-center text-xs text-slate-600 mt-5">
          AI-Enabled IT Helpdesk & Asset Management
        </p>
      </div>
    </div>
  );
}

function Field({ label, id, icon: Icon, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-300">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        )}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          className="w-full h-9 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt transition-colors-fast pl-8 pr-8"
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Login failed', getErrMsg(err));
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form onSubmit={handle} className="space-y-4">
        <Field label="Email address" id="email" type="email" icon={Mail}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com" required autoComplete="email" />
        <Field label="Password" id="password" type="password" icon={Lock}
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="••••••••" required autoComplete="current-password" />

        {error && <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded px-3 py-2">{error}</p>}

        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Sign In
        </Button>

        {/* Quick access demo accounts */}
        <div className="pt-1">
          <p className="text-xs text-slate-500 mb-2 text-center">Demo accounts</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Admin', email: 'admin@acme.com', pw: 'admin123' },
              { label: 'Technician', email: 'john@acme.com', pw: 'tech123' },
              { label: 'Manager', email: 'sarah@acme.com', pw: 'manager123' },
              { label: 'Employee', email: 'alice@acme.com', pw: 'employee123' },
            ].map((d) => (
              <button key={d.label} type="button"
                onClick={() => setForm({ email: d.email, password: d.pw })}
                className="text-xs text-slate-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-2 py-1.5 transition-default">
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </form>
      <p className="text-xs text-slate-500 text-center mt-4">
        No account? <Link to="/register" className="text-amber-burnt hover:text-amber-muted">Register</Link>
      </p>
    </AuthLayout>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Registration failed', getErrMsg(err));
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Join your team on ServiceDesk Pro">
      <form onSubmit={handle} className="space-y-4">
        <Field label="Full name" id="name" icon={User} value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Doe" required />
        <Field label="Work email" id="reg-email" type="email" icon={Mail}
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@company.com" required />
        <Field label="Password" id="reg-password" type="password" icon={Lock}
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Min. 6 characters" required />
        <Field label="Department (optional)" id="dept" icon={Building2}
          value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
          placeholder="e.g. Engineering" />
        <Button type="submit" variant="primary" className="w-full" loading={loading}>
          Create Account
        </Button>
      </form>
      <p className="text-xs text-slate-500 text-center mt-4">
        Already have an account? <Link to="/login" className="text-amber-burnt hover:text-amber-muted">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
