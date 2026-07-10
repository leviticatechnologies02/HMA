import { Save, Building2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAdminHostelProfile, useAdminMyHostels, useUpdateAdminHostelProfile, useUploadAdminHostelImages } from "../../hooks/useAdminData";
import { useAuthStore } from "../../store/authStore";
import type { AdminHostelProfilePayload } from "../../api/admin.api";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

const validationSchema = Yup.object().shape({
  name: Yup.string().trim().required("Hostel name is required"),
  description: Yup.string().trim().required("Description is required"),
  address_line1: Yup.string().trim().required("Address line 1 is required"),
  address_line2: Yup.string().trim(),
  city: Yup.string().trim().required("City is required"),
  state: Yup.string().trim().required("State is required"),
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  phone: Yup.string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
      "Enter a valid Indian phone number"
    ),
  email: Yup.string().trim().email("Enter a valid email").required("Email is required"),
  website: Yup.string()
    .trim()
    .notRequired()
    .test(
      "is-url",
      "Enter a valid website URL",
      (value) => !value || /^(https?:\/\/)[^\s]+$/.test(value)
    ),
  is_public: Yup.boolean(),
  is_featured: Yup.boolean(),
  rules_and_regulations: Yup.string().trim(),
});

export function AdminHostelProfilePage() {
  const userId = useAuthStore((s) => s.userId);
  const hostelIds = useAuthStore((s) => s.hostelIds);
  const activeHostelId = useAuthStore((s) => s.activeHostelId);
  const setActiveHostelId = useAuthStore((s) => s.setActiveHostelId);
  const [selectedHostelId, setSelectedHostelId] = useState<string | null>(
    activeHostelId ?? hostelIds[0] ?? null
  );

  useEffect(() => {
    if (activeHostelId && activeHostelId !== selectedHostelId) {
      setSelectedHostelId(activeHostelId);
    }
  }, [activeHostelId]); // eslint-disable-line react-hooks/exhaustive-deps

  const hostelsQuery = useAdminMyHostels(userId, hostelIds);
  const actualHostelIds = hostelsQuery.data?.map((h: any) => h.id) ?? hostelIds;

  useEffect(() => {
    if (hostelsQuery.data && hostelsQuery.data.length > 0) {
      const validIds = hostelsQuery.data.map((h: any) => h.id);
      if (!selectedHostelId || !validIds.includes(selectedHostelId)) {
        const firstId = validIds[0];
        setSelectedHostelId(firstId);
        setActiveHostelId(firstId);
      }
    }
  }, [hostelsQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const profileQuery = useAdminHostelProfile(userId, selectedHostelId, actualHostelIds);
  const updateMutation = useUpdateAdminHostelProfile(userId, selectedHostelId, actualHostelIds);
  const uploadMutation = useUploadAdminHostelImages(userId, selectedHostelId, actualHostelIds);

  const [saved, setSaved] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialValues: AdminHostelProfilePayload = {
    name: profileQuery.data?.name ?? "",
    description: profileQuery.data?.description ?? "",
    address_line1: profileQuery.data?.address_line1 ?? "",
    address_line2: profileQuery.data?.address_line2 ?? "",
    city: profileQuery.data?.city ?? "",
    state: profileQuery.data?.state ?? "",
    pincode: profileQuery.data?.pincode ?? "",
    phone: profileQuery.data?.phone ?? "",
    email: profileQuery.data?.email ?? "",
    website: profileQuery.data?.website ?? "",
    is_public: profileQuery.data?.is_public ?? false,
    is_featured: profileQuery.data?.is_featured ?? false,
    rules_and_regulations: profileQuery.data?.rules_and_regulations ?? "",
  };

  const formik = useFormik<AdminHostelProfilePayload>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      const payload: AdminHostelProfilePayload = {
        ...values,
        address_line2: values.address_line2 || undefined,
        website: values.website || undefined,
        rules_and_regulations: values.rules_and_regulations || undefined,
      };
      await updateMutation.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  useEffect(() => {
    setSaved(false);
    setPincodeError(null);
    setPincodeLoading(false);
  }, [profileQuery.data, selectedHostelId]);

  const handleHostelChange = (id: string) => {
    setSelectedHostelId(id);
    setActiveHostelId(id);
  };

  const handlePincodeChange = async (value: string) => {
    formik.setFieldValue("pincode", value);
    setPincodeError(null);

    if (value.length !== 6 || !/^\d{6}$/.test(value)) {
      return;
    }

    setPincodeLoading(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
      const data = await res.json();
      if (data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        formik.setFieldValue("city", po.District);
        formik.setFieldValue("state", po.State);
        setPincodeError(null);
      } else {
        setPincodeError("Pincode not found");
      }
    } catch {
      setPincodeError("Could not fetch pincode data");
    } finally {
      setPincodeLoading(false);
    }
  };
  const handleImageUpload = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);

  setImages((prev) => [...prev, ...files]);
};

  if (!userId || !hostelIds.length) {
    return <div className="p-8 text-slate-500">Login as admin with assigned hostels.</div>;
  }
 const handleUploadImages = async () => {
  if (images.length === 0) {
    toast.error("Please select at least one image.");
    return;
  }

  setUploading(true);

  // Loading toast
  const toastId = toast.loading("Uploading images...");

  try {
    // The API expects a single file upload per request with the field name "file"
    for (const image of images) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("image_type", "gallery");
      formData.append("is_primary", "false");
      
      await uploadMutation.mutateAsync(formData);
    }

    toast.success("Images uploaded successfully!", {
      id: toastId,
    });

    setImages([]);
    if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
  } catch (error) {
    console.error(error);

    toast.error("Image upload failed!", {
      id: toastId,
    });
  } finally {
    setUploading(false);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-dark dark:text-white">Hostel Profile</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">Update listing details, contacts, and visibility settings.</p>
        </div>
        <button
          type="button"
          onClick={() => formik.submitForm()}
          disabled={updateMutation.isPending || profileQuery.isLoading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 shrink-0 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
        >
          <Save className="w-4 h-4" />
          {updateMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-5 md:p-6">
        <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-2 sm:mb-3">Select Hostel</label>
        <select
          className="input-field w-full text-sm sm:text-base min-h-12 sm:min-h-10"
          value={selectedHostelId ?? ""}
          onChange={(e) => handleHostelChange(e.target.value)}
          style={{ fontSize: "16px" }}
        >
          {(hostelsQuery.data ?? []).map((h: any) => (
            <option key={h.id} value={h.id}>
              {h.name} — {h.city}
            </option>
          ))}
        </select>
      </section>

      {profileQuery.isLoading && (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton h-10 sm:h-14 rounded-xl" />
          ))}
        </div>
      )}

      {profileQuery.isError && (
        <div className="p-4 sm:p-6 text-center text-error bg-error/5 rounded-2xl border border-error/20 text-xs sm:text-sm">
          Failed to load hostel profile.
        </div>
      )}

      {profileQuery.data && !profileQuery.isLoading && (
        <form className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 sm:p-6 space-y-4 sm:space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Basic Information</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Hostel Name</label>
                <input
                  className="input-field text-sm"
                  name="name"
                  value={formik.values.name ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Hostel name"
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="mt-1 text-xs text-error">{formik.errors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Hostel Type</label>
                <div className="input-field bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed capitalize text-sm">
                  {profileQuery.data.hostel_type?.replace("_", "-")} (managed by super admin)
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Description</label>
                <textarea
                  className="input-field min-h-24 text-sm"
                  name="description"
                  value={formik.values.description ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Describe your hostel..."
                />
                {formik.touched.description && formik.errors.description && (
                  <p className="mt-1 text-xs text-error">{formik.errors.description}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Rules & Regulations</label>
                <textarea
                  className="input-field min-h-24 text-sm"
                  name="rules_and_regulations"
                  value={formik.values.rules_and_regulations ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="House rules, curfew, policies..."
                />
                {formik.touched.rules_and_regulations && formik.errors.rules_and_regulations && (
                  <p className="mt-1 text-xs text-error">{formik.errors.rules_and_regulations}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Contact Details</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Email</label>
                <input
                  className="input-field text-sm"
                  name="email"
                  type="email"
                  value={formik.values.email ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="hostel@email.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-1 text-xs text-error">{formik.errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Phone</label>
                <input
                  className="input-field text-sm"
                  name="phone"
                  value={formik.values.phone ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="+91 XXXXX XXXXX"
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="mt-1 text-xs text-error">{formik.errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Website</label>
                <input
                  className="input-field text-sm"
                  name="website"
                  value={formik.values.website ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://..."
                />
                {formik.touched.website && formik.errors.website && (
                  <p className="mt-1 text-xs text-error">{formik.errors.website}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Address</h2>
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Address Line 1</label>
                <input
                  className="input-field text-sm"
                  name="address_line1"
                  value={formik.values.address_line1 ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Street address"
                />
                {formik.touched.address_line1 && formik.errors.address_line1 && (
                  <p className="mt-1 text-xs text-error">{formik.errors.address_line1}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">Address Line 2 (optional)</label>
                <input
                  className="input-field text-sm"
                  name="address_line2"
                  value={formik.values.address_line2 ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Landmark, area..."
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">City</label>
                <input
                  className="input-field text-sm"
                  name="city"
                  value={formik.values.city ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="City"
                />
                {formik.touched.city && formik.errors.city && (
                  <p className="mt-1 text-xs text-error">{formik.errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">State</label>
                <input
                  className="input-field text-sm"
                  name="state"
                  value={formik.values.state ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="State"
                />
                {formik.touched.state && formik.errors.state && (
                  <p className="mt-1 text-xs text-error">{formik.errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-dark dark:text-slate-200 mb-1">
                  Pincode
                  {pincodeLoading && <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">Looking up...</span>}
                  {pincodeError && <span className="ml-2 text-xs text-error">{pincodeError}</span>}
                </label>
                <input
                  className="input-field text-sm"
                  name="pincode"
                  value={formik.values.pincode ?? ""}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. 400001"
                  maxLength={6}
                />
                {formik.touched.pincode && formik.errors.pincode && (
                  <p className="mt-1 text-xs text-error">{formik.errors.pincode}</p>
                )}
                {!pincodeError && !pincodeLoading && formik.values.pincode?.length === 6 && (
                  <p className="mt-1 text-xs text-success">City and State auto-filled</p>
                )}
              </div>
            </div>
          </div>

          <div>
  <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
    Hostel Images
  </h2>

  {/* Choose File */}
  <input
  ref={fileInputRef}
    type="file"
    multiple
    accept="image/*"
    onChange={handleImageUpload}
    className="w-full border border-slate-300 rounded-xl p-3"
  />

  {/* Preview */}
  {images.length > 0 && (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-5">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative rounded-xl overflow-hidden border border-slate-300"
        >
          <img
            src={URL.createObjectURL(image)}
            alt="preview"
            className="w-full h-32 object-cover"
          />

          <button
            type="button"
            onClick={() =>
              setImages(images.filter((_, i) => i !== index))
            }
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}

  {/* Upload Button */}
  {images.length > 0 && (
    <button
      type="button"
      onClick={handleUploadImages}
      disabled={uploading}
      className="mt-5 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50"
    >
      {uploading ? "Uploading..." : "Upload Images"}
    </button>
  )}
</div>

          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 sm:mb-4">Visibility</h2>
            <div className="flex flex-col gap-3">
              <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formik.values.is_public ?? false}
                  onChange={formik.handleChange}
                  className="w-4 h-4 accent-primary mt-0.5 sm:mt-0"
                />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-dark dark:text-slate-200">Public listing</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hostel appears in search results and public pages</p>
                </div>
              </label>
              <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formik.values.is_featured ?? false}
                  onChange={formik.handleChange}
                  className="w-4 h-4 accent-primary mt-0.5 sm:mt-0"
                />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-dark dark:text-slate-200">Featured hostel</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Shown prominently on the landing page</p>
                </div>
              </label>
            </div>
          </div>

          {updateMutation.isError && (
            <div className="rounded-xl bg-error/10 border border-error/20 p-3 text-xs sm:text-sm text-error">
              Failed to save changes. Please try again.
            </div>
          )}
        </form>
      )}

      {!profileQuery.data && !profileQuery.isLoading && !profileQuery.isError && (
        <div className="text-center py-12 sm:py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <Building2 className="w-10 sm:w-12 h-10 sm:h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2 sm:mb-3" />
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Select a hostel above to edit its profile.</p>
        </div>
      )}
    </div>
  );
}
