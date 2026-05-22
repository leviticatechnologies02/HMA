import { useState } from "react";
import { UserCheck, CheckCircle, XCircle, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateSupervisorAttendance, useSupervisorAttendance } from "../../hooks/useSupervisorAttendance";
import { useSupervisorStudents } from "../../hooks/useSupervisorStudents";
import { useAuthStore } from "../../store/authStore";
import { getApiErrorMessage } from "../../utils/apiErrors";

type AttendanceStatus = "present" | "absent" | "leave";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: "P", color: "bg-success text-white", icon: <CheckCircle className="w-3 h-3" /> },
  absent:  { label: "A", color: "bg-error text-white",   icon: <XCircle className="w-3 h-3" /> },
  leave:   { label: "L", color: "bg-primary text-white", icon: <Clock className="w-3 h-3" /> },
};

export function SupervisorAttendancePage() {
  const userId = useAuthStore((s) => s.userId);
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [submitting, setSubmitting] = useState(false);

  const studentsQ = useSupervisorStudents(userId);
  const attendanceQ = useSupervisorAttendance(userId);
  const createMutation = useCreateSupervisorAttendance(userId);

  const students = studentsQ.data ?? [];

  // Pre-fill from existing attendance for selected date
  const existingForDate = (attendanceQ.data ?? []).filter((a: any) => a.date === selectedDate);

  function getStatus(studentId: string): AttendanceStatus {
    if (records[studentId]) return records[studentId];
    const existing = existingForDate.find((a: any) => a.student_id === studentId);
    return (existing?.status as AttendanceStatus) ?? "present";
  }

  function toggleStatus(studentId: string) {
    const current = getStatus(studentId);
    const next: AttendanceStatus = current === "present" ? "absent" : current === "absent" ? "leave" : "present";
    setRecords((r) => ({ ...r, [studentId]: next }));
  }

  function markAll(status: AttendanceStatus) {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s: any) => { all[s.id] = status; });
    setRecords(all);
  }

  async function handleSubmit() {
    if (!students.length) return;
    setSubmitting(true);
    try {
      for (const student of students) {
        const status = getStatus(student.id);
        await createMutation.mutateAsync({
          student_id: student.id,
          date: selectedDate,
          status,
          method: "manual",
        });
      }
      toast.success(`Attendance marked for ${students.length} students`);
      setRecords({});
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to save attendance"));
    } finally {
      setSubmitting(false);
    }
  }

  // Summary counts
  const presentCount = students.filter((s: any) => getStatus(s.id) === "present").length;
  const absentCount  = students.filter((s: any) => getStatus(s.id) === "absent").length;
  const leaveCount   = students.filter((s: any) => getStatus(s.id) === "leave").length;

  if (!userId) return <div className="p-8 text-slate-500">Please login as supervisor.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-dark">Attendance</h1>
        <p className="mt-1 text-slate-500">Mark daily attendance for all students.</p>
      </div>

      {/* Date picker + bulk actions */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - 1);
            setSelectedDate(d.toISOString().slice(0, 10));
            setRecords({});
          }} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input type="date" value={selectedDate} max={today}
            onChange={(e) => { setSelectedDate(e.target.value); setRecords({}); }}
            className="input-field w-auto text-sm font-medium" />
          <button onClick={() => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() + 1);
            const next = d.toISOString().slice(0, 10);
            if (next <= today) { setSelectedDate(next); setRecords({}); }
          }} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 ml-auto flex-wrap">
          <button onClick={() => markAll("present")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success/10 text-success text-sm font-semibold hover:bg-success/20 transition-colors">
            <CheckCircle className="w-4 h-4" /> Mark All Present
          </button>
          <button onClick={() => markAll("absent")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-colors">
            <XCircle className="w-4 h-4" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", count: presentCount, color: "bg-success/10 text-success border-success/20" },
          { label: "Absent",  count: absentCount,  color: "bg-error/10 text-error border-error/20" },
          { label: "Leave",   count: leaveCount,   color: "bg-primary/10 text-primary border-primary/20" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${color}`}>
            <p className="text-2xl font-bold font-mono">{count}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Student grid */}
      {studentsQ.isLoading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
      ) : students.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No students assigned to your hostel.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-dark">{students.length} Students — {selectedDate}</h2>
            <p className="text-xs text-slate-500">Click a student to cycle: Present → Absent → Leave</p>
          </div>
          <div className="divide-y divide-slate-100">
            {students.map((student: any) => {
              const status = getStatus(student.id);
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={student.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => toggleStatus(student.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(student.full_name ?? student.student_number ?? "S")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-dark text-sm">{student.full_name ?? "—"}</p>
                      <p className="text-xs text-slate-400 font-mono">{student.student_number}</p>
                    </div>
                  </div>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${cfg.color}`}
                    onClick={(e) => { e.stopPropagation(); toggleStatus(student.id); }}>
                    {cfg.icon} {cfg.label === "P" ? "Present" : cfg.label === "A" ? "Absent" : "Leave"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit */}
      {students.length > 0 && (
        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 px-8">
            <UserCheck className="w-4 h-4" />
            {submitting ? "Saving..." : `Save Attendance (${students.length} students)`}
          </button>
        </div>
      )}
    </div>
  );
}
