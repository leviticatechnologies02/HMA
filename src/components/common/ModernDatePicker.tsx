import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type ModernDatePickerProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDate(value?: string | number | readonly string[]) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export const ModernDatePicker = forwardRef<HTMLInputElement, ModernDatePickerProps>(function ModernDatePicker(
  {
    value,
    defaultValue,
    onChange,
    onBlur,
    min,
    max,
    name,
    className = "",
    placeholder = "Select date",
    disabled,
    readOnly,
    required,
    id,
    title,
    ...inputProps
  },
  forwardedRef,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ left: 16, top: 16, width: 288 });
  const [internalValue, setInternalValue] = useState(
    typeof defaultValue === "string" ? defaultValue : "",
  );
  const currentValue = typeof value === "string" ? value : internalValue;
  const selectedDate = parseDate(currentValue);
  const minimumDate = parseDate(min);
  const maximumDate = parseDate(max);
  const initialMonth = selectedDate ?? minimumDate ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (!selectedDate) return;
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [currentValue]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        rootRef.current
        && !rootRef.current.contains(event.target as Node)
        && !popoverRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const viewportPadding = 16;
      const calendarHeight = 360;
      const width = Math.min(288, window.innerWidth - viewportPadding * 2);
      const left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - width - viewportPadding,
      );
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < calendarHeight && rect.top > calendarHeight;
      const top = openAbove
        ? Math.max(viewportPadding, rect.top - calendarHeight - 8)
        : Math.min(rect.bottom + 8, window.innerHeight - calendarHeight - viewportPadding);

      setPopoverPosition({ left, top: Math.max(viewportPadding, top), width });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const emitChange = (nextValue: string) => {
    setInternalValue(nextValue);
    if (inputRef.current) inputRef.current.value = nextValue;
    onChange?.({
      target: { name: name ?? "", value: nextValue, type: "date" },
      currentTarget: { name: name ?? "", value: nextValue, type: "date" },
    } as ChangeEvent<HTMLInputElement>);
  };

  const closePicker = () => {
    setIsOpen(false);
    if (inputRef.current) {
      onBlur?.({ target: inputRef.current, currentTarget: inputRef.current } as FocusEvent<HTMLInputElement>);
    }
  };

  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
  });
  const today = new Date();

  const isOutsideRange = (date: Date) => {
    const valueToCompare = toDateValue(date);
    return (typeof min === "string" && valueToCompare < min)
      || (typeof max === "string" && valueToCompare > max);
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        {...inputProps}
        ref={inputRef}
        type="hidden"
        name={name}
        value={currentValue}
        required={required}
        readOnly
      />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        title={title}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => { if (!readOnly) setIsOpen((open) => !open); }}
        className={`input-field flex w-full items-center justify-between gap-3 text-left transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 ${readOnly ? "cursor-default" : ""} ${className}`}
      >
        <span className={currentValue ? "text-slate-700 dark:text-slate-100" : "text-slate-400"}>
          {currentValue ? formatDisplayDate(currentValue) : placeholder}
        </span>
        <CalendarDays className="h-4.5 w-4.5 shrink-0 text-primary" />
      </button>

      {isOpen && !disabled && !readOnly && typeof document !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Choose date"
          style={popoverPosition}
          className="fixed z-[9999] max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-dark dark:text-white">
              {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(visibleMonth)}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => moveMonth(-1)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800" aria-label="Previous month">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => moveMonth(1)} className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:hover:bg-slate-800" aria-label="Next month">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((date) => {
              const inCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isSelected = selectedDate ? sameDay(date, selectedDate) : false;
              const isToday = sameDay(date, today);
              const unavailable = isOutsideRange(date);
              return (
                <button
                  key={toDateValue(date)}
                  type="button"
                  disabled={unavailable}
                  onClick={() => {
                    emitChange(toDateValue(date));
                    closePicker();
                  }}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : unavailable
                        ? "cursor-not-allowed text-slate-300 dark:text-slate-700"
                        : inCurrentMonth
                          ? "text-slate-700 hover:bg-primary/10 hover:text-primary dark:text-slate-200"
                          : "text-slate-300 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800"
                  } ${isToday && !isSelected ? "ring-1 ring-inset ring-primary/40 text-primary" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
            <button type="button" onClick={() => { emitChange(""); closePicker(); }} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Clear
            </button>
            {!isOutsideRange(today) && (
              <button type="button" onClick={() => { emitChange(toDateValue(today)); closePicker(); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
                Today
              </button>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
});
