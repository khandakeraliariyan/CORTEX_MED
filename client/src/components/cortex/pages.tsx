"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
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
  HeroIllustration,
  MetricCard,
  PageTitle,
  Panel,
  Progress,
  StatusPill,
} from "@/components/cortex/ui";
import { login, register } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DASHBOARD_PATH, ROUTES } from "@/constants/routes";
import type { SelfRegisterableRole } from "@/types/auth.types";
import { useCreateDoctor, useDoctors } from "@/features/doctor/hooks/use-doctors";
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

function statusTone(status: Appointment["status"]): "blue" | "green" | "slate" | "red" {
  if (status === "waiting") return "blue";
  if (status === "serving") return "green";
  if (status === "cancelled") return "red";
  return "slate";
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fbfaff] text-slate-950">
      <header className="border-b border-[#d3d7e6]">
        <div className="mx-auto flex h-16 max-w-[1260px] items-center gap-8 px-6">
          <AppLogo compact />
          <nav className="mx-auto hidden gap-10 text-sm md:flex">
            <Link href="/" className="border-b-2 border-[#0755d9] pb-5 font-bold text-[#0755d9]">Home</Link>
            <Link href="#features">Features</Link>
            <Link href="#workflow">Workflow</Link>
            <Link href="#pricing">Pricing</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <Link href={ROUTES.LOGIN} className="text-sm font-bold text-[#0755d9]">Login</Link>
            <Link href={ROUTES.REGISTER}><Button>Register</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1260px] px-6 py-12">
        <section className="grid items-center gap-10 lg:grid-cols-[1fr_580px]">
          <div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#0755d9]">
              Next-gen triage
            </span>
            <h1 className="mt-7 max-w-[560px] text-5xl font-black leading-tight">
              AI-Powered Smart Hospital Queue Management
            </h1>
            <p className="mt-6 max-w-[620px] text-lg leading-8 text-slate-700">
              Revolutionize patient experience with CortexMed. Our AI-driven engine predicts wait times and automates triage to prioritize critical cases instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/reception/appointments"><Button>Book Appointment</Button></Link>
              <Link href="/track/demo"><Button variant="secondary">Track Queue</Button></Link>
              <Link href="/login" className="flex h-12 items-center px-4 text-sm font-bold text-[#0755d9]">Staff Login</Link>
            </div>
          </div>
          <HeroIllustration />
        </section>

        <section id="features" className="mt-16">
          <div className="text-center">
            <h2 className="text-3xl font-black">Intelligent Care Delivery</h2>
            <p className="mt-3 text-slate-700">Optimizing every second of the patient journey using data-driven insights.</p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Panel className="border-l-4 border-l-[#0755d9]">
              <h3 className="text-2xl font-black">Advanced AI Triage</h3>
              <p className="mt-4 max-w-[540px] leading-7 text-slate-700">
                The clinical reasoning engine analyzes symptoms in real time to categorize urgency and move emergency cases ahead when it matters.
              </p>
              <div className="mt-6 h-44 rounded-lg border border-[#c4c9dc] bg-[radial-gradient(circle_at_center,#7dd3fc,transparent_30%),linear-gradient(90deg,#eff6ff,#dbeafe)]" />
            </Panel>
            <Panel className="bg-emerald-50">
              <h3 className="text-2xl font-black">Privacy First</h3>
              <p className="mt-4 leading-7 text-slate-700">Encrypted patient operations with role based access and audit-ready workflows.</p>
            </Panel>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Panel><h3 className="text-xl font-black">Live Queue Tracking</h3><p className="mt-3 text-slate-700">Patients get real-time updates from their phone instead of waiting in a crowded lobby.</p></Panel>
            <Panel><h3 className="text-xl font-black">Smart Wait Prediction</h3><p className="mt-3 text-slate-700">Historical traffic patterns and staff availability drive precise waiting intervals.</p></Panel>
          </div>
        </section>

        <Panel title="Seamless Patient Flow" subtitle="A streamlined 4-step process for a better healthcare experience." className="mt-16" />

        <section className="mt-16 rounded-xl bg-[#0755d9] px-6 py-16 text-center text-white">
          <h2 className="text-3xl font-black">Ready to transform your hospital?</h2>
          <p className="mx-auto mt-5 max-w-[620px] text-blue-100">Use CortexMed to reduce patient frustration and improve care coordination.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href={ROUTES.REGISTER}><Button variant="secondary">Get Started Today</Button></Link>
            <Button className="border-white/40 bg-transparent">Contact Sales</Button>
          </div>
        </section>
      </main>
      <Footer />
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
                <Link href="/forgot-password" className="font-bold text-[#0755d9]">Forgot credentials?</Link>
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

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
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

