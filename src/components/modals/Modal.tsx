// components/Modal.tsx
import { Suspense, useEffect } from "react";
import { X } from "lucide-react";
import { useModal } from "../../context/ModalContext";
import { formRegistry } from "./formRegistry";
import { getModalTitle } from "./modalTitles";

export function Modal() {
  const { modalOpen, modalType, editingItem, closeModal } = useModal();

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modalOpen) {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [modalOpen, closeModal]);

  // Return null if no modal is open or modalType is null
  if (!modalOpen || !modalType) return null;

  // Assert that modalType is not null when accessing registry
  const FormComponent = formRegistry[modalType as keyof typeof formRegistry];
  const title = getModalTitle(modalType, editingItem);

  // If form component doesn't exist, return null
  if (!FormComponent) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={closeModal}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-3xl">
            <h2 className="text-xl font-heading font-bold text-dark dark:text-white">{title}</h2>
            <button
              onClick={closeModal}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-slate-400"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading form...</p>
                </div>
              }
            >
              <FormComponent editingItem={editingItem} onClose={closeModal} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}