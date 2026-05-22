// TenantDetailsModal.tsx
import { X, Calendar, Bed, Phone, User, Home, CreditCard } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { useAdminStudentDetails } from "../../../hooks/useAdminData";
import { formatDate } from "../../../utils/formatters";

interface Props {
  editingItem?: any;
  onClose?: () => void;
}

const InfoCard = ({ label, value, icon }: any) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <p className="text-xs text-slate-400 uppercase font-semibold">
        {label}
      </p>
    </div>
    <p className="font-medium text-dark dark:text-white text-sm">
      {value ?? "—"}
    </p>
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="space-y-3">
    <h3 className="text-xs font-bold uppercase text-slate-400">
      {title}
    </h3>
    <div className="grid grid-cols-2 gap-3">{children}</div>
  </div>
);

const TenantDetailsModal = ({
  editingItem,
  onClose,
}: Props) => {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const hostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  // ✅ Fetch data using hook
  const { data, isLoading, error } = useAdminStudentDetails(
    userId,
    hostelIds,
    editingItem
  );

  const selected = data;
  console.log("Selected student details:", selected);

  if (!editingItem) return null;

  return (
    <div >


      {/* 🔄 Loading */}
      {isLoading && (
        <div className="p-6 text-sm text-slate-500">
          Loading student details...
        </div>
      )}

      {/* ❌ Error */}
      {error && (
        <div className="p-6 text-sm text-red-500">
          Failed to load student details
        </div>
      )}

      {/* ✅ Data */}
      {selected && (
        <div className="p-6 space-y-6">

          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {(selected.full_name ?? "S")[0]}
              </span>
            </div>

            <div>
              <p className="text-lg font-bold text-dark dark:text-white">
                {selected.full_name}
              </p>
              <p className="text-sm text-slate-500 font-mono">
                {selected.student_number}
              </p>
              <p className="text-xs text-slate-400">
                {selected.email}
              </p>
            </div>
          </div>

          {/* Personal */}
          <Section title="Personal Info">
            <InfoCard label="Phone" value={selected.phone} icon={<Phone className="w-4 h-4 text-primary" />} />
            <InfoCard label="Gender" value={selected.gender} icon={<User className="w-4 h-4 text-primary" />} />
            <InfoCard label="DOB" value={selected.date_of_birth ? formatDate(selected.date_of_birth) : "N/A"} icon={<Calendar className="w-4 h-4 text-primary" />} />
            <InfoCard label="Occupation" value={selected.occupation} icon={<User className="w-4 h-4 text-primary" />} />
          </Section>

          {/* Stay */}
          <Section title="Stay Details">
            <InfoCard label="Check-in" value={selected.check_in_date ? formatDate(selected.check_in_date) : "N/A"} icon={<Calendar className="w-4 h-4 text-green-500" />} />
            <InfoCard label="Check-out" value={selected.check_out_date ? formatDate(selected.check_out_date) : "Active"} icon={<Calendar className="w-4 h-4 text-slate-400" />} />
            <InfoCard label="Room" value={`${selected.room_number} (${selected.room_type})`} icon={<Home className="w-4 h-4 text-blue-500" />} />
            <InfoCard label="Bed" value={selected.bed_number} icon={<Bed className="w-4 h-4 text-purple-500" />} />
          </Section>

          {/* Hostel */}
          <Section title="Hostel">
            <InfoCard label="Name" value={selected.hostel_name} icon={<Home className="w-4 h-4 text-primary" />} />
            <InfoCard label="City" value={selected.hostel_city} icon={<Home className="w-4 h-4 text-primary" />} />
            <InfoCard label="Type" value={selected.hostel_type} icon={<Home className="w-4 h-4 text-primary" />} />
            <InfoCard label="Floor" value={selected.floor} icon={<Home className="w-4 h-4 text-primary" />} />
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <InfoCard label="Status" value={selected.payment_status} icon={<CreditCard className="w-4 h-4 text-green-500" />} />
            <InfoCard label="Monthly Rent" value={`₹${selected.monthly_rent}`} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            <InfoCard label="Total Paid" value={`₹${selected.total_paid}`} icon={<CreditCard className="w-4 h-4 text-primary" />} />
            <InfoCard label="Next Due" value={selected.next_payment_due ? formatDate(selected.next_payment_due) : "N/A"} icon={<Calendar className="w-4 h-4 text-yellow-500" />} />
          </Section>

          {/* Emergency */}
          <Section title="Emergency Contact">
            <InfoCard label="Name" value={selected.emergency_contact_name} icon={<User className="w-4 h-4 text-primary" />} />
            <InfoCard label="Phone" value={selected.emergency_contact_phone} icon={<Phone className="w-4 h-4 text-primary" />} />
          </Section>

        </div>
      )}

    </div>
  );
};

export default TenantDetailsModal;