export function AdminDashboardPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();

  const waitingCount = appointments.filter((a) => a.status === "waiting").length;
  const criticalCount = appointments.filter((a) => a.priority <= 2 && a.status === "waiting").length;
  const avgWait = waitingCount
    ? Math.round(
        appointments.filter((a) => a.status === "waiting").reduce((sum, a) => sum + a.estimatedWait, 0) / waitingCount
      )
    : 0;

  return (
    <DashboardShell role="admin" active="Dashboard">
      <PageTitle
        title="Analytics Overview"
        subtitle="Live hospital performance metrics."
        actions={<><Button variant="secondary">Filters</Button><Button>Export Report</Button></>}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="+" label="Total Doctors" value={String(doctors.length)} />
        <MetricCard icon="O" label="Appointments Today" value={String(appointments.length)} tone="green" />
        <MetricCard icon="!" label="Average Wait" value={waitingCount ? `${avgWait}m` : "--"} tone="orange" />
        <MetricCard icon="!" label="Critical Cases" value={String(criticalCount)} tone="red" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Queue Length Trend" subtitle="Live occupancy and waiting line volume"><BarChart /></Panel>
        <Panel title="Hospital Utilization" subtitle="Departmental capacity usage">
          <div className="space-y-5">
            {["Emergency Ward", "Outpatient (OPD)", "Imaging & Lab", "Pediatrics"].map((label) => (
              <div key={label}><div className="mb-2 flex justify-between"><span>{label}</span><b>--</b></div><Progress value={0} /></div>
            ))}
            <Button variant="secondary" className="w-full">View Department Details</Button>
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Doctor Management" subtitle="Live status and performance ratings" action={<Link href="/admin/staff" className="font-bold text-[#0755d9]">View All</Link>}>
          <DoctorTable doctors={doctors} />
        </Panel>
        <Panel title="Recent Activity">
          <EmptyState label="No recent activity." />
        </Panel>
      </div>
      <Panel title="Reception & Support" className="mt-6">
        <EmptyState label="No reception staff on shift yet." />
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

export function AppointmentManagementPage() {
  const { data: appointments = [], isLoading } = useAppointments();

  const waiting = appointments.filter((a) => a.status === "waiting");
  const urgent = appointments.filter((a) => a.priority <= 2).length;
  const completed = appointments.filter((a) => a.status === "completed").length;
  const completionRate = appointments.length ? Math.round((completed / appointments.length) * 100) : 0;
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((sum, a) => sum + a.estimatedWait, 0) / waiting.length)
    : 0;

  return (
    <DashboardShell role="receptionist" active="Appointments" searchPlaceholder="Search appointments, patients...">
      <PageTitle title="Appointment Management" subtitle="Real-time scheduling and patient flow optimization." actions={<><Button variant="secondary">Filter View</Button><Button variant="secondary">Export PDF</Button></>} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="++" label="Total Scheduled" value={String(appointments.length)} />
        <MetricCard icon="H" label="Avg. Wait Time" value={waiting.length ? `${avgWait} min` : "--"} tone="green" />
        <MetricCard icon="!" label="Urgent Cases" value={String(urgent)} tone="orange" />
        <MetricCard icon="O" label="Completion Rate" value={`${completionRate}%`} tone="slate" />
      </div>
      <Panel className="mt-7">
        {isLoading ? <div className="p-6"><EmptyState label="Loading appointments..." /></div> : <AppointmentTable appointments={appointments} />}
      </Panel>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Queue Volume Trends"><BarChart /></Panel>
        <Panel title="Department Overview">
          <EmptyState label="No department activity to show yet." />
        </Panel>
      </div>
    </DashboardShell>
  );
}

function AppointmentTable({ appointments }: { appointments: Appointment[] }) {
  return (
    <div className="-m-6 overflow-hidden">
      <div className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_1fr_.7fr] bg-[#f0f1fb] px-6 py-5 text-xs font-black uppercase tracking-widest">
        <span>Patient</span><span>Doctor</span><span>Priority</span><span>Token</span><span>Status</span><span>Est. Wait</span>
      </div>
      {appointments.length === 0 ? (
        <div className="border-t border-[#d7dbea] p-6"><EmptyState label="No appointments scheduled yet." /></div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment._id} className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_1fr_.7fr] items-center border-t border-[#d7dbea] px-6 py-6">
            <div className="flex items-center gap-4"><Avatar name={appointment.patientName} className="h-12 w-12" /><b>{appointment.patientName}</b></div>
            <span>{appointment.doctor?.user?.name ?? "Unassigned"}</span>
            <StatusPill tone={priorityTone(appointment.priority)}>P{appointment.priority}</StatusPill>
            <b className="text-[#0755d9]">#{appointment.tokenNumber}</b>
            <StatusPill tone={statusTone(appointment.status)}>{appointment.status}</StatusPill>
            <b>{appointment.status === "waiting" ? `${appointment.estimatedWait} min` : "--"}</b>
          </div>
        ))
      )}
    </div>
  );
}

