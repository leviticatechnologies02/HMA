import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  User,
  Phone,
  FileText,
  ArrowRight,
  ChevronLeft,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import { useBookingStore } from "../../store/bookingStore";
import {
  usePatchBookingApplicant,
  useInitiateBooking,
} from "../../hooks/useBooking";
import { useAuthStore } from "../../store/authStore";
import { ModernDatePicker } from "../../components/common/ModernDatePicker";
import {
  createStudentPresignedUploadUrl,
  uploadFileToPresignedUrl,
  validateStudentUploadFile,
} from "../../api/student.api";
import type { BookingApplicantPayload } from "../../api/booking.api";
import toast from "react-hot-toast";

const schema = z.object({
  full_name: z
    .string()
    .min(2, "Full name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Full name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine(
      (val) => val.trim().length >= 2,
      "Full name must be at least 2 characters",
    ),

  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) return false;

      const [year, month, day] = val.split("-").map(Number);

      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) return false;

      if (month < 1 || month > 12) return false;

      const daysInMonth = new Date(year, month, 0).getDate();
      if (day < 1 || day > daysInMonth) return false;

      const dob = new Date(year, month - 1, day);

      if (
        dob.getFullYear() !== year ||
        dob.getMonth() !== month - 1 ||
        dob.getDate() !== day
      ) {
        return false;
      }

      const today = new Date();
      if (dob >= today) return false;

      let age = today.getFullYear() - year;
      const m = today.getMonth() - (month - 1);

      if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
      }

      return age >= 15;
    }, "Please enter a valid Date of Birth"),
  gender: z
    .string()
    .min(1, "Gender is required")
    .refine(
      (val) => ["M", "F", "Other"].includes(val),
      "Invalid gender selection",
    ),
  occupation: z
    .string()
    .min(2, "Occupation is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Occupation can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine((val) => val.trim().length >= 2, "Occupation must be valid"),
  institution: z
    .string()
    .min(2, "Institution is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Institution can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine((val) => val.trim().length >= 2, "Institution must be valid"),
  current_address: z

    .string()
    .min(5, "Current address is required")
    .max(250, "Address is too long")
    .regex(/^[a-zA-Z0-9\s,.\-/#()]+$/, "Address contains invalid characters")
    .refine((value) => /\b\d{6}\b/.test(value), {
      message: "Address must contain a valid 6-digit Pincode.",
    }),
  id_type: z
    .string()
    .min(1, "ID type is required")
    .refine(
      (val) => ["Aadhar", "PAN", "DL", "Passport", "VoterID"].includes(val),
      "Invalid ID type",
    ),
  emergency_contact_name: z
    .string()
    .min(2, "Emergency contact name is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine(
      (val) => val.trim().length >= 2,
      "Emergency contact name must be at least 2 characters",
    ),
  emergency_contact_phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .refine((val) => /^[6-9]/.test(val), "Phone must start with 6-9"),
  emergency_contact_relationship: z
    .string()
    .min(2, "Relationship is required")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Relationship can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine((val) => val.trim().length >= 2, "Relationship must be valid"),
  guardian_name: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s'-]+$/.test(val),
      "Guardian name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .refine(
      (val) => !val || val.trim().length >= 2,
      "Guardian name must be at least 2 characters if provided",
    ),
  guardian_phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[0-9]{10}$/.test(val),
      "Guardian phone must be 10 digits",
    )
    .refine(
      (val) => !val || /^[6-9]/.test(val),
      "Guardian phone must start with 6-9",
    ),
  special_requirements: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z0-9\s,.\-()&]+$/.test(val),
      "Special requirements contains invalid characters",
    )
    .refine(
      (val) => !val || /[a-zA-Z0-9]/.test(val),
      "Special requirements cannot contain only symbols",
    ),
});
type FormValues = z.infer<typeof schema>;

const STEPS = ["Personal Info", "Emergency Contact", "Identity & Docs"];

