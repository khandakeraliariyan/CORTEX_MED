import Link from "next/link";
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

type Doctor = { name: string; dept: string; status: string; wait: string; tone: "green" | "orange" | "slate" | "red" | "blue" };
type QueuePatient = { name: string; issue: string; tag: string; wait: string; tone: "red" | "green" | "orange" };
type Appointment = { patient: string; doctor: string; priority: string; token: string; status: string; wait: string; tone: "red" | "blue" | "orange" | "green" | "slate" };
type ActivityItem = { title: string; description: string; time: string };

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
          <div className="ml-auto flex items-center gap-5 text-[#0755d9]">
            <span>!</span>
            <span>#</span>
            <Avatar className="h-8 w-8" />
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
            <Button variant="secondary">Get Started Today</Button>
            <Button className="border-white/40 bg-transparent">Contact Sales</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function LoginPage() {
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
            <form className="mt-10 space-y-7">
              <label className="block">
                <span className="font-bold">Professional Email Address</span>
                <input type="email" className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none" placeholder="you@cortexmed.ai" />
              </label>
              <label className="block">
                <span className="font-bold">Security Credentials</span>
                <input type="password" className="mt-3 h-16 w-full rounded-xl border border-[#c4c9dc] px-5 text-lg outline-none" placeholder="Enter your password" />
              </label>
              <div className="flex justify-between text-slate-700">
                <label className="flex items-center gap-3"><input type="checkbox" /> Remember device</label>
                <Link href="/forgot-password" className="font-bold text-[#0755d9]">Forgot credentials?</Link>
              </div>
              <Button className="h-16 w-full text-xl">Log In to Dashboard</Button>
            </form>
            <p className="mt-10 text-center text-slate-600">Need help accessing your account? <span className="font-bold text-[#0755d9]">Contact System Admin</span></p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <DashboardShell role="admin" active="Dashboard">
      <PageTitle
        title="Analytics Overview"
        subtitle="Live hospital performance metrics."
        actions={<><Button variant="secondary">Filters</Button><Button>Export Report</Button></>}
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="+" label="Total Doctors" value="--" />
        <MetricCard icon="O" label="Appointments Today" value="--" tone="green" />
        <MetricCard icon="!" label="Average Wait" value="--" tone="orange" />
        <MetricCard icon="!" label="Critical Cases" value="--" tone="red" />
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
          <DoctorTable doctors={[]} />
        </Panel>
        <Panel title="Recent Activity">
          <ActivityList activities={[]} />
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
          <div key={doctor.name} className="grid grid-cols-4 items-center border-t border-[#d7dbea] px-6 py-5">
            <div className="flex items-center gap-3"><Avatar name={doctor.name} className="h-11 w-11" /><b>{doctor.name}</b></div>
            <span>{doctor.dept}</span>
            <StatusPill tone={doctor.tone}>{doctor.status}</StatusPill>
            <b className="text-right">{doctor.wait}</b>
          </div>
        ))
      )}
    </div>
  );
}

function ActivityList({ activities }: { activities: ActivityItem[] }) {
  return (
    <div className="space-y-7">
      {activities.length === 0 ? (
        <EmptyState label="No recent activity." />
      ) : (
        activities.map((item) => (
          <div key={item.title} className="flex gap-4">
            <span className="mt-1 h-4 w-4 rounded-full bg-blue-500" />
            <div><b>{item.title}</b><p className="text-sm text-slate-700">{item.description}</p><p className="mt-1 text-xs uppercase">{item.time}</p></div>
          </div>
        ))
      )}
      <Button variant="secondary" className="w-full">View History</Button>
    </div>
  );
}

export function AppointmentManagementPage() {
  return (
    <DashboardShell role="reception" active="Appointments" searchPlaceholder="Search appointments, patients...">
      <PageTitle title="Appointment Management" subtitle="Real-time scheduling and patient flow optimization." actions={<><Button variant="secondary">Filter View</Button><Button variant="secondary">Export PDF</Button></>} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon="++" label="Total Scheduled" value="--" />
        <MetricCard icon="H" label="Avg. Wait Time" value="--" tone="green" />
        <MetricCard icon="!" label="Urgent Cases" value="--" tone="orange" />
        <MetricCard icon="O" label="Completion Rate" value="--" tone="slate" />
      </div>
      <Panel className="mt-7">
        <AppointmentTable appointments={[]} />
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
      <div className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_1fr_.7fr_.3fr] bg-[#f0f1fb] px-6 py-5 text-xs font-black uppercase tracking-widest">
        <span>Patient</span><span>Doctor</span><span>Priority</span><span>Token</span><span>Status</span><span>Est. Wait</span><span>Actions</span>
      </div>
      {appointments.length === 0 ? (
        <div className="border-t border-[#d7dbea] p-6"><EmptyState label="No appointments scheduled yet." /></div>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment.patient} className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_1fr_.7fr_.3fr] items-center border-t border-[#d7dbea] px-6 py-6">
            <div className="flex items-center gap-4"><Avatar name={appointment.patient} className="h-12 w-12" /><b>{appointment.patient}</b></div>
            <span>{appointment.doctor}</span>
            <StatusPill tone={appointment.tone}>{appointment.priority}</StatusPill>
            <b className="text-[#0755d9]">{appointment.token}</b>
            <StatusPill tone={appointment.status === "Waiting" ? "blue" : appointment.status === "Checked Out" ? "slate" : "green"}>{appointment.status}</StatusPill>
            <b>{appointment.wait}</b>
            <span className="text-xl">...</span>
          </div>
        ))
      )}
    </div>
  );
}