export function StaffDirectoryPage() {
  const { data: doctors = [], isLoading } = useDoctors();
  const createDoctor = useCreateDoctor();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <DashboardShell role="admin" active="Doctors" searchPlaceholder="Search medical staff...">
      <PageTitle title="Medical Staff Directory" subtitle="Manage department heads, clinicians, and surgical teams in real-time." actions={<><Button variant="secondary">All Departments</Button><Button onClick={() => setOpen((v) => !v)}>{open ? "Cancel" : "Add Doctor"}</Button></>} />

      {open && (
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
        ) : doctors.length === 0 ? (
          <EmptyState label="No staff members added yet." />
        ) : (
          <div className="grid gap-7 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
                <div className="relative h-48 bg-gradient-to-br from-sky-200 via-slate-100 to-blue-200">
                  <StatusPill tone={doctor.status === "available" ? "green" : doctor.status === "on_leave" ? "orange" : "slate"}>{doctor.status.replace("_", " ")}</StatusPill>
                </div>
                <div className="p-7">
                  <div className="flex justify-between"><h2 className="text-2xl font-black">{doctor.user.name}</h2><span className="rounded-lg bg-[#e8e9f5] px-4 py-2 font-bold">{doctor.room}</span></div>
                  <p className="mt-2 font-bold text-[#0755d9]">{doctor.department} - {doctor.specialty}</p>
                  <div className="mt-6 grid grid-cols-2 border-t border-[#d7dbea] pt-5"><div><b className="text-slate-500">WORKING HOURS</b><p>{doctor.startTime} - {doctor.endTime}</p></div><div><b className="text-slate-500">AVG. CONSULT</b><p>{doctor.avgConsultationTime} mins</p></div></div>
                  <div className="mt-7 flex gap-4"><Button variant="secondary">Profile</Button><Button variant="secondary">Edit</Button><Button variant="secondary">Del</Button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

export function AnalyticsPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();

  const critical = appointments.filter((a) => a.priority <= 2).length;
  const highPriority = appointments.filter((a) => a.priority === 3).length;
  const routine = appointments.length - critical - highPriority;

  return (
    <DashboardShell role="admin" active="Analytics" searchPlaceholder="Search analytics...">
      <PageTitle title="Hospital Analytics" subtitle="System performance and patient flow metrics." actions={<><Button variant="secondary">Filter Range</Button><Button>Export Report</Button></>} />
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Daily Patients" value={String(appointments.length)} tone="blue" />
        <MetricCard icon="O" label="Avg Wait Time" value="--" tone="orange" />
        <MetricCard icon="B" label="Bed Occupancy" value="--" tone="green" />
        <MetricCard icon="Z" label="ER Efficiency" value="--" tone="blue" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Average Wait Time Trend" subtitle="Real-time monitoring across departments"><BarChart /></Panel>
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
        <Panel title="Queue Utilization" subtitle="Wait density by hour and department"><HeatMap /></Panel>
        <Panel title="Specialist Performance" subtitle="Patient satisfaction and turnover rates"><DoctorTable doctors={doctors} /></Panel>
      </div>
    </DashboardShell>
  );
}

export function ReceptionDashboardPage() {
  const { data: doctors = [] } = useDoctors();
  const { data: appointments = [] } = useAppointments();
  const createAppointment = useCreateAppointment();

  const waiting = appointments.filter((a) => a.status === "waiting");
  const available = doctors.filter((d) => d.status === "available").length;
  const avgWait = waiting.length
    ? Math.round(waiting.reduce((sum, a) => sum + a.estimatedWait, 0) / waiting.length)
    : 0;

  const [form, setForm] = useState({ patientName: "", age: "", gender: "male", phone: "", doctor: "", symptoms: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      setSuccess(`Booked - token #${appointment.tokenNumber}, code ${appointment.appointmentCode}`);
      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <DashboardShell role="receptionist" active="Dashboard" searchPlaceholder="Search patients, doctors...">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Today's Patients" value={String(appointments.length)} />
        <MetricCard icon="H" label="Waiting Patients" value={String(waiting.length)} tone="orange" />
        <MetricCard icon="+" label="Doctors Available" value={String(available)} tone="green" />
        <MetricCard icon="O" label="Average Wait Time" value={waiting.length ? `${avgWait}m` : "--"} tone="slate" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Book New Patient">
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
            {success && <p className="md:col-span-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{success}</p>}
            <div className="md:col-span-2 flex justify-end gap-4">
              <Button type="button" variant="secondary" onClick={resetForm}>Clear Form</Button>
              <Button type="submit" disabled={createAppointment.isPending} className="disabled:opacity-60">{createAppointment.isPending ? "Booking..." : "Book Patient Entry"}</Button>
            </div>
          </form>
        </Panel>
        <Panel title="Live Queue" action={<StatusPill>{waiting.length} Live</StatusPill>}>
          <LiveQueueCards patients={waiting.slice(0, 5)} />
        </Panel>
      </div>
      <Panel title="Recent Check-ins" className="mt-7"><AppointmentTable appointments={appointments.slice(0, 10)} /></Panel>
    </DashboardShell>
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
          <Panel title="Patient Volume"><BarChart /></Panel>
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

export function DoctorDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const doctorId = user?.doctorId ?? null;

  const { data: queue } = useQueue(doctorId);
  const callNext = useCallNextPatient(doctorId);
  const completePatient = useCompletePatient(doctorId);

  const current = queue?.current ?? null;
  const waiting = queue?.waiting ?? [];

  return (
    <DashboardShell role="doctor" active="Dashboard" searchPlaceholder="Search patient ID...">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Patients Waiting" value={String(waiting.length)} />
        <MetricCard icon="O" label="Avg. Consultation" value="--" tone="green" />
        <MetricCard icon="!" label="Critical Patients" value={String(waiting.filter((a) => a.priority <= 2).length)} tone="red" />
        <MetricCard icon="/" label="Patients Seen" value="--" tone="orange" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel>
          {current ? (
            <div className="grid gap-7 md:grid-cols-[160px_1fr]">
              <Avatar name={current.patientName} className="h-28 w-28" />
              <div>
                <div className="flex justify-between">
                  <div><h2 className="text-2xl font-black">{current.patientName}</h2><p>Token #{current.tokenNumber} - {current.age} yrs, {current.gender}</p></div>
                  <div><b className="text-[#0755d9]">PRIORITY P{current.priority}</b></div>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl bg-[#f0f1fb] p-5"><b className="text-[#0755d9]">PRESENTING SYMPTOMS</b><p className="mt-3">{current.symptoms}</p></div>
                  <div className="rounded-xl bg-[#f0f1fb] p-5"><b className="text-[#0755d9]">AI REASONING</b><p className="mt-3">{current.triageReason ?? "Not available"}</p></div>
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
            <div><div className="mb-2 flex justify-between"><span>Efficiency Goal</span><b>--</b></div><Progress value={0} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#f0f1fb] p-5">Admissions<br /><b>--</b></div>
              <div className="rounded-xl bg-[#f0f1fb] p-5">Discharges<br /><b>--</b></div>
            </div>
          </div>
        </Panel>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Patient Queue" action={<Button variant="secondary" disabled={callNext.isPending || waiting.length === 0} onClick={() => callNext.mutate()} className="disabled:opacity-60">Call Next Patient</Button>}>
          {waiting.length === 0 ? <EmptyState label="No patients waiting." /> : <div className="space-y-4">{waiting.map((patient) => <QueueRow key={patient._id} appointment={patient} />)}</div>}
        </Panel>
        <Panel title="Timeline"><EmptyState label="No recent activity." /></Panel>
      </div>
    </DashboardShell>
  );
}

export function PatientQueueTrackingPage() {
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
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
          <nav className="flex gap-10 text-xl"><Link href="/patient/dashboard">Dashboard</Link><Link href="/patient/queue" className="border-b-2 border-[#0755d9] pb-6 font-bold text-[#0755d9]">Queue</Link><Link href="/patient/appointments">Appointments</Link></nav>
          <div className="ml-auto flex gap-5 text-[#0755d9]">! [] <Avatar className="h-10 w-10" /></div>
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
          <Panel title="Security & Privacy"><div className="grid gap-4 md:grid-cols-2"><input type="password" className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Current password" /><input type="password" className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Enter new password" /></div><div className="mt-5 rounded-lg bg-[#f0f1fb] p-4">Two-Factor Authentication <Button variant="secondary" className="float-right h-9">Enable 2FA</Button></div></Panel>
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
