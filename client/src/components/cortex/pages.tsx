"use client";

import { ReactNode, useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppLogo,
  Avatar,
  BarChart,
  Button,
  DashboardShell,
  Donut,
  EmptyState,
  Footer,
  HeatMap,
  MetricCard,
  NotificationBell,
  PageTitle,
  Panel,
  Progress,
  StatusPill,
} from "@/components/cortex/ui";
import { login, register } from "@/services/auth-service";
import { useChangePassword } from "@/features/authentication/hooks/use-change-password";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DASHBOARD_PATH, ROUTES } from "@/constants/routes";
import type { SelfRegisterableRole } from "@/types/auth.types";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctor,
} from "@/features/doctor/hooks/use-doctors";
import type { Doctor } from "@/features/doctor/types/doctor.types";
import {
  useAppointments,
  useCreateAppointment,
  useTrackAppointment,
} from "@/features/appointment/hooks/use-appointments";
import type { Appointment } from "@/features/appointment/types/appointment.types";
import {
  useCallNextPatient,
  useCompletePatient,
  useQueue,
} from "@/features/queue/hooks/use-queue";
import { useHospitalAnalytics } from "@/features/analytics/hooks/use-hospital-analytics";
import type { DoctorPerformanceRow } from "@/features/analytics/types/analytics.types";

function normalizeToHeights(counts: number[]): number[] {
  const max = Math.max(...counts, 1);
  return counts.map((count) => Math.max(8, Math.round((count / max) * 100)));
}

const HOUR_BUCKET_LABELS = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

function priorityTone(priority: number): "red" | "orange" | "blue" | "slate" {
  if (priority <= 1) return "red";
  if (priority <= 2) return "orange";
  if (priority <= 3) return "blue";
  return "slate";
}

const PRIORITY_LABELS: Record<number, string> = {
  1: "Critical",
  2: "Urgent",
  3: "Moderate",
  4: "Mild",
  5: "Non-Urgent",
};

function priorityLabel(priority: number): string {
  return PRIORITY_LABELS[priority] ?? "Unknown";
}

function riskTone(risk: Appointment["riskLevel"]): "red" | "orange" | "blue" | "green" | "slate" {
  if (risk === "Critical") return "red";
  if (risk === "High") return "orange";
  if (risk === "Medium") return "blue";
  if (risk === "Low") return "green";
  return "slate";
}