export function StaffDirectoryPage() {
  const doctors: Doctor[] = [];
  return (
    <DashboardShell role="admin" active="Doctors" searchPlaceholder="Search medical staff...">
      <PageTitle title="Medical Staff Directory" subtitle="Manage department heads, clinicians, and surgical teams in real-time." actions={<><Button variant="secondary">All Departments</Button><Button>Add Doctor</Button></>} />
      <div className="grid gap-6 md:grid-cols-4">
        {["Total Staff", "On Duty", "In Surgery", "Avg Wait"].map((label) => (
          <div key={label} className="rounded-xl border border-[#c4c9dc] bg-[#f3f4ff] p-7"><div className="text-sm font-black uppercase tracking-widest">{label}</div><div className="mt-4 text-4xl font-black text-[#0755d9]">--</div></div>
        ))}
      </div>
      <div className="mt-8">
        {doctors.length === 0 ? (
          <EmptyState label="No staff members added yet." />
        ) : (
          <div className="grid gap-7 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div key={doctor.name} className="overflow-hidden rounded-xl border border-[#c4c9dc] bg-white shadow-sm">
                <div className="relative h-48 bg-gradient-to-br from-sky-200 via-slate-100 to-blue-200">
                  <StatusPill tone={doctor.tone}>{doctor.status}</StatusPill>
                </div>
                <div className="p-7">
                  <h2 className="text-2xl font-black">{doctor.name}</h2>
                  <p className="mt-2 font-bold text-[#0755d9]">{doctor.dept}</p>
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
  return (
    <DashboardShell role="admin" active="Analytics" searchPlaceholder="Search analytics...">
      <PageTitle title="Hospital Analytics" subtitle="System performance and patient flow metrics." actions={<><Button variant="secondary">Filter Range</Button><Button>Export Report</Button></>} />
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Daily Patients" value="--" tone="blue" />
        <MetricCard icon="O" label="Avg Wait Time" value="--" tone="orange" />
        <MetricCard icon="B" label="Bed Occupancy" value="--" tone="green" />
        <MetricCard icon="Z" label="ER Efficiency" value="--" tone="blue" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Average Wait Time Trend" subtitle="Real-time monitoring across departments"><BarChart /></Panel>
        <Panel title="Priority Distribution" subtitle="Critical vs Non-emergency cases">
          <Donut />
          <div className="mt-8 space-y-4">
            <div className="flex justify-between"><span>Critical</span><b>--</b></div>
            <div className="flex justify-between"><span>High Priority</span><b>--</b></div>
            <div className="flex justify-between"><span>Routine</span><b>--</b></div>
          </div>
        </Panel>
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <Panel title="Queue Utilization" subtitle="Wait density by hour and department"><HeatMap /></Panel>
        <Panel title="Specialist Performance" subtitle="Patient satisfaction and turnover rates"><DoctorTable doctors={[]} /></Panel>
      </div>
    </DashboardShell>
  );
}

export function ReceptionDashboardPage() {
  return (
    <DashboardShell role="reception" active="Dashboard" searchPlaceholder="Search patients, doctors...">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Today's Patients" value="--" />
        <MetricCard icon="H" label="Waiting Patients" value="--" tone="orange" />
        <MetricCard icon="+" label="Doctors Available" value="--" tone="green" />
        <MetricCard icon="O" label="Average Wait Time" value="--" tone="slate" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel title="Book New Patient">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className="font-bold">Patient Full Name</span><input className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="e.g. Johnathan Smith" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="font-bold">Age</span><input className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="Years" /></label>
              <label className="block"><span className="font-bold">Gender</span>
                <select className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </label>
            </div>
            <label className="block"><span className="font-bold">Phone Number</span><input className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4" placeholder="+1 (555) 000-0000" /></label>
            <label className="block"><span className="font-bold">Assigned Doctor</span>
              <select className="mt-2 h-12 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] px-4">
                <option>Select a doctor</option>
              </select>
            </label>
            <label className="block md:col-span-2"><span className="font-bold">Symptoms & Primary Complaint</span><textarea className="mt-2 h-32 w-full rounded-lg border border-[#c4c9dc] bg-[#fbfaff] p-4" placeholder="Brief description of the patient's condition..." /></label>
          </div>
          <div className="mt-7 flex justify-end gap-4"><Button variant="secondary">Clear Form</Button><Button>Book Patient Entry</Button></div>
        </Panel>
        <Panel title="Live Queue" action={<StatusPill>0 Live</StatusPill>}>
          <LiveQueueCards patients={[]} />
        </Panel>
      </div>
      <Panel title="Recent Check-ins" className="mt-7"><AppointmentTable appointments={[]} /></Panel>
    </DashboardShell>
  );
}

function LiveQueueCards({ patients }: { patients: QueuePatient[] }) {
  if (patients.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState label="No patients currently in the queue." />
        <Button variant="secondary" className="w-full">View Entire Queue</Button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient.name} className="rounded-xl border-l-4 border-[#0755d9] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar name={patient.name} className="h-12 w-12" />
            <div className="flex-1"><b>{patient.name}</b><p className="text-sm text-slate-700">{patient.issue}</p></div>
            <StatusPill tone={patient.tone}>{patient.tag}</StatusPill>
          </div>
        </div>
      ))}
      <Button variant="secondary" className="w-full">View Entire Queue</Button>
    </div>
  );
}

