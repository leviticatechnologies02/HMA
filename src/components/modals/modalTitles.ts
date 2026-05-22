// features/modals/modalTitles.ts
import { ModalType } from "@/context/ModalContext";

interface ModalTitleConfig {
  create?: string;
  edit?: string;
  view?: string;
  delete?: string;
}

export const modalTitles: Record<ModalType, ModalTitleConfig> = {
  hostel: {
    create: "Add New Hostel",
    edit: "Edit Hostel",
  },
  location: {
    create: "Add Location",
    edit: "Edit Location",
  },
  room: {
    create: "Add Room Type",
    edit: "Edit Room Type",
  },
  bed: {
    create: "Add Bed",
    edit: "Edit Bed",
  },
  booking: {
    create: "Create Booking",
    edit: "Edit Booking",
  },
  visitorBooking: {
    create: "Book Hostel",
    edit: "Update Booking",
  },
  tenant: {
    create: "Add Tenant",
    edit: "Edit Tenant",
  },
  supervisor: {
    create: "Add Supervisor",
    edit: "Edit Supervisor",
  },
  payment: {
    create: "Record Payment",
    edit: "Edit Payment",
  },
  complaint: {
    create: "Log Complaint",
    edit: "Edit Complaint",
  },
  messmenu: {
    create: "Add Menu Item",
    edit: "Edit Menu Item",
  },
  notice:{
    create: "Create Notice",
    edit: "Edit Notice",
  },
  supervisorNotice: {
    create: "Create Notice",
    edit: "Edit Notice",
  },
  transfer: {
    edit: "Transfer Tenant to New Room",
  },
  announcement: {
    create: "Create Announcement",
    edit: "Edit Announcement",
  },
  attendance: {
    create: "Record Attendance",
    edit: "Edit Attendance",
  },
  maintenance: {
    create: "Log Maintenance",
    edit: "Edit Maintenance",
  },
  admin: {
    create: "Add Hostel Admin",
    edit: "Edit Hostel Admin",
  },
  subscription: {
    create: "Add Subscription",
    edit: "Edit Subscription",
  },
  plan: {
    create: "Add Plan",
    edit: "Edit Plan",
  },
  tenantdetails:{
    view: "Student Details",
  },
 

  
  // Confirmation modal
  confirmation: {
    create: "Confirm Action",  // Added missing property
    delete: "Confirm Deletion",
  },
};

// Helper function to get modal title
export const getModalTitle = (modalType: ModalType, editingItem: any): string => {
  if (!modalType) return "";
  
  const config = modalTitles[modalType];
  if (!config) return "";
  
  if (editingItem) {
    return config.edit || config.view || config.delete || "Edit Item";
  }
  
  return config.create || config.view || config.delete || "Create Item";
};