// contexts/ModalContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// Define all possible modal types (excluding null)
export type ModalType = 
  | "hostel"
  | "location"
  | "room"
  | "bed"
  | "transfer"
  | "booking"
  | "visitorBooking"
  | "tenant"
  | "tenantdetails"
  | "supervisor"
  | "supervisorNotice"
  | "payment"
  | "complaint"
  | "messmenu"
  | "notice"
  | "announcement"
  | "attendance"
  | "maintenance"
  | "admin"
  | "subscription"
  | "plan"
  | "confirmation";

// Define the context value type
interface ModalContextType {
  modalOpen: boolean;
  modalType: ModalType | null;  // Allow null here
  editingItem: any;
  openModal: (type: ModalType, item?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used inside ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const openModal = (type: ModalType, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setEditingItem(null);
  };

  return (
    <ModalContext.Provider
      value={{
        modalOpen,
        modalType,
        editingItem,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};