export function LiveQueuePage() {
  type SessionPatient = { name: string; condition: string; priority: string; vitals: string };
  const currentPatient = null as SessionPatient | null;
  const queuePatients: QueuePatient[] = [];

  return (
    <DashboardShell role="reception" active="Queue" searchPlaceholder="Search patients or records...">
      <PageTitle title="Emergency Care Queue" subtitle="Real-time patient flow." actions={<><MetricCard icon="O" label="Avg Wait Time" value="--" /><MetricCard icon="P" label="Current Queue" value="--" /></>} />
      <section className="rounded-xl bg-[#2563eb] p-8 text-white shadow-lg">
        {currentPatient ? (
          <div className="grid gap-8 lg:grid-cols-[160px_1fr_260px]">
            <Avatar name={currentPatient.name} className="h-36 w-36 border-white bg-white text-[#0755d9]" />
            <div><StatusPill tone="blue">Current Session</StatusPill><h2 className="mt-4 text-5xl font-black">{currentPatient.name}</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><b>{currentPatient.condition}</b><b>{currentPatient.priority}</b><b>{currentPatient.vitals}</b></div></div>
            <div className="space-y-4"><Button variant="secondary" className="w-full">Mark Complete</Button><Button className="w-full border-white/40 bg-transparent">View Records</Button></div>
          </div>
        ) : (
          <div className="py-6 text-center text-blue-50">No patient is currently in session.</div>
        )}
      </section>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between"><h2 className="text-2xl font-black">Next in Line <StatusPill tone="slate">{queuePatients.length} Remaining</StatusPill></h2><div className="flex gap-3"><Button variant="secondary">Sort</Button><Button>Call Next Patient</Button></div></div>
          <div className="space-y-4">{queuePatients.map((patient) => <QueueRow key={patient.name} {...patient} />)}</div>
          <div className="mt-5"><EmptyState label="New arrivals will appear here in real-time..." /></div>
        </div>
        <div className="space-y-6">
          <Panel title="Patient Volume"><BarChart /></Panel>
          <Panel title="Available Staff"><EmptyState label="No staff on duty yet." /></Panel>
        </div>
      </div>
    </DashboardShell>
  );
}

function QueueRow({ name, issue, tag, wait, tone }: QueuePatient) {
  return (
    <div className="grid items-center gap-4 rounded-xl border border-[#c4c9dc] bg-white p-5 shadow-sm md:grid-cols-[72px_1fr_160px]">
      <Avatar name={name} className="h-14 w-14" />
      <div><div className="flex flex-wrap items-center gap-3"><b className="text-xl">{name}</b><StatusPill tone={tone}>{tag}</StatusPill></div><p className="mt-1 text-slate-700">{issue}</p></div>
      <b className="text-[#0755d9]">{wait}</b>
    </div>
  );
}

