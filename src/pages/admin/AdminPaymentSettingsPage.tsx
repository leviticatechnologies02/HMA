import React, { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, Info, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAdminPaymentConfig, useUpdateAdminPaymentConfig } from "../../hooks/useAdminData";
import toast from "react-hot-toast";
import { type PaymentConfigPayload } from "../../api/admin.api";

interface PasswordToggleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const PasswordToggleInput = React.forwardRef<HTMLInputElement, PasswordToggleInputProps>(
  ({ label, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    

    return (
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-dark dark:text-slate-200">
          {label} {props.required && <span className="text-error">*</span>}
        </label>
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={showPassword ? "text" : "password"}
            className="input pr-10 w-full"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }
);
PasswordToggleInput.displayName = "PasswordToggleInput";


export function AdminPaymentSettingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds?.[0] ?? null;

  const { data: config, isLoading, isError } = useAdminPaymentConfig(userId, hostelIds || [], activeHostelId);
  const updateConfig = useUpdateAdminPaymentConfig(userId, hostelIds || [], activeHostelId);

  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [linkedAccountId, setLinkedAccountId] = useState("");
  const [platformFee, setPlatformFee] = useState(0);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] =
  useState<"direct" | "route">("route");

 
  useEffect(() => {
  if (!config) return;

  setKeyId(config.razorpay_key_id || "");
  setLinkedAccountId(config.razorpay_linked_account_id || "");
  setPlatformFee(config.platform_fee_percentage ?? 0);
  setIsActive(config.is_active ?? false);

  if (config.payment_mode) {
    setPaymentMode(config.payment_mode);
  }

  setKeySecret("");
  setWebhookSecret("");
}, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    
    const idTrimmed = keyId.trim();
    if (!idTrimmed.startsWith("rzp_test_") && !idTrimmed.startsWith("rzp_live_")) {
      setErrorMsg("Key ID must start with rzp_test_ or rzp_live_");
      return;
    }

    if (!config?.is_configured && !keySecret.trim()) {
      setErrorMsg("Key Secret is required on first setup.");
      return;
    }

    const payload: PaymentConfigPayload = {
  is_active: isActive,
  razorpay_key_id: keyId.trim(),
};
if (paymentMode === "direct") {
  if (!config?.is_configured && !keySecret.trim()) {
    setErrorMsg("Key Secret is required.");
    return;
  }

  payload.razorpay_key_secret = keySecret.trim();
  payload.razorpay_webhook_secret = webhookSecret.trim();
  payload.payment_mode = "direct";
} else {
  payload.razorpay_linked_account_id = linkedAccountId.trim();
  payload.platform_fee_percentage = platformFee;
  payload.payment_mode = "route";
}

updateConfig.mutate(payload, {
  onSuccess: () => {
    toast.success("Payment configuration saved.");
    setKeySecret("");
    setWebhookSecret("");
  },
  onError: (err: any) => {
    setErrorMsg(
      err?.response?.data?.message || "Failed to save configuration."
    );
    toast.error("Failed to save configuration.");
  },
});
  };
  const isConfigured = config?.is_configured ?? false;

  
  const maskedDisplayId = config?.razorpay_key_id
    ? config.razorpay_key_id.substring(0, 12) + "••••••••"
    : "";

 return (
<div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">

  
  <div className="bg-white rounded-2xl shadow-md p-5 sm:p-8">
      <h1 className="text-3xl font-bold">
          Payment Settings
      </h1>

      <p className="text-slate-500 mt-2">
          Configure how student payments are processed
      </p>
  </div>

<div className="flex flex-col sm:flex-row gap-4">
  <button
    type="button"
    onClick={() => setPaymentMode("direct")}
    className={`w-full sm:flex-1 rounded-2xl px-5 py-4 font-semibold transition-all duration-300 border flex items-center justify-center gap-2 text-center
      ${
        paymentMode === "direct"
          ? "bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg border-blue-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
  >
    <CreditCard className="w-5 h-5 shrink-0" />
    <span className="leading-tight">
      Direct Integration
    </span>
  </button>

  <button
    type="button"
    onClick={() => setPaymentMode("route")}
    className={`w-full sm:flex-1 rounded-2xl px-5 py-4 font-semibold transition-all duration-300 border flex items-center justify-center gap-2 text-center
      ${
        paymentMode === "route"
          ? "bg-gradient-to-r from-green-700 to-green-500 text-white shadow-lg border-green-600"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      }`}
  >
    <span className="text-lg shrink-0">⚡</span>
    <span className="leading-tight">
      Razorpay Route
      <br className="sm:hidden" />
      <span className="sm:inline"> (Split)</span>
    </span>
  </button>
</div>

{paymentMode === "direct" ? (

<div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">

  <h2 className="text-2xl font-semibold mb-8">
    Direct Integration Settings
  </h2>

  <form onSubmit={handleSubmit} className="space-y-6">

    <div>
      <label className="font-medium block mb-2">
        Razorpay Key ID
      </label>

      <input
  value={keyId}
  onChange={(e) => setKeyId(e.target.value)}
  placeholder="rzp_test_xxxxxxxxxxxx"
  className="w-full border rounded-xl p-4"
/>
    </div>

    <div>
      <label className="font-medium block mb-2">
        Razorpay Key Secret
      </label>

      <input
        type="password"
        value={keySecret}
        onChange={(e) => setKeySecret(e.target.value)}
        placeholder="Enter Razorpay Key Secret"
        className="w-full border rounded-xl p-4"
      />
    </div>

    <div className="flex items-center gap-4">

      <label className="relative inline-flex items-center cursor-pointer">

        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="sr-only peer"
        />

        <div className="w-12 h-7 bg-gray-300 rounded-full relative
          peer-checked:bg-blue-600
          after:absolute after:top-1 after:left-1
          after:h-5 after:w-5 after:bg-white
          after:rounded-full after:transition-all
          peer-checked:after:translate-x-5" />

      </label>

      <span className="font-medium">
        Enable Online Payments
      </span>

    </div>

    {errorMsg && (
      <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-600">
        {errorMsg}
      </div>
    )}

    <button
      type="submit"
      disabled={updateConfig.isPending}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 text-white font-semibold"
    >
      {updateConfig.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      ) : (
        "Save Configuration"
      )}
    </button>

  </form>

</div>

) : (

<div className="bg-white rounded-2xl shadow-lg p-8">

  <h2 className="text-2xl font-semibold mb-6">
    Razorpay Route Settings
  </h2>

  <div className="border border-green-400 bg-green-50 rounded-xl p-4 flex gap-3 items-center mb-6">
    <Info className="text-green-700" />
    <span className="text-green-700">
      Payments are automatically split between you and the hostel.
    </span>
  </div>

  <form onSubmit={handleSubmit} className="space-y-6">

    <div>
      <label className="font-medium block mb-2">
        Linked Account ID
      </label>

      <input
  value={linkedAccountId}
  onChange={(e) => setLinkedAccountId(e.target.value)}
  placeholder="acc_xxxxxxxxxxxx"
  className="w-full border rounded-xl p-4"
/>

      <p className="text-sm text-gray-500 mt-2">
        Get this from Razorpay Route dashboard after KYC.
      </p>
    </div>

    <div>
      <label className="font-medium block mb-2">
        Platform Fee %
      </label>

      <select
  value={platformFee}
  onChange={(e) => setPlatformFee(Number(e.target.value))}
  className="w-full border rounded-xl p-4"
>
  {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
    <option key={i} value={i}>
      {i}%
    </option>
  ))}
</select>

      <p className="text-sm text-gray-500 mt-2">
        You keep 5%, hostel gets 95%.
      </p>
    </div>

    <div className="bg-gray-50 rounded-xl p-6 text-center">

      <h3 className="font-semibold mb-4">
        Payment Split Example
      </h3>

      <p className="text-3xl font-bold mb-5">
        ₹10,000
      </p>

      <div className="space-y-3">

        <div className="flex justify-between">
          <span>Your Account</span>
          <span>₹500</span>
        </div>

        <div className="flex justify-between">
          <span>Hostel Account</span>
          <span>₹9,500</span>
        </div>

      </div>

    </div>

    <div className="flex items-center gap-4">

      <label className="relative inline-flex items-center cursor-pointer">

        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="sr-only peer"
        />

        <div className="w-12 h-7 bg-gray-300 rounded-full relative
          peer-checked:bg-green-600
          after:absolute after:top-1 after:left-1
          after:h-5 after:w-5 after:bg-white
          after:rounded-full after:transition-all
          peer-checked:after:translate-x-5" />

      </label>

      <span className="font-medium">
        Enable Online Payments
      </span>

    </div>

    {errorMsg && (
      <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-red-600">
        {errorMsg}
      </div>
    )}

    <button
      type="submit"
      disabled={updateConfig.isPending}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-green-700 to-green-500 text-white font-semibold"
    >
      {updateConfig.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
      ) : (
        "Save Configuration"
      )}
    </button>

  </form>

</div>

)}
  
</div>
  );
}