function AiExplainability({ appointment }: { appointment: Appointment }) {
  const confidencePct =
    appointment.triageConfidence != null ? Math.round(appointment.triageConfidence * 100) : null;
  const confidenceTone = confidencePct === null ? "slate" : confidencePct >= 70 ? "green" : confidencePct >= 40 ? "orange" : "red";

  return (
    <div className="rounded-xl bg-[#f0f1fb] p-5">
      <div className="flex items-center justify-between gap-3">
        <b className="text-[#0755d9]">AI REASONING</b>
        {confidencePct !== null && (
          <StatusPill tone={confidenceTone}>{confidencePct}% confidence</StatusPill>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="font-bold">
          Priority P{appointment.priority} ({priorityLabel(appointment.priority)})
        </span>
        {appointment.riskLevel && (
          <StatusPill tone={riskTone(appointment.riskLevel)}>{appointment.riskLevel} risk</StatusPill>
        )}
      </div>
      {appointment.recommendedDepartment && (
        <p className="mt-2 text-sm text-slate-700">
          Suggested department: <b className="text-slate-900">{appointment.recommendedDepartment}</b>
        </p>
      )}
      {appointment.aiSummary && (
        <div className="mt-3 rounded-lg bg-white p-3">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">AI Summary</span>
          <p className="mt-1 text-sm text-slate-800">{appointment.aiSummary}</p>
        </div>
      )}
      {appointment.triageFactors.length > 0 && (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {appointment.triageFactors.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-sm text-slate-700">{appointment.triageReason ?? "Not available"}</p>
    </div>
  );
}

function statusTone(status: Appointment["status"]): "blue" | "green" | "slate" | "red" {
  if (status === "waiting") return "blue";
  if (status === "serving") return "green";
  if (status === "cancelled") return "red";
  return "slate";
}

export function LandingPage() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(today);
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const calendarCells = [
    ...Array.from({ length: monthStart.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#171721]">
      <header className="sticky top-0 z-30 border-b border-[#d4d8ea] bg-[#fbfaff]/95 backdrop-blur">
        <div className="mx-auto flex h-[66px] max-w-[1280px] items-center gap-10 px-7">
          <Link href="/" className="text-[19px] font-black text-[#004bd1]">CortexMed</Link>
          <nav className="mx-auto hidden h-full items-center gap-12 text-sm md:flex">
            <Link href="/" className="flex h-full items-center border-b-2 border-[#0755d9] font-bold text-[#0755d9]">Home</Link>
            <Link href="#features">Features</Link>
            <Link href="#workflow">Workflow</Link>
            <Link href="#pricing">Pricing</Link>
          </nav>
          <div className="relative ml-auto flex items-center gap-6 text-[#0755d9]">
            <button aria-label="Notifications" className="grid h-8 w-8 place-items-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button aria-label="Calendar" onClick={() => setCalendarOpen((open) => !open)} className="grid h-8 w-8 place-items-center">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path d="M16 2v4" />
                <path d="M8 2v4" />
                <path d="M3 10h18" />
              </svg>
            </button>
            <Avatar name="CM" className="h-8 w-8" />
            {calendarOpen && (
              <div className="absolute right-8 top-11 z-40 w-[280px] rounded-2xl border border-[#c5cadf] bg-white p-5 text-[#171721] shadow-xl">
                <div className="flex items-center justify-between">
                  <b>{monthName}</b>
                  <button aria-label="Close calendar" onClick={() => setCalendarOpen(false)} className="text-lg text-[#0755d9]">×</button>
                </div>
                <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-[#5d6373]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarCells.map((day, index) => (
                    <span
                      key={`${day ?? "blank"}-${index}`}
                      className={`grid h-8 place-items-center rounded-lg ${day === today.getDate() ? "bg-[#0755d9] font-bold text-white" : day ? "text-[#171721] hover:bg-[#f0f1fb]" : ""}`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-7 py-11">
        <section className="grid items-center gap-12 lg:grid-cols-[600px_1fr]">
          <div>
            <span className="rounded-full bg-[#e8ebff] px-4 py-2 text-xs font-black uppercase tracking-wide text-[#243067]">
              ✤ Next-gen triage
            </span>
            <h1 className="mt-7 max-w-[520px] text-[46px] font-black leading-[1.02] tracking-[-0.02em]">
              AI-Powered Smart Hospital Queue Management
            </h1>
            <p className="mt-6 max-w-[610px] text-base leading-7 text-[#5d6373]">
              Revolutionize patient experience with CortexMed. Our AI-driven engine predicts wait times with 98% accuracy and automates triage to prioritize critical cases instantly.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/reception/appointments" className="rounded-xl bg-[#0755d9] px-8 py-4 text-sm font-bold text-white shadow-md shadow-blue-200">Book Appointment</Link>
              <Link href="/track" className="rounded-xl border border-[#c5cadf] bg-white px-8 py-4 text-sm font-bold">Track Queue</Link>
              <Link href="/login" className="px-4 py-4 text-sm font-bold text-[#0755d9]">Staff Login</Link>
            </div>
          </div>
          <div className="rounded-[24px] border border-[#d7dbea] bg-white p-5 shadow-sm">
            <Image src="/images/landing-hero.png" alt="CortexMed hospital queue dashboard illustration" width={960} height={540} priority className="h-[310px] w-full rounded-2xl object-cover" />
          </div>
        </section>

        <section id="features" className="mt-20">
          <div className="text-center">
            <h2 className="text-[30px] font-black">Intelligent Care Delivery</h2>
            <p className="mt-3 text-sm text-[#5d6373]">Optimizing every second of the patient journey using data-driven insights.</p>
          </div>
          <div className="mt-9 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <section className="rounded-[20px] border border-[#d7dbea] border-l-4 border-l-[#0755d9] bg-white p-9 shadow-sm">
              <div className="text-2xl text-[#0755d9]">✙</div>
              <h3 className="mt-5 text-2xl font-bold">Advanced AI Triage</h3>
              <p className="mt-4 max-w-[560px] leading-7 text-[#5d6373]">
                The clinical reasoning engine analyzes symptoms in real time to categorize urgency and move emergency cases ahead when it matters.
              </p>
              <Image src="/images/ai-triage.png" alt="AI triage visualization" width={960} height={432} className="mt-7 h-[190px] w-full rounded-xl border border-[#c5cadf] object-cover" />
            </section>
            <section className="rounded-[20px] border border-[#d7dbea] bg-[#effcf9] p-9 shadow-sm">
              <div className="text-2xl text-emerald-700">◉</div>
              <h3 className="mt-8 text-xl font-bold">Privacy First</h3>
              <p className="mt-5 leading-7 text-[#5d6373]">Fully HIPAA and GDPR compliant. Your data is encrypted end-to-end, ensuring zero-knowledge patient identity protection.</p>
              <div className="mt-24 border-t border-emerald-100 pt-6"><span className="inline-block h-4 w-4 rounded-full bg-indigo-300" /> <span className="inline-block h-4 w-4 rounded-full bg-emerald-300" /> <span className="inline-block h-4 w-4 rounded-full bg-orange-200" /></div>
            </section>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <section className="rounded-[20px] border border-[#d7dbea] bg-white p-9 shadow-sm">
              <div className="text-2xl text-[#0755d9]">▣</div>
              <h3 className="mt-8 text-xl font-bold">Live Queue Tracking</h3>
              <p className="mt-5 leading-7 text-[#5d6373]">Patients receive real-time updates on their mobile devices, allowing them to wait in comfort instead of a crowded lobby.</p>
            </section>
            <section className="rounded-[20px] border border-[#d7dbea] border-r-4 border-r-[#c91414] bg-white p-9 shadow-sm">
              <div className="grid gap-8 md:grid-cols-[1fr_380px]">
                <div>
                  <div className="text-2xl text-[#c91414]">⌁</div>
                  <h3 className="mt-8 text-xl font-bold">Smart Wait Prediction</h3>
                  <p className="mt-5 leading-7 text-[#5d6373]">Using historical traffic patterns and staff availability to provide precise waiting intervals with unparalleled accuracy.</p>
                </div>
                <div className="rounded-xl border border-[#c5cadf] bg-white p-7">
                  <div className="flex h-32 items-end gap-4">
                    {[35, 52, 75, 60, 42, 28].map((height, index) => <span key={index} className={`flex-1 rounded-t ${index === 3 ? "bg-[#0755d9]" : "bg-blue-200"}`} style={{ height: `${height}%` }} />)}
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-[#5d6373]"><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span></div>
                </div>
              </div>
            </section>
          </div>
        </section>

        <section id="workflow" className="mt-16 rounded-[24px] border border-[#d7dbea] bg-white px-8 py-12 shadow-sm">
          <div className="text-center">
            <h2 className="text-[28px] font-black">Seamless Patient Flow</h2>
            <p className="mt-2 text-sm text-[#5d6373]">A streamlined 4-step process for a better healthcare experience.</p>
          </div>
          <div className="relative mt-12 grid gap-8 md:grid-cols-4">
            <div className="absolute left-8 right-8 top-8 hidden h-px bg-[#d7dbea] md:block" />
            {[
              ["▧", "Book Appointment", "Schedule via app or web portal in seconds."],
              ["☻", "AI Prioritizes", "Symptoms analyzed to determine visit urgency."],
              ["▥", "Track Queue Live", "Wait from anywhere with live countdowns."],
              ["▣", "Meet Doctor", "Instant notification when your room is ready."],
            ].map(([icon, title, copy], index) => (
              <div key={title} className="relative text-center">
                <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#0755d9] bg-white text-2xl text-[#0755d9] ${index === 3 ? "bg-[#0755d9] text-white" : ""}`}>{icon}</div>
                <h3 className="mt-5 font-bold">{title}</h3>
                <p className="mx-auto mt-2 max-w-[170px] text-xs leading-5 text-[#5d6373]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-16 rounded-[20px] bg-[#2e69df] px-6 py-20 text-center text-white shadow-sm">
          <h2 className="text-3xl font-black">Ready to transform your hospital?</h2>
          <p className="mx-auto mt-5 max-w-[620px] text-blue-100">Use CortexMed to reduce patient frustration and improve care coordination.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href={ROUTES.REGISTER}><Button variant="secondary">Get Started Today</Button></Link>
            <Button className="border-white/40 bg-transparent">Contact Sales</Button>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t border-[#d4d8ea] bg-[#dfe3ef] px-7 py-7">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 text-sm text-[#5d6373] md:flex-row md:items-center md:justify-between">
          <div><b className="block text-[#004bd1]">CortexMed</b>© 2024 CortexMed AI Hospital Systems. All rights reserved.</div>
          <div className="flex flex-wrap gap-8"><span>About</span><span>Privacy Policy</span><span>Terms of Service</span><span>Compliance</span><span>Security</span><span>GitHub</span><span>Contact</span><span>◎</span><span>↗</span></div>
        </div>
      </footer>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login({ email, password });
      setSession(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      router.push(ROLE_DASHBOARD_PATH[result.user.role] ?? ROUTES.HOME);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <main className="grid min-h-[calc(100vh-88px)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#034da8] p-16 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative z-10 flex h-full flex-col justify-center">
            <p className="text-lg font-black uppercase tracking-[0.18em] text-blue-100">Intelligence in Healthcare</p>
            <h1 className="mt-5 text-6xl font-black">CortexMed AI</h1>
            <p className="mt-8 max-w-[520px] text-2xl leading-10 text-blue-100">
              Revolutionizing hospital operations with neural-integrated management systems and predictive patient analytics.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[560px]">
            <h1 className="text-5xl font-black">Welcome Back</h1>
            <p className="mt-5 text-xl text-slate-600">Access your clinical dashboard and patient records.</p>
            <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
              <label className="block">
                <span className="font-bold">Professional Email Address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="you@cortexmed.ai"
                />
              </label>
              <label className="block">
                <span className="font-bold">Security Credentials</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="Enter your password"
                />
              </label>
              <div className="flex justify-between text-slate-700">
                <label className="flex items-center gap-3"><input type="checkbox" /> Remember device</label>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
              <Button type="submit" disabled={loading} className="h-16 w-full text-xl disabled:opacity-60">
                {loading ? "Signing In..." : "Log In to Dashboard"}
              </Button>
            </form>
            <p className="mt-10 text-center text-slate-600">
              Need help accessing your account? <span className="font-bold text-[#0755d9]">Contact System Admin</span>
            </p>
            <p className="mt-3 text-center text-slate-600">
              New staff member? <Link href="/register" className="font-bold text-[#0755d9]">Create an account</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "receptionist" as SelfRegisterableRole,
    department: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.role === "doctor" && !form.department.trim()) {
      setError("Please enter your department.");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        department: form.role === "doctor" ? form.department.trim() : undefined,
      });

      const result = await login({ email: form.email, password: form.password });
      setSession(result.user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      router.push(ROLE_DASHBOARD_PATH[result.user.role] ?? ROUTES.HOME);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <main className="grid min-h-[calc(100vh-88px)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#034da8] p-16 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative z-10 flex h-full flex-col justify-center">
            <p className="text-lg font-black uppercase tracking-[0.18em] text-blue-100">Intelligence in Healthcare</p>
            <h1 className="mt-5 text-6xl font-black">Join CortexMed</h1>
            <p className="mt-8 max-w-[520px] text-2xl leading-10 text-blue-100">
              Create a staff account to manage patients, queues, and appointments.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[560px]">
            <h1 className="text-5xl font-black">Create Account</h1>
            <p className="mt-5 text-xl text-slate-600">Register as clinical or front-desk staff.</p>
            <form className="mt-10 space-y-7" onSubmit={handleSubmit}>
              <label className="block">
                <span className="font-bold">Full Name</span>
                <input
                  required
                  minLength={3}
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="Jane Doe"
                />
              </label>
              <label className="block">
                <span className="font-bold">Professional Email Address</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="you@cortexmed.ai"
                />
              </label>
              <label className="block">
                <span className="font-bold">Role</span>
                <select
                  value={form.role}
                  onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as SelfRegisterableRole }))}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                >
                  <option value="receptionist">Receptionist / Front Desk</option>
                  <option value="doctor">Doctor</option>
                </select>
              </label>
              {form.role === "doctor" && (
                <label className="block">
                  <span className="font-bold">Department</span>
                  <input
                    required
                    value={form.department}
                    onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
                    className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                    placeholder="Cardiology"
                  />
                </label>
              )}
              <label className="block">
                <span className="font-bold">Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="At least 6 characters"
                />
              </label>
              <label className="block">
                <span className="font-bold">Confirm Password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none"
                  placeholder="Re-enter your password"
                />
              </label>
              {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
              <Button type="submit" disabled={loading} className="h-16 w-full text-xl disabled:opacity-60">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
            <p className="mt-10 text-center text-slate-600">
              Already have an account? <Link href="/login" className="font-bold text-[#0755d9]">Log in</Link>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function departmentUtilization(appointments: Appointment[]): Array<{ department: string; waiting: number; percent: number }> {
  const waiting = appointments.filter((a) => a.status === "waiting");
  const counts = new Map<string, number>();
  waiting.forEach((a) => {
    const department = a.doctor?.department ?? "Unassigned";
    counts.set(department, (counts.get(department) ?? 0) + 1);
  });
  const total = waiting.length || 1;
  return Array.from(counts.entries())
    .map(([department, count]) => ({ department, waiting: count, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.waiting - a.waiting)
    .slice(0, 4);
}

export function AdminDashboardPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();
  const analytics = useHospitalAnalytics(appointments, doctors);

  const waitingCount = appointments.filter((a) => a.status === "waiting").length;
  const criticalCount = appointments.filter((a) => a.priority <= 2 && a.status === "waiting").length;
  const utilization = departmentUtilization(appointments);
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const onDuty = doctors.filter((d) => d.status === "available").slice(0, 4);

  return (
    <DashboardShell role="admin" active="Dashboard">
      <PageTitle
        title="Analytics Overview"
        subtitle="Live hospital performance metrics."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="+" label="Total Doctors" value={String(doctors.length)} />
        <MetricCard icon="O" label="Appointments Today" value={String(appointments.length)} tone="green" />
        <MetricCard icon="!" label="Average Wait" value={waitingCount ? `${analytics.avgWaitMinutes}m` : "--"} tone="orange" />
        <MetricCard icon="!" label="Critical Cases" value={String(criticalCount)} tone="red" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Queue Length Trend" subtitle="Appointments booked today, by hour"><BarChart values={normalizeToHeights(analytics.hourlyVolume)} /></Panel>
        <Panel title="Hospital Utilization" subtitle="Share of waiting queue by department">
          <div className="space-y-5">
            {utilization.length === 0 ? (
              <EmptyState label="No patients waiting." />
            ) : (
              utilization.map(({ department, waiting, percent }) => (
                <div key={department}><div className="mb-2 flex justify-between"><span>{department}</span><b>{waiting} waiting</b></div><Progress value={percent} /></div>
              ))
            )}
            <Link href="/reception/appointments"><Button variant="secondary" className="w-full">View Department Details</Button></Link>
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Doctor Management" subtitle="Live status and performance ratings" action={<Link href="/admin/staff" className="font-bold text-[#0755d9]">View All</Link>}>
          <DoctorTable doctors={doctors} />
        </Panel>
        <Panel title="Recent Activity">
          {recentAppointments.length === 0 ? (
            <EmptyState label="No recent activity." />
          ) : (
            <div className="space-y-5">
              {recentAppointments.map((appointment) => (
                <div key={appointment._id} className="flex gap-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${appointment.status === "completed" ? "bg-emerald-100 text-emerald-700" : appointment.status === "serving" ? "bg-blue-100 text-[#0755d9]" : "bg-orange-100 text-orange-700"}`}>✓</span>
                  <div>
                    <b>{appointment.status === "completed" ? `Completed: ${appointment.patientName}` : appointment.status === "serving" ? `In consultation: ${appointment.patientName}` : `Check-in: ${appointment.patientName}`}</b>
                    <p className="text-sm text-slate-700">Token #{appointment.tokenNumber} - {appointment.doctor?.user?.name ?? "Unassigned"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
      <Panel title="Doctors on Duty" className="mt-6">
        {onDuty.length === 0 ? (
          <EmptyState label="No doctors currently available." />
        ) : (
          <div className="grid gap-6 md:grid-cols-4">
            {onDuty.map((doctor) => (
              <div key={doctor._id} className="flex items-center gap-4 rounded-xl border border-[#d7dbea] p-4">
                <Avatar name={doctor.user.name} className="h-12 w-12" />
                <div><b>{doctor.user.name}</b><p className="text-sm text-slate-600">{doctor.department}</p></div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}

function DoctorTable({ doctors }: { doctors: Doctor[] }) {
  return (
    <div className="-m-6 overflow-hidden">
      <div className="grid grid-cols-4 bg-[#f0f1fb] px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700">
        <span>Practitioner</span><span>Department</span><span>Status</span><span className="text-right">Avg. Cons.</span>
      </div>
      {doctors.length === 0 ? (
        <div className="border-t border-[#d7dbea] p-6"><EmptyState label="No practitioners on record yet." /></div>
      ) : (
        doctors.map((doctor) => (
          <div key={doctor._id} className="grid grid-cols-4 items-center border-t border-[#d7dbea] px-6 py-5">
            <div className="flex items-center gap-3"><Avatar name={doctor.user.name} className="h-11 w-11" /><b>{doctor.user.name}</b></div>
            <span>{doctor.department}</span>
            <StatusPill tone={doctor.status === "available" ? "green" : doctor.status === "on_leave" ? "orange" : "slate"}>{doctor.status.replace("_", " ")}</StatusPill>
            <b className="text-right">{doctor.avgConsultationTime}m</b>
          </div>
        ))
      )}
    </div>
  );
}

function matchesSearch(appointment: Appointment, term: string): boolean {
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return (
    appointment.patientName.toLowerCase().includes(needle) ||
    appointment.appointmentCode.toLowerCase().includes(needle) ||
    String(appointment.tokenNumber).includes(needle) ||
    (appointment.doctor?.user?.name ?? "").toLowerCase().includes(needle)
  );
}

export function AppointmentManagementPage() {
  const { data: appointments = [], isLoading } = useAppointments();
  const [search, setSearch] = useState("");

  const waiting = appointments.filter((a) => a.status === "waiting");
  const urgent = appointments.filter((a) => a.priority <= 2).length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const completionRate = appointments.length ? Math.round((completed / appointments.length) * 100) : 0;
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((sum, a) => sum + a.estimatedWait, 0) / waiting.length)
    : 0;
  const barValues = appointments.length
    ? appointments.slice(0, 10).map((appointment) => Math.max(24, Math.min(96, appointment.estimatedWait * 4 || 28)))
    : [38, 62, 48, 82, 67, 57, 43, 33, 52, 72];
  const visibleAppointments = appointments.filter((a) => matchesSearch(a, search));

  return (
    <DashboardShell role="receptionist" active="Appointments" searchPlaceholder="Search appointments, patients..." searchValue={search} onSearchChange={setSearch}>
      <PageTitle
        title="Appointment Management"
        subtitle="Real-time scheduling and patient flow optimization."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ReceptionMetric icon="♚" label="Total Scheduled" value={String(appointments.length || 0)} delta="+12%" tone="blue" />
        <ReceptionMetric icon="⌛" label="Avg. Wait Time" value={waiting.length ? `${avgWait} min` : "--"} delta={waiting.length ? "-4m" : "0m"} tone="green" />
        <ReceptionMetric icon="!" label="Urgent Cases" value={String(urgent)} delta={urgent ? "High" : "Low"} tone="orange" />
        <ReceptionMetric icon="⊙" label="Completion Rate" value={appointments.length ? `${completionRate}%` : "--"} delta={appointments.length ? `${completionRate}%` : "--"} tone="slate" />
      </div>
      {isLoading ? (
        <div className="mt-7 rounded-xl border border-[#c4c9dc] bg-white p-6"><EmptyState label="Loading appointments..." /></div>
      ) : (
        <AppointmentTable appointments={visibleAppointments} />
      )}
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-xl border border-[#d7dbea] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Queue Volume Trends</h2>
          <AppointmentBarChart values={barValues} />
        </section>
        <DepartmentOverview appointments={appointments} />
      </div>
    </DashboardShell>
  );
}

function ReceptionMetric({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: string;
  label: string;
  value: string;
  delta: string;
  tone: "blue" | "green" | "orange" | "slate";
}) {
  const tones = {
    blue: "bg-blue-100 text-[#0755d9]",
    green: "bg-emerald-100 text-emerald-800",
    orange: "bg-orange-100 text-orange-800",
    slate: "bg-slate-100 text-slate-700",
  };
  const deltaTone = tone === "orange" ? "text-red-700" : tone === "green" ? "text-emerald-800" : "text-[#0755d9]";

  return (
    <section className="rounded-xl border border-[#dfe3ef] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-lg text-lg font-black ${tones[tone]}`}>{icon}</span>
        <span className={`text-base font-medium ${deltaTone}`}>{delta}</span>
      </div>
      <div className="mt-5 text-sm font-medium text-slate-700">{label}</div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </section>
  );
}

function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(appointments.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const rows = appointments.slice(startIndex, startIndex + pageSize);
  const visiblePages = getVisiblePages(safePage, pageCount);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, pageCount)));
  };

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[1.25fr_1.15fr_.85fr_.7fr_1.1fr_.7fr_.35fr] bg-[#fbfaff] px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-700">
          <span>Patient</span><span>Doctor</span><span>Priority</span><span>Token</span><span>Status</span><span>Est. Wait</span><span>Actions</span>
        </div>
        {rows.length === 0 ? (
          <div className="border-t border-[#d7dbea] p-6"><EmptyState label="No appointments scheduled yet." /></div>
        ) : (
          rows.map((appointment) => (
            <div key={appointment._id} className="grid grid-cols-[1.25fr_1.15fr_.85fr_.7fr_1.1fr_.7fr_.35fr] items-center border-t border-[#d7dbea] px-6 py-5">
              <div className="flex items-center gap-4">
                <Avatar name={appointment.patientName} className="h-11 w-11 border-0 bg-[#eef0fb]" />
                <div>
                  <b>{appointment.patientName}</b>
                  <p className="text-sm text-slate-600">ID: #{appointment.tokenNumber.toString().padStart(5, "0")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Avatar name={appointment.doctor?.user?.name ?? "Doctor"} className="h-8 w-8 border-0 grayscale" />
                <span>{appointment.doctor?.user?.name ?? "Unassigned"}</span>
              </div>
              <AppointmentPriority priority={appointment.priority} />
              <b className="text-[#0755d9]">A-{appointment.tokenNumber.toString().padStart(2, "0")}</b>
              <AppointmentStatus status={appointment.status} />
              <b className={appointment.status === "waiting" ? "text-red-700" : "text-slate-600"}>{appointment.status === "waiting" ? `${appointment.estimatedWait} min` : "--"}</b>
              <button className="text-2xl font-black text-slate-700" aria-label={`Actions for ${appointment.patientName}`}>⋮</button>
            </div>
          ))
        )}
      </div>
      {appointments.length > 0 && (
        <div className="flex flex-col gap-4 border-t border-[#d7dbea] px-6 py-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
          <span>Showing {startIndex + 1} to {Math.min(startIndex + pageSize, appointments.length)} of {appointments.length} appointments</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage === 1}
              onClick={() => goToPage(safePage - 1)}
              className="grid h-10 min-w-10 place-items-center rounded-lg border border-[#c4c9dc] bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Previous page"
            >
              ‹
            </button>
            {visiblePages.map((page, index) => (
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="grid h-10 min-w-10 place-items-center rounded-lg border border-[#c4c9dc] bg-white px-3 font-bold text-slate-700">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`grid h-10 min-w-10 place-items-center rounded-lg border border-[#c4c9dc] px-3 font-bold ${page === safePage ? "bg-[#0755d9] text-white" : "bg-white text-slate-700"}`}
                  aria-current={page === safePage ? "page" : undefined}
                >
                  {page}
                </button>
              )
            ))}
            <button
              type="button"
              disabled={safePage === pageCount}
              onClick={() => goToPage(safePage + 1)}
              className="grid h-10 min-w-10 place-items-center rounded-lg border border-[#c4c9dc] bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function getVisiblePages(currentPage: number, pageCount: number): Array<number | "..."> {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, "...", pageCount];
  }

  if (currentPage >= pageCount - 2) {
    return [1, "...", pageCount - 2, pageCount - 1, pageCount];
  }

  return [1, "...", currentPage, "...", pageCount];
}

function AppointmentPriority({ priority }: { priority: number }) {
  if (priority <= 1) {
    return <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-700">Urgent</span>;
  }
  if (priority <= 2) {
    return <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wide text-orange-800">High</span>;
  }
  return <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-700">Normal</span>;
}

function AppointmentStatus({ status }: { status: Appointment["status"] }) {
  const labels: Record<Appointment["status"], string> = {
    waiting: "Waiting",
    serving: "In Consultation",
    completed: "Checked Out",
    cancelled: "Cancelled",
  };
  const tones: Record<Appointment["status"], string> = {
    waiting: "bg-blue-100 text-[#0755d9]",
    serving: "bg-emerald-100 text-emerald-800",
    completed: "bg-slate-200 text-slate-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${tones[status]}`}>
      <span className="mr-2">●</span>{labels[status]}
    </span>
  );
}

function AppointmentBarChart({ values }: { values: number[] }) {
  return (
    <div className="mt-8">
      <div className="flex h-56 items-end gap-2 sm:gap-4">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`flex-1 rounded-t-lg ${index === 3 ? "bg-[#9bb7e8]" : "bg-[#c7d7f2]"}`}
            style={{ height: `${Math.max(16, Math.min(100, value))}%` }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 text-sm text-slate-700">
        <span>08:00 AM</span>
        <span className="text-center">12:00 PM</span>
        <span className="text-center">04:00 PM</span>
        <span className="text-right">08:00 PM</span>
      </div>
    </div>
  );
}

function DepartmentOverview({ appointments }: { appointments: Appointment[] }) {
  const counts = appointments.reduce<Record<string, number>>((acc, appointment) => {
    const department = appointment.doctor?.department ?? "Unassigned";
    acc[department] = (acc[department] ?? 0) + 1;
    return acc;
  }, {});
  const departments = Object.entries(counts).slice(0, 3);
  const rows = departments.length
    ? departments
    : [["Cardiology", 12], ["Neurology", 8], ["Pediatrics", 15]] as [string, number][];
  const tones: Array<"blue" | "green" | "orange"> = ["blue", "green", "orange"];
  const max = Math.max(...rows.map(([, count]) => count), 1);

  return (
    <section className="relative rounded-xl border border-[#d7dbea] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">Department Overview</h2>
      <div className="mt-6 space-y-6">
        {rows.map(([department, count], index) => (
          <div key={department}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-slate-700">{department}</span>
              <b>{count} Appointments</b>
            </div>
            <Progress value={(count / max) * 100} tone={tones[index] ?? "blue"} />
          </div>
        ))}
      </div>
      <Link href="/reception/dashboard#book-appointment" className="absolute bottom-[-22px] right-[-1px] grid h-16 w-16 place-items-center rounded-full bg-[#0755d9] text-4xl leading-none text-white shadow-lg" aria-label="Book appointment">
        +
      </Link>
    </section>
  );
}

function DoctorEditForm({
  doctor,
  onDone,
}: {
  doctor: Doctor;
  onDone: () => void;
}) {
  const updateDoctor = useUpdateDoctor();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    department: doctor.department,
    specialty: doctor.specialty,
    room: doctor.room,
    consultationFee: String(doctor.consultationFee),
    avgConsultationTime: String(doctor.avgConsultationTime),
    startTime: doctor.startTime,
    endTime: doctor.endTime,
    status: doctor.status,
  });

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await updateDoctor.mutateAsync({
        id: doctor._id,
        payload: {
          department: form.department,
          specialty: form.specialty,
          room: form.room,
          consultationFee: Number(form.consultationFee),
          avgConsultationTime: Number(form.avgConsultationTime),
          startTime: form.startTime,
          endTime: form.endTime,
          status: form.status as Doctor["status"],
        },
      });
      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-7">
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm"><span className="font-bold">Department</span><input required value={form.department} onChange={updateField("department")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">Specialty</span><input required value={form.specialty} onChange={updateField("specialty")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">Room</span><input required value={form.room} onChange={updateField("room")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">Status</span>
          <select value={form.status} onChange={updateField("status")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3">
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="on_leave">On Leave</option>
          </select>
        </label>
        <label className="block text-sm"><span className="font-bold">Avg. Consultation (min)</span><input required type="number" min={5} value={form.avgConsultationTime} onChange={updateField("avgConsultationTime")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">Consultation Fee</span><input required type="number" min={0} value={form.consultationFee} onChange={updateField("consultationFee")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">Start Time</span><input required value={form.startTime} onChange={updateField("startTime")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
        <label className="block text-sm"><span className="font-bold">End Time</span><input required value={form.endTime} onChange={updateField("endTime")} className="mt-1 h-10 w-full rounded-lg border border-[#c4c9dc] px-3" /></label>
      </div>
      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={updateDoctor.isPending} className="disabled:opacity-60">{updateDoctor.isPending ? "Saving..." : "Save Changes"}</Button>
      </div>
    </form>
  );
}

export function StaffDirectoryPage({ role = "admin" }: { role?: "admin" | "receptionist" }) {
  const { data: doctors = [], isLoading } = useDoctors();
  const createDoctor = useCreateDoctor();
  const deleteDoctor = useDeleteDoctor();
  const canManageDoctors = role === "admin";
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    specialty: "",
    room: "",
    consultationFee: "0",
    avgConsultationTime: "15",
    startTime: "09:00",
    endTime: "17:00",
  });

  const available = doctors.filter((d) => d.status === "available").length;
  const onLeave = doctors.filter((d) => d.status === "on_leave").length;
  const visibleDoctors = search.trim()
    ? doctors.filter((doctor) => {
        const needle = search.trim().toLowerCase();
        return (
          doctor.user.name.toLowerCase().includes(needle) ||
          doctor.department.toLowerCase().includes(needle) ||
          doctor.specialty.toLowerCase().includes(needle)
        );
      })
    : doctors;

  const updateField = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await createDoctor.mutateAsync({
        user: { name: form.name, email: form.email, password: form.password },
        department: form.department,
        specialty: form.specialty,
        room: form.room,
        consultationFee: Number(form.consultationFee),
        avgConsultationTime: Number(form.avgConsultationTime),
        workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setOpen(false);
      setForm({ name: "", email: "", password: "", department: "", specialty: "", room: "", consultationFee: "0", avgConsultationTime: "15", startTime: "09:00", endTime: "17:00" });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <DashboardShell role={role} active="Doctors" searchPlaceholder="Search medical staff..." searchValue={search} onSearchChange={setSearch}>
      <PageTitle
        title="Medical Staff Directory"
        subtitle="View department heads, clinicians, and surgical teams in real-time."
        actions={canManageDoctors ? <Button onClick={() => setOpen((v) => !v)}>{open ? "Cancel" : "Add Doctor"}</Button> : undefined}
      />

      {canManageDoctors && open && (
        <Panel title="Add Doctor" className="mb-7">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="font-bold">Full Name</span><input required value={form.name} onChange={updateField("name")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="Dr. Jane Doe" /></label>
            <label className="block"><span className="font-bold">Email</span><input required type="email" value={form.email} onChange={updateField("email")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="jane.doe@cortexmed.ai" /></label>
            <label className="block"><span className="font-bold">Temporary Password</span><input required type="password" minLength={6} value={form.password} onChange={updateField("password")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="At least 6 characters" /></label>
            <label className="block"><span className="font-bold">Department</span><input required value={form.department} onChange={updateField("department")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="Cardiology" /></label>
            <label className="block"><span className="font-bold">Specialty</span><input required value={form.specialty} onChange={updateField("specialty")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="Interventional Cardiology" /></label>
            <label className="block"><span className="font-bold">Room</span><input required value={form.room} onChange={updateField("room")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="RM 402" /></label>
            <label className="block"><span className="font-bold">Avg. Consultation (min)</span><input required type="number" min={5} value={form.avgConsultationTime} onChange={updateField("avgConsultationTime")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" /></label>
            <label className="block"><span className="font-bold">Consultation Fee</span><input required type="number" min={0} value={form.consultationFee} onChange={updateField("consultationFee")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" /></label>
            <label className="block"><span className="font-bold">Start Time</span><input required value={form.startTime} onChange={updateField("startTime")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="09:00" /></label>
            <label className="block"><span className="font-bold">End Time</span><input required value={form.endTime} onChange={updateField("endTime")} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] px-4" placeholder="17:00" /></label>
            {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
            <div className="md:col-span-2 flex justify-end gap-4">
              <Button type="submit" disabled={createDoctor.isPending} className="disabled:opacity-60">{createDoctor.isPending ? "Adding..." : "Add Doctor"}</Button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-6 md:grid-cols-4">
        {[["Total Staff", doctors.length], ["Available", available], ["On Leave", onLeave], ["Unavailable", doctors.length - available - onLeave]].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-[#c4c9dc] bg-[#f3f4ff] p-7"><div className="text-sm font-black uppercase tracking-widest">{label}</div><div className="mt-4 text-4xl font-black text-[#0755d9]">{value}</div></div>
        ))}
      </div>
      <div className="mt-8">
        {isLoading ? (
          <EmptyState label="Loading staff directory..." />
        ) : visibleDoctors.length === 0 ? (
          <EmptyState label={doctors.length === 0 ? "No staff members added yet." : "No staff match your search."} />
        ) : (
          <div className="grid gap-7 xl:grid-cols-3">
            {visibleDoctors.map((doctor) => (
              <div key={doctor._id} className="overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
                {editingId === doctor._id ? (
                  <DoctorEditForm doctor={doctor} onDone={() => setEditingId(null)} />
                ) : (
                  <>
                    <div className="relative h-48 bg-gradient-to-br from-sky-200 via-slate-100 to-blue-200">
                      <StatusPill tone={doctor.status === "available" ? "green" : doctor.status === "on_leave" ? "orange" : "slate"}>{doctor.status.replace("_", " ")}</StatusPill>
                    </div>
                    <div className="p-7">
                      <div className="flex justify-between"><h2 className="text-2xl font-black">{doctor.user.name}</h2><span className="rounded-lg bg-[#e8e9f5] px-4 py-2 font-bold">{doctor.room}</span></div>
                      <p className="mt-2 font-bold text-[#0755d9]">{doctor.department} - {doctor.specialty}</p>
                      <div className="mt-6 grid grid-cols-2 border-t border-[#d7dbea] pt-5"><div><b className="text-slate-500">WORKING HOURS</b><p>{doctor.startTime} - {doctor.endTime}</p></div><div><b className="text-slate-500">AVG. CONSULT</b><p>{doctor.avgConsultationTime} mins</p></div></div>
                      {deleteError && deleteDoctor.variables === doctor._id && (
                        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{deleteError}</p>
                      )}
                      <div className="mt-7 flex gap-4">
                        <Button variant="secondary">Profile</Button>
                        {canManageDoctors && (
                          <>
                            <Button variant="secondary" onClick={() => setEditingId(doctor._id)}>Edit</Button>
                            <Button
                              variant="secondary"
                              disabled={deleteDoctor.isPending}
                              onClick={async () => {
                                if (!window.confirm(`Remove ${doctor.user.name} from the staff directory?`)) return;
                                setDeleteError(null);
                                try {
                                  await deleteDoctor.mutateAsync(doctor._id);
                                } catch (err) {
                                  setDeleteError(getErrorMessage(err));
                                }
                              }}
                              className="disabled:opacity-60"
                            >
                              Del
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function SpecialistPerformanceTable({ rows }: { rows: DoctorPerformanceRow[] }) {
  if (rows.length === 0) {
    return <EmptyState label="No practitioners on record yet." />;
  }
  return (
    <div className="-m-6 overflow-hidden">
      <div className="grid grid-cols-3 bg-[#f0f1fb] px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700">
        <span>Practitioner</span><span>Department</span><span className="text-right">Patients Seen</span>
      </div>
      {rows.map((row) => (
        <div key={row.doctorId} className="grid grid-cols-3 items-center border-t border-[#d7dbea] px-6 py-5">
          <div className="flex items-center gap-3"><Avatar name={row.name} className="h-11 w-11" /><b>{row.name}</b></div>
          <span>{row.department}</span>
          <b className="text-right">{row.patientsSeen}</b>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();
  const analytics = useHospitalAnalytics(appointments, doctors);
  const [search, setSearch] = useState("");

  const waiting = appointments.filter((a) => a.status === "waiting");
  const { critical, high: highPriority, routine } = analytics.priorityBreakdown;
  const visiblePerformance = search.trim()
    ? analytics.doctorPerformance.filter((row) =>
        row.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        row.department.toLowerCase().includes(search.trim().toLowerCase())
      )
    : analytics.doctorPerformance;

  return (
    <DashboardShell role="admin" active="Analytics" searchPlaceholder="Search practitioners..." searchValue={search} onSearchChange={setSearch}>
      <PageTitle title="Hospital Analytics" subtitle="System performance and patient flow metrics." />
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Daily Patients" value={String(appointments.length)} tone="blue" />
        <MetricCard icon="O" label="Avg Wait Time" value={waiting.length ? `${analytics.avgWaitMinutes}m` : "--"} tone="orange" />
        <MetricCard icon="B" label="Doctor Availability" value={doctors.length ? `${analytics.doctorAvailabilityPercent}%` : "--"} tone="green" />
        <MetricCard icon="Z" label="ER Efficiency" value={`${analytics.erEfficiencyPercent}%`} tone="blue" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Average Wait Time Trend" subtitle="Actual check-in to consult time, by hour"><BarChart values={normalizeToHeights(analytics.waitTimeTrend)} /></Panel>
        <Panel title="Priority Distribution" subtitle="Critical vs Non-emergency cases">
          <Donut total={String(appointments.length)} />
          <div className="mt-8 space-y-4">
            <div className="flex justify-between"><span>Critical</span><b>{critical}</b></div>
            <div className="flex justify-between"><span>High Priority</span><b>{highPriority}</b></div>
            <div className="flex justify-between"><span>Routine</span><b>{routine}</b></div>
          </div>
        </Panel>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <Panel title="Queue Utilization" subtitle="Booking density by weekday and hour">
          <HeatMap data={analytics.weeklyHeatmap} rowLabels={WEEKDAY_LABELS} columnLabels={HOUR_BUCKET_LABELS} />
        </Panel>
        <Panel title="Specialist Performance" subtitle="Patients seen per practitioner">
          <SpecialistPerformanceTable rows={visiblePerformance} />
        </Panel>
      </div>
    </DashboardShell>
  );
}

export function ReceptionDashboardPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();
  const currentUser = useAuthStore((state) => state.user);

  const waiting = appointments.filter((a) => a.status === "waiting");
  const critical = waiting.filter((a) => a.priority <= 2);
  const available = doctors.filter((d) => d.status === "available");
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((sum, a) => sum + a.estimatedWait, 0) / waiting.length)
    : 0;

  const [queueSearch, setQueueSearch] = useState("");
  const visibleWaiting = queueSearch.trim()
    ? waiting.filter((a) => a.patientName.toLowerCase().includes(queueSearch.trim().toLowerCase()))
    : waiting;

  const [form, setForm] = useState({ patientName: "", age: "", gender: "male", phone: "", doctor: "", symptoms: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Appointment | null>(null);

  const resetForm = () => setForm({ patientName: "", age: "", gender: "male", phone: "", doctor: "", symptoms: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const appointment = await createAppointment.mutateAsync({
        patientName: form.patientName,
        age: Number(form.age),
        gender: form.gender as "male" | "female" | "other",
        phone: form.phone,
        doctor: form.doctor,
        symptoms: form.symptoms,
      });
      setSuccess(appointment);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <FrontDeskDashboardShell userName={currentUser?.name ?? "Front Desk"} searchValue={queueSearch} onSearchChange={setQueueSearch}>
      <div className="mb-7">
        <h1 className="text-4xl font-black tracking-tight">Analytics Overview</h1>
        <p className="mt-1 text-lg text-slate-700">Hospital performance metrics for today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <FrontDeskMetric icon="▣" label="Total Doctors" value={String(doctors.length)} delta={`${available.length} available`} tone="blue" progress={doctors.length ? Math.round((available.length / doctors.length) * 100) : 0} />
        <FrontDeskMetric icon="◷" label="Appointments Today" value={String(appointments.length)} delta={`${waiting.length} waiting`} tone="green" progress={appointments.length ? Math.round((waiting.length / appointments.length) * 100) : 0} />
        <FrontDeskMetric icon="⏱" label="Average Wait" value={waiting.length ? `${avgWait}m` : "--"} delta={avgWait ? `${avgWait}m` : "Stable"} tone="orange" progress={Math.min(100, avgWait * 4)} />
        <FrontDeskMetric icon="△" label="Critical Cases" value={String(critical.length)} delta={critical.length ? "Immediate" : "Stable"} tone="red" progress={appointments.length ? Math.round((critical.length / appointments.length) * 100) : 0} />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <FrontDeskCard title="Book New Patient" id="book-appointment">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="font-bold">Patient Full Name</span><input required value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="e.g. Johnathan Smith" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="font-bold">Age</span><input required type="number" min={0} value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="Years" /></label>
              <label className="block"><span className="font-bold">Gender</span>
                <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4">
                  <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                </select>
              </label>
            </div>
            <label className="block"><span className="font-bold">Phone Number</span><input required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="+1 (555) 000-0000" /></label>
            <label className="block"><span className="font-bold">Assigned Doctor</span>
              <select required value={form.doctor} onChange={(e) => setForm((p) => ({ ...p, doctor: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4">
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.user.name} - {doctor.department}</option>)}
              </select>
            </label>
            <label className="block md:col-span-2"><span className="font-bold">Symptoms & Primary Complaint</span><textarea required value={form.symptoms} onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))} className="mt-2 h-32 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] p-4" placeholder="Brief description of the patient's condition..." /></label>
            {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
            {success && (
              <div className="md:col-span-2 space-y-3">
                <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Booked - token #{success.tokenNumber}, code {success.appointmentCode}.{" "}
                  <Link href={`/track/${success.appointmentCode}`} className="underline" target="_blank">Open patient tracking link</Link>
                </p>
                <AiExplainability appointment={success} />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={resetForm}>Clear Form</Button>
              <Button type="submit" disabled={createAppointment.isPending} className="disabled:opacity-60">{createAppointment.isPending ? "Booking..." : "Book Patient Entry"}</Button>
            </div>
          </form>
        </FrontDeskCard>
        <FrontDeskCard title="Live Queue" action={<StatusPill>{waiting.length} Live</StatusPill>}>
          <LiveQueueCards patients={visibleWaiting.slice(0, 5)} />
        </FrontDeskCard>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <FrontDeskDoctorManagement doctors={doctors} />
        <FrontDeskRecentActivity appointments={appointments.slice(0, 5)} />
      </div>

      <FrontDeskReceptionSupport currentUserName={currentUser?.name ?? "Front Desk"} />
    </FrontDeskDashboardShell>
  );
}

function FrontDeskDashboardShell({
  children,
  userName,
  searchValue,
  onSearchChange,
}: {
  children: ReactNode;
  userName: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    clearSession();
    router.replace(ROUTES.LOGIN);
  };

  const nav = [
    { label: "Dashboard", href: "/reception/dashboard", icon: "▦" },
    { label: "Appointments", href: "/reception/appointments", icon: "▤" },
    { label: "Doctors", href: "/reception/doctors", icon: "▣" },
    { label: "Queue", href: "/reception/queue", icon: "◉" },
    { label: "Analytics", href: "/reception/dashboard", icon: "▥" },
    { label: "Settings", href: "#", icon: "⚙" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6ff] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[280px] border-r border-[#c4c9dc] bg-[#f0f2ff] lg:flex lg:flex-col">
        <div className="flex h-[82px] items-center gap-3 px-7">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#0755d9] text-white">▣</span>
          <div><div className="text-xl font-black text-[#004bd1]">CortexMed</div><div className="text-sm">Smart Hospital Platform</div></div>
        </div>
        <nav className="flex-1 space-y-3 px-4 pt-8">
          {nav.map((item) => (
            <Link key={item.label} href={item.href} className={`flex h-12 items-center gap-4 rounded-lg px-5 ${item.label === "Dashboard" ? "bg-[#2563eb] font-bold text-white" : "text-slate-800 hover:bg-white"}`}>
              <span className="grid h-6 w-6 place-items-center text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#c4c9dc] p-4">
          <Link href="#" className="flex h-11 items-center gap-4 px-4 text-slate-700">? Help Center</Link>
          <button onClick={handleLogout} className="flex h-11 w-full items-center gap-4 px-4 text-left text-red-600">↪ Logout</button>
        </div>
      </aside>

      <header className="sticky top-0 z-10 border-b border-[#c4c9dc] bg-[#fbfaff] lg:ml-[280px]">
        <div className="flex h-[64px] items-center gap-5 px-6">
          <div className="relative w-full max-w-[390px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
            <input
              className="h-10 w-full rounded-full border border-[#c4c9dc] bg-[#f0f1fb] pl-11 pr-4 outline-none"
              placeholder="Search live queue by patient name..."
              value={searchValue ?? undefined}
              onChange={onSearchChange ? (event) => onSearchChange(event.target.value) : undefined}
            />
          </div>
          <div className="ml-auto flex items-center gap-5 text-xl">
            <NotificationBell />
            <span className="h-8 w-px bg-[#c4c9dc]" />
            <div className="hidden text-right text-sm sm:block"><b>{userName}</b><div>Front Desk Officer</div></div>
            <Avatar name={userName} className="h-10 w-10" />
          </div>
        </div>
      </header>

      <main className="lg:ml-[280px]">
        <div className="mx-auto max-w-[960px] px-6 py-7 xl:max-w-[1180px]">{children}</div>
        <footer className="mt-10 border-t border-[#c4c9dc] bg-[#dfe3ef] px-8 py-7">
          <div className="mx-auto flex max-w-[1180px] flex-col gap-4 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
            <div><div className="text-xl font-black text-[#004bd1]">CortexMed</div>© 2024 CortexMed AI Hospital Systems. All rights reserved.</div>
            <div className="flex gap-7"><span>Privacy Policy</span><span>Terms of Service</span><span>Compliance</span><span>Security</span></div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FrontDeskCard({ title, children, action, id }: { title: string; children: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#d7dbea] px-6 py-5">
        <h2 className="text-2xl font-black">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function FrontDeskMetric({ icon, label, value, delta, tone, progress }: { icon: string; label: string; value: string; delta: string; tone: "blue" | "green" | "orange" | "red"; progress: number }) {
  const tones = {
    blue: "bg-blue-100 text-[#0755d9] bg-[#0755d9]",
    green: "bg-emerald-100 text-emerald-800 bg-emerald-700",
    orange: "bg-orange-100 text-orange-800 bg-orange-700",
    red: "bg-red-100 text-red-800 bg-red-700",
  };
  const [soft, text, bar] = tones[tone].split(" ");

  return (
    <section className="rounded-xl border border-[#c4c9dc] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`grid h-14 w-14 place-items-center rounded-lg text-xl ${soft} ${text}`}>{icon}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${soft} ${text}`}>{delta}</span>
      </div>
      <div className="mt-5 text-slate-700">{label}</div>
      <div className="text-3xl font-black">{value}</div>
      <div className="mt-5 h-1 rounded-full bg-[#e7e9f5]"><div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(4, Math.min(100, progress))}%` }} /></div>
    </section>
  );
}

function FrontDeskDoctorManagement({ doctors }: { doctors: Doctor[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <div><h2 className="text-2xl font-black">Doctor Management</h2><p className="text-slate-700">Live status and performance ratings</p></div>
        <Link href="/reception/doctors" className="font-bold text-[#0755d9]">View All</Link>
      </div>
      <div className="grid grid-cols-[1.5fr_1fr_1fr_.8fr] bg-[#f0f1fb] px-6 py-4 text-xs font-black uppercase tracking-widest">
        <span>Practitioner</span><span>Department</span><span>Status</span><span className="text-right">Avg. Cons.</span>
      </div>
      {doctors.length === 0 ? (
        <div className="p-6"><EmptyState label="No doctors registered yet." /></div>
      ) : doctors.slice(0, 5).map((doctor) => (
        <div key={doctor._id} className="grid grid-cols-[1.5fr_1fr_1fr_.8fr] items-center border-t border-[#d7dbea] px-6 py-5">
          <div className="flex items-center gap-4"><Avatar name={doctor.user.name} className="h-10 w-10" /><b>{doctor.user.name}</b></div>
          <span>{doctor.department}</span>
          <StatusPill tone={doctor.status === "available" ? "green" : doctor.status === "on_leave" ? "orange" : "slate"}>{doctor.status.replace("_", " ")}</StatusPill>
          <b className="text-right">{doctor.avgConsultationTime}m</b>
        </div>
      ))}
    </section>
  );
}

function FrontDeskRecentActivity({ appointments }: { appointments: Appointment[] }) {
  const activities = appointments.map((appointment) => ({
    title: appointment.status === "completed" ? `Completed: ${appointment.patientName}` : appointment.status === "serving" ? `In consultation: ${appointment.patientName}` : `Check-in: ${appointment.patientName}`,
    detail: `${appointment.symptoms} · Token #${appointment.tokenNumber}`,
    time: new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.createdAt)),
    tone: appointment.status === "completed" ? "bg-emerald-100 text-emerald-700" : appointment.status === "serving" ? "bg-blue-100 text-[#0755d9]" : "bg-orange-100 text-orange-700",
  }));

  return (
    <section className="overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
      <div className="border-b border-[#d7dbea] px-6 py-5"><h2 className="text-2xl font-black">Recent Activity</h2></div>
      <div className="space-y-5 p-6">
        {activities.length === 0 ? <EmptyState label="No recent activity yet." /> : activities.map((activity) => (
          <div key={`${activity.title}-${activity.time}`} className="flex gap-4">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${activity.tone}`}>✓</span>
            <div><b>{activity.title}</b><p className="text-sm text-slate-700">{activity.detail}</p><span className="text-xs font-bold uppercase text-slate-500">{activity.time}</span></div>
          </div>
        ))}
      </div>
      <Link href="/reception/appointments" className="block border-t border-[#d7dbea] py-4 text-center font-bold">View History</Link>
    </section>
  );
}

function FrontDeskReceptionSupport({ currentUserName }: { currentUserName: string }) {
  const staff = [
    { name: currentUserName, role: "Front Desk A", online: true },
  ];

  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-2xl font-black">Reception & Support</h2>
        <div className="flex gap-5 text-sm"><span><b className="text-emerald-700">●</b> {staff.filter((item) => item.online).length} Online</span><span><b className="text-slate-300">●</b> 0 Away</span></div>
      </div>
      <div className="grid md:grid-cols-4">
        {staff.map((member) => (
          <div key={member.name} className="flex items-center gap-4 border-t border-[#d7dbea] px-6 py-6 md:border-r">
            <Avatar name={member.name} className="h-12 w-12" />
            <div><b>{member.name}</b><p className={member.online ? "font-bold text-emerald-700" : "text-slate-500"}>{member.role}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveQueueCards({ patients }: { patients: Appointment[] }) {
  if (patients.length === 0) {
    return <EmptyState label="No patients currently in the queue." />;
  }
  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient._id} className="rounded-xl border-l-4 border-[#0755d9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar name={patient.patientName} className="h-12 w-12" />
            <div className="flex-1"><b>{patient.patientName}</b><p className="text-sm text-slate-700">{patient.symptoms}</p></div>
            <StatusPill tone={priorityTone(patient.priority)}>P{patient.priority}</StatusPill>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LiveQueuePage() {
  const { data: doctors = [] } = useDoctors();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const activeDoctorId = selectedDoctorId || doctors[0]?._id || "";

  const { data: queue } = useQueue(activeDoctorId);
  const callNext = useCallNextPatient(activeDoctorId);
  const completePatient = useCompletePatient(activeDoctorId);

  const current = queue?.current ?? null;
  const waiting = queue?.waiting ?? [];
  const priorityCounts = [1, 2, 3, 4, 5].map(
    (priority) => waiting.filter((patient) => patient.priority === priority).length
  );
  const maxPriorityCount = Math.max(...priorityCounts, current ? 1 : 0);
  const patientVolumeValues = priorityCounts.map((count) =>
    count === 0 ? 0 : Math.max(12, Math.round((count / maxPriorityCount) * 100))
  );

  return (
    <DashboardShell role="receptionist" active="Queue" searchPlaceholder="Search patients or records...">
      <PageTitle
        title="Emergency Care Queue"
        subtitle="Real-time patient flow."
        actions={<><MetricCard icon="P" label="Current Queue" value={String(waiting.length)} /></>}
      />
      <div className="mb-6 flex items-center gap-4">
        <span className="font-bold">Doctor:</span>
        <select value={activeDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} className="h-11 rounded-lg border border-[#c4c9dc] px-4">
          {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.user.name} - {doctor.department}</option>)}
        </select>
      </div>
      <section className="rounded-xl bg-[#2563eb] p-8 text-white shadow-lg">
        {current ? (
          <div className="grid gap-8 lg:grid-cols-[160px_1fr_260px]">
            <Avatar name={current.patientName} className="h-36 w-36 border-white bg-white text-[#0755d9]" />
            <div><StatusPill tone="blue">Current Session</StatusPill><h2 className="mt-4 text-5xl font-black">{current.patientName}</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><b>{current.symptoms}</b><b>Priority P{current.priority}</b><b>Token #{current.tokenNumber}</b></div></div>
            <div className="space-y-4">
              <Button variant="secondary" disabled={completePatient.isPending} onClick={() => completePatient.mutate(current._id)} className="w-full disabled:opacity-60">{completePatient.isPending ? "Completing..." : "Mark Complete"}</Button>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-blue-50">No patient is currently in session.</div>
        )}
      </section>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black">Next in Line <StatusPill tone="slate">{waiting.length} Remaining</StatusPill></h2>
            <Button disabled={callNext.isPending || waiting.length === 0} onClick={() => callNext.mutate()} className="disabled:opacity-60">{callNext.isPending ? "Calling..." : "Call Next Patient"}</Button>
          </div>
          <div className="space-y-4">{waiting.map((patient) => <QueueRow key={patient._id} appointment={patient} />)}</div>
          {waiting.length === 0 && <div className="mt-5"><EmptyState label="New arrivals will appear here in real-time..." /></div>}
        </div>
        <div className="space-y-6">
          <Panel title="Patient Volume">
            <BarChart values={patientVolumeValues} />
            <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs font-black text-slate-500">
              {priorityCounts.map((count, index) => (
                <div key={index} className="rounded-lg bg-[#f0f1fb] px-2 py-2">
                  <span className="block text-[#0755d9]">P{index + 1}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Available Staff">
            {doctors.length === 0 ? <EmptyState label="No staff on duty yet." /> : (
              <div className="space-y-4">
                {doctors.slice(0, 5).map((doctor) => (
                  <div key={doctor._id} className="flex justify-between"><span>{doctor.user.name}</span><StatusPill tone={doctor.status === "available" ? "green" : "slate"}>{doctor.status.replace("_", " ")}</StatusPill></div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

function QueueRow({ appointment }: { appointment: Appointment }) {
  return (
    <div className="grid items-center gap-4 rounded-xl border border-[#c4c9dc] bg-white p-5 shadow-sm md:grid-cols-[72px_1fr_160px]">
      <Avatar name={appointment.patientName} className="h-14 w-14" />
      <div><div className="flex flex-wrap items-center gap-3"><b className="text-xl">{appointment.patientName}</b><StatusPill tone={priorityTone(appointment.priority)}>P{appointment.priority}</StatusPill></div><p className="mt-1 text-slate-700">{appointment.symptoms}</p></div>
      <b className="text-[#0755d9]">{appointment.estimatedWait} min</b>
    </div>
  );
}

export function DoctorDashboardPage({ active = "Dashboard" }: { active?: "Dashboard" | "My Queue" } = {}) {
  const user = useAuthStore((state) => state.user);
  const doctorId = user?.doctorId ?? null;

  const { data: queue } = useQueue(doctorId);
  const { data: doctorAppointments = [] } = useAppointments(doctorId ?? undefined);
  const callNext = useCallNextPatient(doctorId);
  const completePatient = useCompletePatient(doctorId);
  const [search, setSearch] = useState("");

  const current = queue?.current ?? null;
  const waiting = queue?.waiting ?? [];
  const visibleWaiting = search.trim()
    ? waiting.filter((a) => a.patientName.toLowerCase().includes(search.trim().toLowerCase()) || String(a.tokenNumber).includes(search.trim()))
    : waiting;
  const stats = queue?.stats;
  const recentActivity = [...doctorAppointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardShell role="doctor" active={active} searchPlaceholder="Search patient ID..." searchValue={search} onSearchChange={setSearch}>
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Patients Waiting" value={String(waiting.length)} />
        <MetricCard icon="O" label="Avg. Consultation" value={stats ? `${stats.avgConsultationTime}m` : "--"} tone="green" />
        <MetricCard icon="!" label="Critical Patients" value={String(waiting.filter((a) => a.priority <= 2).length)} tone="red" />
        <MetricCard icon="/" label="Patients Seen" value={stats ? String(stats.patientsSeen) : "--"} tone="orange" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel>
          {current ? (
            <div className="grid gap-7 md:grid-cols-[160px_1fr]">
              <Avatar name={current.patientName} className="h-28 w-28" />
              <div>
                <div className="flex justify-between">
                  <div><h2 className="text-2xl font-black">{current.patientName}</h2><p>Token #{current.tokenNumber} - {current.age} yrs, {current.gender}</p></div>
                  <div><b className="text-[#0755d9]">PRIORITY P{current.priority} ({priorityLabel(current.priority)})</b></div>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl bg-[#f0f1fb] p-5"><b className="text-[#0755d9]">PRESENTING SYMPTOMS</b><p className="mt-3">{current.symptoms}</p></div>
                  <AiExplainability appointment={current} />
                </div>
                <div className="mt-7 flex flex-wrap gap-4">
                  <Button disabled={completePatient.isPending} onClick={() => completePatient.mutate(current._id)} className="disabled:opacity-60">{completePatient.isPending ? "Completing..." : "Complete Consultation"}</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <EmptyState label="No patient selected for consultation." />
              <Button disabled={callNext.isPending || waiting.length === 0} onClick={() => callNext.mutate()} className="w-full disabled:opacity-60">{callNext.isPending ? "Calling..." : "Call Next Patient"}</Button>
            </div>
          )}
        </Panel>
        <Panel title="Today's Performance">
          <div className="space-y-6">
            <div><div className="mb-2 flex justify-between"><span>Efficiency Goal</span><b>{stats ? `${stats.efficiencyGoal}%` : "--"}</b></div><Progress value={stats?.efficiencyGoal ?? 0} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#f0f1fb] p-5">Admissions<br /><b>{stats ? stats.todayAdmissions : "--"}</b></div>
              <div className="rounded-xl bg-[#f0f1fb] p-5">Discharges<br /><b>{stats ? stats.todayDischarges : "--"}</b></div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Patient Queue" action={<Button variant="secondary" disabled={callNext.isPending || waiting.length === 0} onClick={() => callNext.mutate()} className="disabled:opacity-60">Call Next Patient</Button>}>
          {visibleWaiting.length === 0 ? (
            <EmptyState label={waiting.length === 0 ? "No patients waiting." : "No patients match your search."} />
          ) : (
            <div className="space-y-4">{visibleWaiting.map((patient) => <QueueRow key={patient._id} appointment={patient} />)}</div>
          )}
        </Panel>
        <Panel title="Timeline">
          {recentActivity.length === 0 ? (
            <EmptyState label="No recent activity." />
          ) : (
            <div className="space-y-5">
              {recentActivity.map((appointment) => (
                <div key={appointment._id} className="flex gap-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${appointment.status === "completed" ? "bg-emerald-100 text-emerald-700" : appointment.status === "serving" ? "bg-blue-100 text-[#0755d9]" : "bg-orange-100 text-orange-700"}`}>✓</span>
                  <div>
                    <b>{appointment.status === "completed" ? `Completed: ${appointment.patientName}` : appointment.status === "serving" ? `In consultation: ${appointment.patientName}` : `Check-in: ${appointment.patientName}`}</b>
                    <p className="text-sm text-slate-700">Token #{appointment.tokenNumber} - {appointment.symptoms}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}

export function DoctorEmergencyIntakePage() {
  const user = useAuthStore((state) => state.user);
  const createAppointment = useCreateAppointment();
  const [form, setForm] = useState({
    patientName: "",
    age: "",
    gender: "male",
    phone: "",
    symptoms: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Appointment | null>(null);

  const resetForm = () => {
    setForm({ patientName: "", age: "", gender: "male", phone: "", symptoms: "" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user?.doctorId) {
      setError("Doctor profile is not ready. Please log in again.");
      return;
    }

    try {
      const appointment = await createAppointment.mutateAsync({
        patientName: form.patientName,
        age: Number(form.age),
        gender: form.gender as "male" | "female" | "other",
        phone: form.phone,
        doctor: user.doctorId,
        symptoms: form.symptoms,
      });
      setSuccess(appointment);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <DashboardShell role="doctor" active="My Queue" searchPlaceholder="Search patient ID...">
      <PageTitle title="Emergency Intake" subtitle="Add an urgent patient directly to your consultation queue." />
      <Panel title="New Patient Intake">
        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className="font-bold">Patient Full Name</span><input required value={form.patientName} onChange={(e) => setForm((p) => ({ ...p, patientName: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" /></label>
          <label className="block"><span className="font-bold">Age</span><input required type="number" min={0} value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" /></label>
          <label className="block"><span className="font-bold">Gender</span><select required value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4"><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></label>
          <label className="block"><span className="font-bold">Phone Number</span><input required value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" /></label>
          <label className="block md:col-span-2"><span className="font-bold">Symptoms & Primary Complaint</span><textarea required value={form.symptoms} onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))} className="mt-2 h-36 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] p-4" placeholder="Brief description of the emergency condition..." /></label>
          {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
          {success && (
            <div className="md:col-span-2 space-y-3">
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                Emergency intake booked - token #{success.tokenNumber}, code {success.appointmentCode}.{" "}
                <Link href={`/track/${success.appointmentCode}`} className="underline" target="_blank">Open patient tracking link</Link>
              </p>
              <AiExplainability appointment={success} />
            </div>
          )}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={resetForm}>Clear Form</Button>
            <Button type="submit" disabled={createAppointment.isPending} className="disabled:opacity-60">{createAppointment.isPending ? "Booking..." : "Book Emergency Intake"}</Button>
          </div>
        </form>
      </Panel>
    </DashboardShell>
  );
}

export function DoctorHistoryPage() {
  const user = useAuthStore((state) => state.user);
  const { data: appointments = [], isLoading } = useAppointments(user?.doctorId ?? undefined);
  const [search, setSearch] = useState("");

  const completed = appointments.filter((a) => a.status === "completed").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const visibleAppointments = appointments.filter((a) => matchesSearch(a, search));

  return (
    <DashboardShell role="doctor" active="History" searchPlaceholder="Search patient ID..." searchValue={search} onSearchChange={setSearch}>
      <PageTitle title="Consultation History" subtitle="Every appointment you have handled, most recent first." />
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard icon="P" label="Total Appointments" value={String(appointments.length)} />
        <MetricCard icon="O" label="Completed" value={String(completed)} tone="green" />
        <MetricCard icon="X" label="Cancelled" value={String(cancelled)} tone="red" />
      </div>
      {isLoading ? (
        <div className="mt-7 rounded-xl border border-[#c4c9dc] bg-white p-6"><EmptyState label="Loading history..." /></div>
      ) : (
        <div className="mt-7">
          <AppointmentTable appointments={visibleAppointments} />
        </div>
      )}
    </DashboardShell>
  );
}

interface PatientSummary {
  key: string;
  name: string;
  phone: string;
  age: number;
  gender: Appointment["gender"];
  visits: number;
  lastVisitAt: string;
  lastStatus: Appointment["status"];
}

function summarizePatients(appointments: Appointment[]): PatientSummary[] {
  const byPatient = new Map<string, PatientSummary>();

  [...appointments]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach((appointment) => {
      const key = appointment.phone || appointment.patientName;
      byPatient.set(key, {
        key,
        name: appointment.patientName,
        phone: appointment.phone,
        age: appointment.age,
        gender: appointment.gender,
        visits: (byPatient.get(key)?.visits ?? 0) + 1,
        lastVisitAt: appointment.createdAt,
        lastStatus: appointment.status,
      });
    });

  return Array.from(byPatient.values()).sort(
    (a, b) => new Date(b.lastVisitAt).getTime() - new Date(a.lastVisitAt).getTime()
  );
}

export function DoctorPatientsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: appointments = [], isLoading } = useAppointments(user?.doctorId ?? undefined);
  const [search, setSearch] = useState("");
  const allPatients = summarizePatients(appointments);
  const patients = search.trim()
    ? allPatients.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()) || p.phone.includes(search.trim()))
    : allPatients;

  return (
    <DashboardShell role="doctor" active="Patients" searchPlaceholder="Search patient ID..." searchValue={search} onSearchChange={setSearch}>
      <PageTitle title="My Patients" subtitle="Everyone you have treated, with their visit history." />
      <div className="mt-7 overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
        <div className="grid grid-cols-[1.4fr_1fr_.6fr_.8fr_1fr_1fr] bg-[#f0f1fb] px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700">
          <span>Patient</span><span>Phone</span><span>Age</span><span>Visits</span><span>Last Visit</span><span>Last Status</span>
        </div>
        {isLoading ? (
          <div className="p-6"><EmptyState label="Loading patients..." /></div>
        ) : patients.length === 0 ? (
          <div className="p-6"><EmptyState label={allPatients.length === 0 ? "No patients treated yet." : "No patients match your search."} /></div>
        ) : (
          patients.map((patient) => (
            <div key={patient.key} className="grid grid-cols-[1.4fr_1fr_.6fr_.8fr_1fr_1fr] items-center border-t border-[#d7dbea] px-6 py-5">
              <div className="flex items-center gap-4"><Avatar name={patient.name} className="h-11 w-11" /><b>{patient.name}</b></div>
              <span>{patient.phone}</span>
              <span>{patient.age}</span>
              <span>{patient.visits}</span>
              <span>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(patient.lastVisitAt))}</span>
              <AppointmentStatus status={patient.lastStatus} />
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

export function PatientQueueTrackingPage({ initialCode }: { initialCode?: string } = {}) {
  const [code, setCode] = useState(initialCode ?? "");
  const [submittedCode, setSubmittedCode] = useState<string | null>(initialCode ?? null);
  const { data, isLoading, isError, error } = useTrackAppointment(submittedCode);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedCode(code.trim());
  };

  const appointment = data?.appointment ?? null;
  const peopleAhead = data?.peopleAhead ?? null;

  return (
    <div className="min-h-screen bg-[#fbfaff] text-slate-950">
      <header className="border-b border-[#c4c9dc]">
        <div className="mx-auto flex h-20 max-w-[1260px] items-center gap-10 px-6">
          <AppLogo compact />
          <span className="ml-auto text-lg font-bold text-[#0755d9]">Live Queue Tracking</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1260px] px-6 py-8">
        <Panel>
          <h1 className="text-4xl font-black">Track Your Appointment</h1>
          <p className="mt-4 max-w-[560px] text-xl text-slate-700">Enter your appointment code to view live queue status and estimated wait time.</p>
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-[1fr_260px]">
            <input value={code} onChange={(e) => setCode(e.target.value)} className="h-16 rounded-xl border border-[#c4c9dc] px-7 text-2xl font-bold" placeholder="e.g. QURA-1234" />
            <Button type="submit" disabled={isLoading || !code.trim()} className="h-16 text-xl disabled:opacity-60">{isLoading ? "Tracking..." : "Track Queue"}</Button>
          </form>
        </Panel>
        <div className="mt-8 grid gap-7 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Panel>
              {!submittedCode ? (
                <EmptyState label="Enter an appointment code above to see your live queue status." />
              ) : isError ? (
                <EmptyState label={getErrorMessage(error) || "Appointment not found."} />
              ) : appointment ? (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-black">{appointment.doctor?.user?.name ?? "Doctor"}</h2>
                      <p className="text-lg text-slate-700">{appointment.doctor?.department} - Room {appointment.doctor?.room}</p>
                    </div>
                    <StatusPill tone={statusTone(appointment.status)}>{appointment.status}</StatusPill>
                  </div>
                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>Your Ticket</span><b className="block text-5xl text-[#0755d9]">#{appointment.tokenNumber}</b></div>
                    <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>People Ahead</span><b className="block text-5xl">{appointment.status === "waiting" ? peopleAhead : "--"}</b></div>
                    <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>Est. Wait</span><b className="block text-5xl text-emerald-700">{appointment.status === "waiting" ? `${appointment.estimatedWait}m` : "--"}</b></div>
                  </div>
                </>
              ) : null}
            </Panel>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-900 p-8 text-white">
              <h2 className="text-xl">Estimated Wait</h2>
              <div className="mt-5 text-6xl font-black">{appointment?.status === "waiting" ? appointment.estimatedWait : "--"} <span className="text-3xl text-slate-300">MIN</span></div>
            </div>
            <Panel title="Hospital Map"><div className="h-48 rounded-lg bg-gradient-to-br from-blue-100 to-slate-200" /><Button variant="secondary" className="mt-5 w-full">Open Navigation</Button></Panel>
            <Panel title="Preparation"><EmptyState label="Preparation checklist will appear once your appointment is loaded." /></Panel>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SecurityPrivacyPanel() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Panel title="Security & Privacy">
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input required type="password" minLength={6} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Current password" />
        <input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Enter new password" />
        {error && <p className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        {success && <p className="md:col-span-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</p>}
        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={changePassword.isPending} className="disabled:opacity-60">{changePassword.isPending ? "Updating..." : "Update Password"}</Button>
        </div>
      </form>
      <div className="mt-5 rounded-lg bg-[#f0f1fb] p-4">Two-Factor Authentication <Button variant="secondary" className="float-right h-9">Enable 2FA</Button></div>
    </Panel>
  );
}

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardShell role="admin" active="Settings" searchPlaceholder="Search settings...">
      <PageTitle title="Settings" subtitle="Manage hospital configurations, user profile, and system preferences." />
      <div className="grid gap-8 xl:grid-cols-[180px_1fr]">
        <nav className="space-y-4 text-sm"><b>Profile Details</b><p>Hospital Information</p><p>Theme & Appearance</p><p>Notifications</p><p>AI Intelligence</p><p className="font-bold text-[#0755d9]">Security & Privacy</p><p>Danger Zone</p></nav>
        <div className="space-y-7">
          <Panel><div className="flex items-center gap-5"><Avatar name={user?.name} className="h-24 w-24" /><div><h2 className="text-2xl font-black">{user?.name ?? "Your Profile"}</h2><StatusPill>Verified</StatusPill></div></div></Panel>
          <Panel title="Profile Details"><div className="grid gap-5 md:grid-cols-2"><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" defaultValue={user?.name ?? ""} placeholder="Full Name" /><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" defaultValue={user?.email ?? ""} placeholder="Email Address" /></div></Panel>
          <Panel title="Hospital Information"><div className="grid gap-5 md:grid-cols-2"><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Hospital Name" /><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Facility ID" /></div></Panel>
          <Panel title="Theme & Appearance"><div className="grid gap-4 md:grid-cols-3">{["Light Mode", "Dark Mode", "Auto System"].map((mode) => <div key={mode} className="rounded-lg border border-[#c4c9dc] p-4"><div className="h-20 rounded bg-[#f0f1fb]" /><b className="mt-3 block">{mode}</b></div>)}</div></Panel>
          <Panel title="Notifications"><div className="space-y-5">{["Critical Patient Alerts", "Daily Summary Reports", "AI Diagnostic Suggestions"].map((item) => <div key={item} className="flex justify-between border-b border-[#d7dbea] pb-4"><span>{item}</span><span className="h-6 w-11 rounded-full bg-slate-300" /></div>)}</div></Panel>
          <Panel title="AI Intelligence Settings"><Progress value={0} /><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-lg border border-[#c4c9dc] p-4">Copilot Mode</div><div className="rounded-lg border border-[#c4c9dc] p-4">Audit Mode</div></div></Panel>
          <SecurityPrivacyPanel />
          <Panel className="border-red-200 bg-red-50"><div className="flex justify-between"><div><h2 className="text-xl font-black text-red-700">Danger Zone</h2><p>Deactivate hospital instance and archive clinical records.</p></div><Button variant="danger">Terminate System</Button></div></Panel>
          <div className="flex justify-end gap-4"><Button variant="secondary">Discard Changes</Button><Button>Save Settings</Button></div>
        </div>
      </div>
    </DashboardShell>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#fbfaff] text-slate-950">
      <header className="border-b border-[#c4c9dc]">
        <div className="mx-auto flex h-20 max-w-[1260px] items-center justify-between px-6"><AppLogo compact /><div className="flex items-center gap-10 text-lg"><Link href="#">Support</Link><Link href="#">Status</Link><Avatar className="h-12 w-12" /></div></div>
      </header>
      <main className="mx-auto grid min-h-[calc(100vh-190px)] max-w-[900px] place-items-center px-6 py-16 text-center">
        <div>
          <div className="mx-auto h-72 max-w-[620px] rounded-xl border border-[#c4c9dc] bg-gradient-to-br from-sky-100 via-white to-slate-200 p-8 shadow-sm"><div className="text-xl font-black text-[#0755d9]">404 - RECORD NOT FOUND</div><div className="mt-12 text-7xl">?</div><p className="mt-8 font-bold">Oops! The patient record could not be retrieved.</p></div>
          <h1 className="mt-16 text-6xl font-black text-[#0755d9]">404</h1>
          <h2 className="mx-auto mt-6 max-w-[620px] text-4xl font-black">Looks like this patient record doesn&apos;t exist.</h2>
          <p className="mx-auto mt-6 max-w-[620px] text-xl leading-8 text-slate-600">The data you&apos;re looking for might have been archived, moved, or the ID provided is incorrect.</p>
          <div className="mt-10 flex justify-center gap-5"><Link href="/"><Button>Back Home</Button></Link><Button variant="secondary">Previous Page</Button></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