export function DoctorDashboardPage() {
  type ConsultationPatient = { name: string; id: string; symptoms: string; reasoning: string };
  const currentPatient = null as ConsultationPatient | null;
  const queuePatients: QueuePatient[] = [];

  return (
    <DashboardShell role="doctor" active="Dashboard" searchPlaceholder="Search patient ID...">
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard icon="P" label="Patients Waiting" value="--" />
        <MetricCard icon="O" label="Avg. Consultation" value="--" tone="green" />
        <MetricCard icon="!" label="Critical Patients" value="--" tone="red" />
        <MetricCard icon="/" label="Patients Seen" value="--" tone="orange" />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Panel>
          {currentPatient ? (
            <div className="grid gap-7 md:grid-cols-[160px_1fr]">
              <Avatar name={currentPatient.name} className="h-28 w-28" />
              <div>
                <div className="flex justify-between">
                  <div><h2 className="text-2xl font-black">{currentPatient.name}</h2><p>ID: {currentPatient.id}</p></div>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl bg-[#f0f1fb] p-5"><b className="text-[#0755d9]">PRESENTING SYMPTOMS</b><p className="mt-3">{currentPatient.symptoms}</p></div>
                  <div className="rounded-xl bg-[#f0f1fb] p-5"><b className="text-[#0755d9]">AI REASONING</b><p className="mt-3">{currentPatient.reasoning}</p></div>
                </div>
                <div className="mt-7 flex flex-wrap gap-4"><Button>Complete Consultation</Button><Button variant="secondary">Request Stat Lab</Button></div>
              </div>
            </div>
          ) : (
            <EmptyState label="No patient selected for consultation." />
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
        <Panel title="Patient Queue" action={<Button variant="secondary">Call Next Patient</Button>}>
          {queuePatients.length === 0 ? <EmptyState label="No patients waiting." /> : <div className="space-y-4">{queuePatients.map((patient) => <QueueRow key={patient.name} {...patient} />)}</div>}
        </Panel>
        <Panel title="Timeline"><ActivityList activities={[]} /></Panel>
      </div>
    </DashboardShell>
  );
}

export function PatientQueueTrackingPage() {
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
          <p className="mt-4 max-w-[560px] text-xl text-slate-700">Enter your 8-digit appointment code to view live queue status and estimated wait time.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-[1fr_260px]"><input className="h-16 rounded-xl border border-[#c4c9dc] px-7 text-2xl font-bold" placeholder="e.g. CXM-8291-04" /><Button className="h-16 text-xl">Track Queue</Button></div>
        </Panel>
        <div className="mt-8 grid gap-7 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Panel>
              <EmptyState label="Enter an appointment code above to see your live queue status." />
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>Your Ticket</span><b className="block text-5xl text-[#0755d9]">--</b></div>
                <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>People Ahead</span><b className="block text-5xl">--</b></div>
                <div className="rounded-xl bg-[#f0f1fb] p-6 text-center"><span>Est. Wait</span><b className="block text-5xl text-emerald-700">--</b></div>
              </div>
              <div className="mt-9 grid grid-cols-4 gap-2 text-center font-bold text-slate-400"><span>Waiting</span><span>Almost There</span><span>You&apos;re Next</span><span>Called</span></div>
            </Panel>
            <div className="rounded-xl border border-[#c4c9dc] bg-white p-6 text-2xl">Serving Ticket: <b>--</b></div>
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-900 p-8 text-white"><h2 className="text-xl">Arrival Countdown</h2><div className="mt-5 text-6xl font-black">-- <span className="text-3xl text-slate-300">MIN</span> -- <span className="text-3xl text-slate-300">SEC</span></div></div>
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
  return (
    <DashboardShell role="admin" active="Settings" searchPlaceholder="Search settings...">
      <PageTitle title="Settings" subtitle="Manage hospital configurations, user profile, and system preferences." />
      <div className="grid gap-8 xl:grid-cols-[180px_1fr]">
        <nav className="space-y-4 text-sm"><b>Profile Details</b><p>Hospital Information</p><p>Theme & Appearance</p><p>Notifications</p><p>AI Intelligence</p><p className="font-bold text-[#0755d9]">Security & Privacy</p><p>Danger Zone</p></nav>
        <div className="space-y-7">
          <Panel><div className="flex items-center gap-5"><Avatar className="h-24 w-24" /><div><h2 className="text-2xl font-black">Your Profile</h2><StatusPill>Verified</StatusPill></div></div></Panel>
          <Panel title="Profile Details"><div className="grid gap-5 md:grid-cols-2"><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Full Name" /><input className="h-12 rounded-lg border border-[#c4c9dc] px-4" placeholder="Email Address" /></div></Panel>
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
