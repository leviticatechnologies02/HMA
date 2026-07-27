import React, { useState, useEffect } from "react";
import { CreditCard, Eye, EyeOff, Info, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAdminPaymentConfig, useUpdateAdminPaymentConfig } from "../../hooks/useAdminData";
import toast from "react-hot-toast";
import { type PaymentConfigPayload } from "../../api/admin.api";

// ----------------------------------------------------------------------------
// PasswordToggleInput Component
// ----------------------------------------------------------------------------
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

// ----------------------------------------------------------------------------
// AdminPaymentSettingsPage Component
// ----------------------------------------------------------------------------
export function AdminPaymentSettingsPage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId) ?? hostelIds[0] ?? null;

  const { data: config, isLoading, isError } = useAdminPaymentConfig(userId, hostelIds, activeHostelId);
  const updateConfig = useUpdateAdminPaymentConfig(userId, hostelIds, activeHostelId);

  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state when data is fetched
  useEffect(() => {
    if (config) {
      setKeyId(config.razorpay_key_id || "");
      setIsActive(config.is_active ?? false);
      // Secrets are intentionally never populated from backend
      setKeySecret("");
      setWebhookSecret("");
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
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
      razorpay_key_id: idTrimmed,
      is_active: isActive,
    };

    if (keySecret.trim()) {
      payload.razorpay_key_secret = keySecret.trim();
    }
    if (webhookSecret.trim()) {
      payload.razorpay_webhook_secret = webhookSecret.trim();
    }

    updateConfig.mutate(payload, {
      onSuccess: () => {
        toast.success("Payment configuration saved successfully.");
        // Clear secret fields after save for security
        setKeySecret("");
        setWebhookSecret("");
      },
      onError: (err: any) => {
        toast.error("Something went wrong. Please try again.");
        setErrorMsg(err?.response?.data?.message || "Failed to save configuration.");
      },
    });
  };

  const isConfigured = config?.is_configured ?? false;

  // Masked Key ID for display
  const maskedDisplayId = config?.razorpay_key_id
    ? config.razorpay_key_id.substring(0, 12) + "••••••••"
    : "";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold font-heading text-dark flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payment Settings
        </h1>
        <p className="text-sm text-slate-500">Configure your Razorpay account to accept student payments</p>
      </div>

      {isLoading ? (
        <div className="card p-6 flex flex-col gap-4 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ) : isError ? (
        <div className="card p-6 bg-error/10 border-error/20 text-error">
          <p className="flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Failed to load payment configuration. Please try again.
          </p>
        </div>
      ) : (
        <>
          {/* Status Card */}
          <div
            className={`card p-6 border ${
              isConfigured && config?.is_active
                ? "border-success/30 bg-success/5"
                : isConfigured && !config?.is_active
                ? "border-warning/30 bg-warning/5"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            }`}
          >
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Current Status</h2>
            {isConfigured ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {config.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  )}
                  <span
                    className={`font-medium ${
                      config.is_active ? "text-success" : "text-warning"
                    }`}
                  >
                    Online payments are {config.is_active ? "ACTIVE" : "PAUSED"}
                  </span>
                </div>
                <div className="pl-7 space-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Key ID: <span className="font-mono text-xs bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{maskedDisplayId}</span>
                  </p>
                  {!config.is_active && (
                    <p className="text-sm text-slate-500">
                      Students cannot pay online until you re-enable payments.
                    </p>
                  )}
                  {config.updated_at && (
                    <p className="text-xs text-slate-400 pt-1">
                      Last updated: {new Date(config.updated_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Online payments are not configured</span>
                </div>
                <p className="text-sm text-slate-500 pl-7">
                  Students cannot pay online until you add your Razorpay keys. 👉 Fill in the form below to get started.
                </p>
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div className="card">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-dark">Razorpay Configuration</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-dark dark:text-slate-200">
                    Razorpay Key ID <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    placeholder="rzp_test_xxxxxxxxxx or rzp_live_xxxxxxxxxx"
                    className="input w-full"
                  />
                </div>

                <PasswordToggleInput
                  label="Razorpay Key Secret"
                  required={!isConfigured}
                  value={keySecret}
                  onChange={(e) => setKeySecret(e.target.value)}
                  placeholder={isConfigured ? "Leave blank to keep existing secret" : "Enter your Key Secret"}
                />

                <PasswordToggleInput
                  label="Webhook Secret"
                  required={false}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder={isConfigured ? "Leave blank to keep existing secret" : "Enter your Webhook Secret (optional)"}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                </label>
                <div>
                  <p className="text-sm font-medium text-dark dark:text-slate-200">Enable Online Payments</p>
                  <p className="text-xs text-slate-500">Turn off to temporarily disable online payments for your hostel</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 text-error text-sm rounded-lg border border-error/20">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updateConfig.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {updateConfig.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Configuration
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original data
                    if (config) {
                      setKeyId(config.razorpay_key_id || "");
                      setIsActive(config.is_active ?? false);
                    } else {
                      setKeyId("");
                      setIsActive(false);
                    }
                    setKeySecret("");
                    setWebhookSecret("");
                    setErrorMsg(null);
                  }}
                  disabled={updateConfig.isPending}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Info Section */}
          <div className="card p-5 bg-primary/5 border-primary/10">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary">How to get your Razorpay Keys</h3>
                <ol className="list-decimal pl-4 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>Log in to your Razorpay Dashboard</li>
                  <li>Go to Settings → API Keys</li>
                  <li>Generate/copy your Key ID and Key Secret</li>
                  <li>Use Test keys for testing, and Live keys for production</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
