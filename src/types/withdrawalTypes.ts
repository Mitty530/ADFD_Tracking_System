// User roles in the ADFD system
export type UserRole = 'archive_team' | 'operations_team' | 'core_banking_team' | 'loan_admin' | 'admin' | 'observer';

// Action types for withdrawal requests
export type ActionType = 'approve' | 'reject' | 'disburse' | 'view';

// Request stages
export type RequestStage = 'initial_review' | 'technical_review' | 'core_banking' | 'disbursed' | 'approved' | 'rejected';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Currency types
export type Currency = 'USD' | 'EUR' | 'AED';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  permissions?: ActionType[];
  region?: string;
  regional_countries?: string[];
  can_create_requests?: boolean;
  can_approve_reject?: boolean;
  can_disburse?: boolean;
  view_only_access?: boolean;
  is_active?: boolean;
  avatar_url?: string;
}

// Withdrawal request interface
export interface WithdrawalRequest {
  id: string;
  projectNumber: string;
  refNumber: string;
  beneficiaryName: string;
  country: string;
  amount: number;
  currency: Currency;
  valueDate: string;
  currentStage: RequestStage;
  status: string;
  priority: Priority;
  assignedTo: string;
  processingDays: number;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  attachments?: string[];
}

// Enhanced form data for creating new requests
export interface CreateRequestFormData {
  // Header Information
  withdrawalRequestNo: string;
  requestDate: string;

  // Project Information
  projectNumber: string;
  projectDescription: string;
  additionalProjectDetails?: string;

  // Agreement Details
  agreementReference: string;
  agreementDate: string;
  agreementParty: string;

  // Financial Information
  paymentAmount: number;
  currency: Currency;
  valueDate: string;

  // Beneficiary Information
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryBankName: string;
  beneficiaryBankAddress: string;
  beneficiaryBankAccount: string;
  beneficiaryBankIBAN: string;
  beneficiaryBankSwiftCode: string;

  // Correspondence Bank Information
  correspondenceBankName?: string;
  correspondenceBankSwiftCode?: string;
  correspondenceBankAddress?: string;

  // Authorization
  authorizedRepresentative1: string;
  authorizedRepresentative2?: string;

  // Additional Information
  additionalNotes?: string;

  // System fields
  country: string;
  priority: Priority;
  notes?: string;
}



// Filter options
export interface FilterOptions {
  status: string;
  country: string;
  priority: string;
  stage: string;
}

// Search and filter state
export interface SearchFilterState {
  searchTerm: string;
  filters: FilterOptions;
}

// Action result interface
export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

// Permission validation interface
export interface PermissionCheck {
  canPerform: boolean;
  reason?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  avgProcessingTime: number;
  dueSoon: number;
  byStage: {
    initial_review: number;
    technical_review: number;
    core_banking: number;
    disbursed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

// Notification interface
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  operation?: string;
  progress?: number;
}

// Modal state interface
export interface ModalState {
  isOpen: boolean;
  type?: 'login' | 'details' | 'create' | 'confirm';
  data?: any;
}

// Form validation result
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// API response interface (for future backend integration)
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

// Event handler types
export type ButtonClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
export type InputChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;

// Component props interfaces
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: ButtonClickHandler;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, ActionType[]> = {
  archive_team: ['view'],
  operations_team: ['approve', 'reject', 'view'],
  core_banking_team: ['disburse', 'view'],
  loan_admin: ['view'],
  admin: ['approve', 'reject', 'disburse', 'view'], // Admin has all permissions
  observer: ['view'] // Observer has view-only access
};

// Stage transition rules
export const STAGE_TRANSITIONS: Record<RequestStage, RequestStage[]> = {
  initial_review: ['technical_review', 'approved', 'rejected'],
  technical_review: ['core_banking', 'initial_review', 'approved', 'rejected'], // Can go back or forward
  core_banking: ['disbursed', 'approved', 'rejected'],
  disbursed: [], // Final stage
  approved: ['disbursed'], // Approved requests can be disbursed
  rejected: [] // Final stage
};

// Countries supported by ADFD
export const ADFD_COUNTRIES = [
  'UAE', 'Egypt', 'Jordan', 'Morocco', 'Tunisia', 'Lebanon', 'Palestine', 
  'Yemen', 'Sudan', 'Algeria', 'Iraq', 'Syria', 'Libya', 'Mauritania'
];

// Comment interface for request discussions
export interface RequestComment {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  mentionedUsers?: string[]; // Array of user IDs mentioned in the comment
  isInternal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Timeline event interface for request history
export interface TimelineEvent {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  eventType: 'status_change' | 'comment_added' | 'document_uploaded' | 'assignment_changed' | 'created' | 'approved' | 'rejected' | 'disbursed';
  title: string;
  description: string;
  previousValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Document attachment interface
export interface RequestDocument {
  id: string;
  requestId: string;
  uploadedBy: string;
  uploaderName: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  documentType: 'agreement' | 'invoice' | 'receipt' | 'bank_statement' | 'other';
  storagePath: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
}

// User mention interface for tagging functionality
export interface UserMention {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
}

// Enhanced request details interface
export interface RequestDetails extends WithdrawalRequest {
  comments: RequestComment[];
  timeline: TimelineEvent[];
  documents: RequestDocument[];
  totalComments: number;
  lastActivity: Date;
}

// Comment form data
export interface CommentFormData {
  commentText: string;
  mentionedUsers: string[];
  isInternal: boolean;
}

// Request details modal state
export interface RequestDetailsModalState {
  isOpen: boolean;
  requestId: string | null;
  activeTab: 'overview' | 'timeline' | 'documents' | 'comments';
  isLoading: boolean;
}

// Default form values for enhanced form
export const DEFAULT_FORM_VALUES: CreateRequestFormData = {
  // Header Information
  withdrawalRequestNo: '',
  requestDate: '',

  // Project Information
  projectNumber: '',
  projectDescription: '',
  additionalProjectDetails: '',

  // Agreement Details
  agreementReference: '',
  agreementDate: '',
  agreementParty: '',

  // Financial Information
  paymentAmount: 0,
  currency: 'USD',
  valueDate: '',

  // Beneficiary Information
  beneficiaryName: '',
  beneficiaryAddress: '',
  beneficiaryBankName: '',
  beneficiaryBankAddress: '',
  beneficiaryBankAccount: '',
  beneficiaryBankIBAN: '',
  beneficiaryBankSwiftCode: '',

  // Correspondence Bank Information
  correspondenceBankName: '',
  correspondenceBankSwiftCode: '',
  correspondenceBankAddress: '',

  // Authorization
  authorizedRepresentative1: '',
  authorizedRepresentative2: '',

  // Additional Information
  additionalNotes: '',

  // System fields
  country: 'UAE',
  priority: 'medium',
  notes: ''
};
