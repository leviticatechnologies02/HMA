// features/modals/formRegistry.tsx
import { lazy, ComponentType } from "react";
import { ModalType } from "@/context/ModalContext";
// Define the props that each form component will receive
export interface FormComponentProps {
  editingItem?: any;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

// Type for the form registry
type FormRegistry = {
  [K in ModalType]?: React.LazyExoticComponent<ComponentType<FormComponentProps>>;
};

// Update this to include all your modal types
export const formRegistry: FormRegistry = {
    tenant:lazy(() => import("../../pages/admin/forms/TenantForm")),
    notice:lazy(() => import("../../pages/admin/forms/NoticeForm")),
    supervisorNotice:lazy(() => import("../../pages/supervisor/forms/SupervisorNoticeForm")),
    complaint:lazy(() => import("../../pages/student/forms/ComplaintForm")),
    messmenu:lazy(() => import("../../pages/admin/forms/MessmenuForm")),
    subscription:lazy(() => import("../../pages/superAdmin/forms/SubscriptionForm")),
    plan:lazy(() => import("../../pages/superAdmin/forms/PlanForm")),
    tenantdetails:lazy(()=> import("../../pages/admin/modals/TenantDetailsModal")),
    supervisor:lazy(() => import("../../pages/admin/forms/SupervisiorForm")),
    admin:lazy(() => import("../../pages/superAdmin/forms/AdminForm")),
    
  
};