export function BookingDetailsPage() {
  const navigate = useNavigate();
  const userId = useAuthStore((s) => s.userId);
  const [step, setStep] = useState(0);
  const bookingId = useBookingStore((s) => s.bookingId);
  const setApplicant = useBookingStore((s) => s.setApplicant);
  const bookingStore = useBookingStore();
  const patchMutation = usePatchBookingApplicant();
  const initiateMutation = useInitiateBooking();


  const [docFile, setDocFile] = useState<File | null>(null);
  const [docUrl, setDocUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });


  const watchedValues = watch();
  const selectedIdType = watch("id_type");


  const stepFieldConfigs = [
    {
      name: "Step 1 - Personal Info",
      fields: [
        "full_name",
        "date_of_birth",
        "gender",
        "occupation",
        "institution",
        "current_address",
      ],
    },
    {
      name: "Step 2 - Emergency Contact",
      fields: [
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship",
      ],
    },
    {
      name: "Step 3 - Identity & Docs",
      fields: ["id_type"],
    },
  ];


  const isCurrentStepValid = useMemo(() => {
    const currentFields = stepFieldConfigs[step].fields;
    const hasErrors = currentFields.some(
      (field) => errors[field as keyof FormValues],
    );
    const areFieldsFilled = currentFields.every((field) => {
      const value = getValues(field as keyof FormValues);
      if (!value) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    });
    return !hasErrors && areFieldsFilled;
  }, [step, errors, watchedValues, getValues]);


  const initiatedRef = useRef(false);
  const initiatePromiseRef = useRef<Promise<any> | null>(null);

  useEffect(() => {
    if (initiatedRef.current || bookingStore.bookingId) return;
    if (
      !bookingStore.hostelId ||
      !bookingStore.roomId ||
      !bookingStore.bookingMode ||
      !bookingStore.checkInDate ||
      !bookingStore.checkOutDate ||
      !userId
    )
      return;
    initiatedRef.current = true;
    const baseAmount = Math.max(
      0,
      (bookingStore.grandTotal || 0) - (bookingStore.securityDeposit || 0),
    );
    const promise = initiateMutation
      .mutateAsync({
        hostel_id: String(bookingStore.hostelId),
        room_id: String(bookingStore.roomId),
        booking_mode: bookingStore.bookingMode!,
        check_in_date: bookingStore.checkInDate?.split("T")[0]!,
        check_out_date: bookingStore.checkOutDate?.split("T")[0]!,
        total_nights: bookingStore.bookingMode === "daily" ? (bookingStore.duration || 0) : 0,
        total_months: bookingStore.bookingMode === "monthly" ? (bookingStore.duration || 0) : 0,
        base_rent_amount: baseAmount,
        security_deposit: bookingStore.securityDeposit || 0,
        booking_advance: bookingStore.bookingAdvance || 0,
        grand_total: bookingStore.grandTotal,
      })
      .then((initiated) => {
        bookingStore.setDraftBooking(
          initiated.booking_id,
          initiated.booking_number,
        );
        return initiated;
      })
      .catch((err) => {
        initiatedRef.current = false;

        const detail = err?.response?.data?.detail;
        if (detail) {
          if (typeof detail === "string") {
            if (detail.toLowerCase().includes("no beds available") || err.response.status === 409) {
              toast.error("Beds are not available for the selected dates.");
            } else {
              toast.error(detail);
            }
          } else if (Array.isArray(detail)) {
            toast.error(detail.map((d: any) => d.msg).join(", "));
          }
          navigate(-1);
        }

        return null;
      });
    initiatePromiseRef.current = promise;

  }, [userId]);

  const handleFileSelect = async (file: File) => {
    const err = validateStudentUploadFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setDocFile(file);
    if (!userId) return;
    setUploading(true);
    setUploadProgress(30);

    try {
      const presigned = await createStudentPresignedUploadUrl(userId, {
        file_name: file.name,
        content_type: file.type,
        file_size: file.size,
      });
      setUploadProgress(70);

      const isMock =
        presigned.upload_url.includes("X-Amz-Mock=true") ||
        presigned.upload_url.includes("localhost");
      if (!isMock) {
        await uploadFileToPresignedUrl(presigned.upload_url, file, file.type);
      }

      setUploadProgress(100);
      setDocUrl(presigned.file_url);
      toast.success("Document uploaded");
    } catch {
      setDocUrl(`local://${file.name}`);
      toast.success("Document saved locally");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = async () => {
    if (!isCurrentStepValid) {
      toast.error(
        `Please fill all required fields correctly in ${stepFieldConfigs[step].name}`,
      );
      return;
    }
    const fields: (keyof FormValues)[][] = [
      [
        "full_name",
        "date_of_birth",
        "gender",
        "occupation",
        "institution",
        "current_address",
      ],
      [
        "emergency_contact_name",
        "emergency_contact_phone",
        "emergency_contact_relationship",
      ],
      ["id_type"],
    ];
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      ...values,
      id_document_url: docUrl || undefined,
    } as BookingApplicantPayload;
    try {
      let currentBookingId = bookingStore.bookingId;

      if (!currentBookingId) {
        if (initiatePromiseRef.current) {
          const result = await initiatePromiseRef.current;
          currentBookingId = result?.booking_id ?? bookingStore.bookingId;
        }
      }

      if (!currentBookingId) {
        const baseAmount = Math.max(
          0,
          (bookingStore.grandTotal || 0) - (bookingStore.securityDeposit || 0),
        );
        const initiated = await initiateMutation.mutateAsync({
          hostel_id: String(bookingStore.hostelId),
          room_id: String(bookingStore.roomId),
          booking_mode: bookingStore.bookingMode!,
          check_in_date: bookingStore.checkInDate?.split("T")[0]!,
          check_out_date: bookingStore.checkOutDate?.split("T")[0]!,
          total_nights: bookingStore.bookingMode === "daily" ? (bookingStore.duration || 0) : 0,
          total_months: bookingStore.bookingMode === "monthly" ? (bookingStore.duration || 0) : 0,
          base_rent_amount: baseAmount,
          security_deposit: bookingStore.securityDeposit || 0,
          booking_advance: bookingStore.bookingAdvance || 0,
          grand_total: bookingStore.grandTotal,
        });
        currentBookingId = initiated.booking_id;
        bookingStore.setDraftBooking(
          initiated.booking_id,
          initiated.booking_number,
        );
      }

      await patchMutation.mutateAsync({
        bookingId: currentBookingId!,
        payload,
      });
      setApplicant({ ...values, id_document_url: docUrl });
      navigate("/booking/checkout");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail.map((d: any) => d.msg).join(", "));
      } else {
        toast.error(err?.message ?? "Failed to save details. Try again.");
      }
    }
  });

  const inputCls = (err?: { message?: string }) =>
    `input-field ${err ? "border-error focus:ring-error/20" : ""}`;

  const filterNameInput = (value: string) =>
    value.replace(/[^a-zA-Z\s'-]/g, "");
  const filterInstitutionInput = (value: string) =>
    value.replace(/[^a-zA-Z\s'-]/g, "");
  const filterAddressInput = (value: string) =>
    value.replace(/[^a-zA-Z0-9\s,.\-/#()]/g, "");
  const filterPhoneInput = (value: string) =>
    value.replace(/[^0-9]/g, "").slice(0, 10);

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-dark">
            Applicant Details
          </h1>
          <p className="mt-1 text-slate-500">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${i < step
                  ? "bg-success text-white"
                  : i === step
                    ? "bg-primary text-white"
                    : "bg-slate-200 text-slate-500"
                  }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 rounded transition-all ${i < step ? "bg-success" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Full Name *
                </label>
                <input
                  {...register("full_name", {
                    onChange: (e) => {
                      e.target.value = filterNameInput(e.target.value);
                    },
                  })}
                  className={inputCls(errors.full_name)}
                  placeholder="As per ID document"
                  onInput={(e) => {
                    e.currentTarget.value = filterNameInput(
                      e.currentTarget.value,
                    );
                  }}
                />
                {errors.full_name && (
                  <p className="mt-1 text-xs text-error">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Date of Birth *
                  </label>
                  <ModernDatePicker
                    max={
                      new Date(
                        new Date().getFullYear() - 15,
                        new Date().getMonth(),
                        new Date().getDate(),
                      )
                        .toISOString()
                        .split("T")[0]
                    }
                    {...register("date_of_birth")}
                    className={inputCls(errors.date_of_birth)}
                  />
                  {errors.date_of_birth && (
                    <p className="mt-1 text-xs text-error">
                      {errors.date_of_birth.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Gender *
                  </label>
                  <select
                    {...register("gender")}
                    className={inputCls(errors.gender)}
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-xs text-error">
                      {errors.gender.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Occupation *
                  </label>
                  <input
                    {...register("occupation", {
                      onChange: (e) => {
                        e.target.value = filterNameInput(e.target.value);
                      },
                    })}
                    className={inputCls(errors.occupation)}
                    placeholder="Student / Professional"
                    onInput={(e) => {
                      e.currentTarget.value = filterNameInput(
                        e.currentTarget.value,
                      );
                    }}
                  />
                  {errors.occupation && (
                    <p className="mt-1 text-xs text-error">
                      {errors.occupation.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Institution *
                  </label>
                  <input
                    {...register("institution", {
                      onChange: (e) => {
                        e.target.value = filterInstitutionInput(e.target.value);
                      },
                    })}
                    className={inputCls(errors.institution)}
                    placeholder="College / Company"
                    onInput={(e) => {
                      e.currentTarget.value = filterInstitutionInput(
                        e.currentTarget.value,
                      );
                    }}
                  />
                  {errors.institution && (
                    <p className="mt-1 text-xs text-error">
                      {errors.institution.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Current Address *
                </label>
                <textarea
                  {...register("current_address")}
                  rows={3}
                  className={inputCls(errors.current_address)}
                  placeholder="Enter your complete address"
                  onInput={(e) => {
                    e.currentTarget.value = filterAddressInput(
                      e.currentTarget.value,
                    );
                  }}
                />
                {errors.current_address && (
                  <p className="mt-1 text-xs text-error">
                    {errors.current_address.message}
                  </p>
                )}
              </div>
            </div>
          )}


          {step === 1 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Emergency Contact
              </h2>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Contact Name *
                </label>
                <input
                  {...register("emergency_contact_name", {
                    onChange: (e) => {
                      e.target.value = filterNameInput(e.target.value);
                    },
                  })}
                  className={inputCls(errors.emergency_contact_name)}
                  placeholder="Parent / Guardian"
                  onInput={(e) => {
                    e.currentTarget.value = filterNameInput(
                      e.currentTarget.value,
                    );
                  }}
                />
                {errors.emergency_contact_name && (
                  <p className="mt-1 text-xs text-error">
                    {errors.emergency_contact_name.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Phone *
                  </label>
                  <input
                    {...register("emergency_contact_phone", {
                      onChange: (e) => {
                        e.target.value = filterPhoneInput(e.target.value);
                      },
                    })}
                    type="tel"
                    className={inputCls(errors.emergency_contact_phone)}
                    placeholder="10-digit number"
                    onInput={(e) => {
                      e.currentTarget.value = filterPhoneInput(
                        e.currentTarget.value,
                      );
                    }}
                    maxLength={10}
                  />
                  {errors.emergency_contact_phone && (
                    <p className="mt-1 text-xs text-error">
                      {errors.emergency_contact_phone.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Relationship *
                  </label>
                  <input
                    {...register("emergency_contact_relationship", {
                      onChange: (e) => {
                        e.target.value = filterNameInput(e.target.value);
                      },
                    })}
                    className={inputCls(errors.emergency_contact_relationship)}
                    placeholder="Mother / Father"
                    onInput={(e) => {
                      e.currentTarget.value = filterNameInput(
                        e.currentTarget.value,
                      );
                    }}
                  />
                  {errors.emergency_contact_relationship && (
                    <p className="mt-1 text-xs text-error">
                      {errors.emergency_contact_relationship.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Guardian Name
                  </label>
                  <input
                    {...register("guardian_name", {
                      onChange: (e) => {
                        e.target.value = filterNameInput(e.target.value);
                      },
                    })}
                    className="input-field"
                    placeholder="Optional"
                    onInput={(e) => {
                      e.currentTarget.value = filterNameInput(
                        e.currentTarget.value,
                      );
                    }}
                  />
                  {errors.guardian_name && (
                    <p className="mt-1 text-xs text-error">
                      {errors.guardian_name.message as string}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Guardian Phone
                  </label>
                  <input
                    {...register("guardian_phone", {
                      onChange: (e) => {
                        e.target.value = filterPhoneInput(e.target.value);
                      },
                    })}
                    type="tel"
                    className="input-field"
                    placeholder="Optional"
                    onInput={(e) => {
                      e.currentTarget.value = filterPhoneInput(
                        e.currentTarget.value,
                      );
                    }}
                    maxLength={10}
                  />
                  {errors.guardian_phone && (
                    <p className="mt-1 text-xs text-error">
                      {errors.guardian_phone.message as string}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Special Requirements
                </label>
                <textarea
                  {...register("special_requirements")}
                  rows={2}
                  className="input-field"
                  placeholder="Dietary restrictions, mobility needs..."
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /[^a-zA-Z0-9\s,.\-()&]/g,
                      "",
                    );
                  }}
                />
                {errors.special_requirements && (
                  <p className="mt-1 text-xs text-error">
                    {errors.special_requirements.message as string}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
              <h2 className="font-bold text-dark flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Identity Document
              </h2>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  ID Type *
                </label>
                <select
                  {...register("id_type")}
                  className={inputCls(errors.id_type)}
                >
                  <option value="">Select ID type</option>
                  <option value="Aadhar">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="DL">Driving License</option>
                  <option value="Passport">Passport</option>
                  <option value="VoterID">Voter ID</option>
                </select>
                {errors.id_type && (
                  <p className="mt-1 text-xs text-error">
                    {errors.id_type.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Upload Document
                </label>

                <div
                  onClick={() => {
                    if (selectedIdType) {
                      fileRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    if (selectedIdType) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    if (!selectedIdType) return;

                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) handleFileSelect(f);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all
      ${!selectedIdType
                      ? "border-slate-200 bg-slate-100 cursor-not-allowed opacity-60"
                      : docUrl
                        ? "border-success bg-success/5 cursor-pointer"
                        : "border-slate-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
                    }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    disabled={!selectedIdType}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileSelect(f);
                    }}
                  />

                  {!selectedIdType ? (
                    <div>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-slate-500">
                        Upload will be enabled after selecting an ID Type
                      </p>
                    </div>
                  ) : docUrl ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="w-8 h-8 text-success" />
                      <div className="text-left">
                        <p className="font-semibold text-success text-sm">
                          Document uploaded
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">
                          {docFile?.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocFile(null);
                          setDocUrl("");
                        }}
                        className="ml-auto p-1 rounded-lg hover:bg-slate-100"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  ) : uploading ? (
                    <div className="space-y-2">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-500">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-medium text-dark">
                        Click or drag to upload
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPG, PNG, WEBP, PDF • Max 10MB
                      </p>
                    </div>
                  )}
                </div>

                {touchedFields.id_type && !selectedIdType && (
                  <p className="mt-2 text-xs text-amber-600">
                    Please select an ID Type before uploading the document.
                  </p>
                )}
              </div>
            </div>
          )}


          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() =>
                step === 0 ? navigate(-1) : setStep((s) => s - 1)
              }
              className="flex-1 flex items-center justify-center gap-2 btn-outline"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 0 ? "Back" : "Previous"}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isCurrentStepValid}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !isCurrentStepValid
                    ? "Please fill all required fields correctly before proceeding"
                    : ""
                }
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={
                  patchMutation.isPending ||
                  uploading ||
                  !docUrl ||
                  !isCurrentStepValid
                }
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !docUrl
                    ? "Please upload an identity document before proceeding"
                    : !isCurrentStepValid
                      ? "Please select an ID type"
                      : ""
                }
              >
                {patchMutation.isPending
                  ? "Saving..."
                  : uploading
                    ? "Uploading..."
                    : "Review & Pay"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
