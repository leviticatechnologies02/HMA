export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "h-5 w-5 border-2", md: "h-9 w-9 border-2", lg: "h-14 w-14 border-[3px]" }[size];
  return (
    <div className="flex items-center justify-center p-6">
      <div className={`${s} animate-spin rounded-full border-slate-200 border-t-primary`} />
    </div>
  );
}