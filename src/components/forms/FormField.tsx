import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  hint?: string;
  as?: "input" | "textarea";
  rows?: number;
}

export default function FormField({ label, error, id, hint, as: Tag = "input", rows = 3, className = "", ...props }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const base = `input-field ${error ? "border-error focus:ring-error/20 focus:border-error" : ""} ${className}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-dark">
        {label}
        {props.required && <span className="text-error ml-0.5">*</span>}
      </label>
      {Tag === "textarea" ? (
        <textarea id={fieldId} rows={rows} className={base} {...(props as any)} />
      ) : (
        <input id={fieldId} className={base} {...props} />
      )}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      {error && <p className="text-xs text-error flex items-center gap-1"> {error.message}</p>}
    </div>
  );
}