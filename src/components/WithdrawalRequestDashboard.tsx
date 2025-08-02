import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye,
  Search,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  TrendingUp,
  Activity,
  FileText,
  Users,
  X,
  Plus,
  User as UserIcon
} from 'lucide-react';
import { withdrawalRequestService } from '../services/withdrawalRequestService';
import { permissionService } from '../services/permissionService';
import { notificationService } from '../services/notificationService';
import { requestStorageService } from '../services/requestStorageService';

import NotificationContainer from './NotificationContainer';
import ConfirmDialog from './ConfirmDialog';
import RequestDetailsModal from './RequestDetailsModal';
import PermissionDeniedNotification from './PermissionDeniedNotification';
import ADFDLogo from './ADFDLogo';
import ManualWithdrawalRequestForm from './ManualWithdrawalRequestForm';


import {
  WithdrawalRequest,
  User,
  ActionType,
  DashboardStats,
  LoadingState
} from '../types/withdrawalTypes';



// Remove mock users - using real authentication now









const WithdrawalRequestDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // Enhanced state management with proper types
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);


  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  const [animateStats, setAnimateStats] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false });
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {}
  });
  const [permissionDenied, setPermissionDenied] = useState({
    isOpen: false,
    userRole: '',
    attemptedAction: '',
    requiredRole: '',
    message: ''
  });

  // Helper function to get first name
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };


  // Handle keyboard shortcuts
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (confirmDialog.isOpen) setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        if (permissionDenied.isOpen) setPermissionDenied(prev => ({ ...prev, isOpen: false }));
        if (showRequestDetails) {
          setShowRequestDetails(false);
          setSelectedRequestId(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showModal, confirmDialog.isOpen, permissionDenied.isOpen, showRequestDetails]);

 // 1. First declare loadRequests
  const loadRequests = useCallback(() => {
    try {
      const allRequests = withdrawalRequestService.getAllRequests();
      setRequests(allRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
      notificationService.error('Error', 'Failed to load withdrawal requests');
    }
  }, []);



  // Load data on mount and refresh when needed
  useEffect(() => {
  loadRequests();
  setAnimateStats(true);
  setTimeout(() => setAnimateStats(false), 1000);
}, [loadRequests]);

  // Handle request details view
  const handleViewRequestDetails = useCallback((request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setShowModal(true);
  }, []);

  // Handle manual form navigation
  const handleShowManualForm = useCallback(() => {
    setShowManualForm(true);
  }, []);

  const handleBackFromManualForm = useCallback(() => {
    setShowManualForm(false);
  }, []);

  const handleManualFormSuccess = useCallback((requestId: string) => {
    setShowManualForm(false);
    loadRequests(); // Refresh the requests list
    notificationService.success(
      'Request Created Successfully!',
      `Manual withdrawal request has been created with ID: ${requestId}`
    );
  }, [loadRequests]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      console.log('🔄 User signing out...');
      await signOut();
      navigate('/', { replace: true });
      console.log('✅ Successfully signed out and redirected to landing page');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  // Enhanced action handlers with proper functionality
  const handleActionRequest = useCallback(async (action: ActionType, request?: WithdrawalRequest) => {
    // Check if user is authenticated
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }

    // Map user role to withdrawal request role format
    const mappedRole = mapUserRole(user.role);
    const mockUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: mappedRole as any,
      avatar: '👤',
      permissions: []
    };

    // Check if user has permission for this action
    const permissionCheck = permissionService.canPerformAction(mockUser, action, request);
    if (permissionCheck.canPerform) {
      await performAction(action, request);
    } else {
      // Show modern permission denied notification
      const requiredRole = getRequiredRoleForAction(action);
      setPermissionDenied({
        isOpen: true,
        userRole: user.role,
        attemptedAction: getActionDisplayName(action),
        requiredRole: requiredRole,
        message: ''
      });
    }
  }, [user]);

  const performAction = useCallback(async (action: ActionType, request?: WithdrawalRequest) => {
    if (!user) {
      console.error('❌ User not authenticated');
      return;
    }

    try {
      setLoadingState({ isLoading: true, operation: action });

      switch (action) {
        case 'approve':
          await handleApproveRequest(request!);
          break;
        case 'reject':
          await handleRejectRequest(request!);
          break;
        case 'disburse':
          await handleDisburseRequest(request!);
          break;
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      notificationService.error('Action Failed', `Failed to ${action}. Please try again.`);
    } finally {
      setLoadingState({ isLoading: false });
    }
  }, [user]);

  // Specific action handlers with confirmation dialogs
  const handleApproveRequest = useCallback(async (request: WithdrawalRequest) => {
    return new Promise<void>((resolve, reject) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Approve Withdrawal Request',
        message: `Are you sure you want to approve withdrawal request ${request.refNumber}? This will move it to Core Banking stage.`,
        variant: 'info',
        onConfirm: async () => {
          try {
            const success = withdrawalRequestService.updateRequest(request.id, {
              currentStage: 'core_banking',
              status: 'Approved - Moved to Core Banking for disbursement',
              assignedTo: 'bank001'
            });

            if (success) {
              withdrawalRequestService.logAction(request.id, 'approve', user!.id, 'Request approved by Operations Team');
              notificationService.requestApproved(request.refNumber);
              loadRequests();
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              resolve();
            } else {
              throw new Error('Failed to update request');
            }
          } catch (error) {
            console.error('Error approving request:', error);
            notificationService.error('Approval Failed', 'Failed to approve the request. Please try again.');
            reject(error);
          }
        }
      });
    });
  }, [user, loadRequests]);

  const handleRejectRequest = useCallback(async (request: WithdrawalRequest) => {
    return new Promise<void>((resolve, reject) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Reject Withdrawal Request',
        message: `Are you sure you want to reject withdrawal request ${request.refNumber}? This will return it to Initial Review stage.`,
        variant: 'danger',
        onConfirm: async () => {
          try {
            const success = withdrawalRequestService.updateRequest(request.id, {
              currentStage: 'initial_review',
              status: 'Rejected - Returned to Initial Review for corrections',
              assignedTo: 'archive001'
            });

            if (success) {
              withdrawalRequestService.logAction(request.id, 'reject', user!.id, 'Request rejected by Operations Team');
              notificationService.requestRejected(request.refNumber);
              loadRequests();
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              resolve();
            } else {
              throw new Error('Failed to update request');
            }
          } catch (error) {
            console.error('Error rejecting request:', error);
            notificationService.error('Rejection Failed', 'Failed to reject the request. Please try again.');
            reject(error);
          }
        }
      });
    });
  }, [user, loadRequests]);

  const handleDisburseRequest = useCallback(async (request: WithdrawalRequest) => {
    return new Promise<void>((resolve, reject) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Disburse Withdrawal Request',
        message: `Are you sure you want to mark withdrawal request ${request.refNumber} as disbursed? This action cannot be undone.`,
        variant: 'warning',
        onConfirm: async () => {
          try {
            const success = withdrawalRequestService.updateRequest(request.id, {
              currentStage: 'disbursed',
              status: 'Successfully disbursed',
              processingDays: Math.ceil((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            });

            if (success) {
              withdrawalRequestService.logAction(request.id, 'disburse', user!.id, 'Request disbursed by Core Banking Team');
              notificationService.requestDisbursed(request.refNumber);
              loadRequests();
              setConfirmDialog(prev => ({ ...prev, isOpen: false }));
              resolve();
            } else {
              throw new Error('Failed to update request');
            }
          } catch (error) {
            console.error('Error disbursing request:', error);
            notificationService.error('Disbursement Failed', 'Failed to disburse the request. Please try again.');
            reject(error);
          }
        }
      });
    });
  }, [user, loadRequests]);





  // Enhanced search and filtering
  const filteredRequests = React.useMemo(() => {
    let filtered = requests;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = withdrawalRequestService.searchRequests(searchTerm);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.currentStage === filterStatus);
    }

    // Apply country filter
    if (filterCountry !== 'all') {
      filtered = filtered.filter(req => req.country === filterCountry);
    }

    return filtered;
  }, [requests, searchTerm, filterStatus, filterCountry]);

  // Calculate dashboard statistics
  const stats: DashboardStats = React.useMemo(() => {
    const allRequests = requests;
    const pendingRequests = allRequests.filter(req => req.currentStage !== 'disbursed');

    // Calculate average processing time
    const disbursedRequests = allRequests.filter(req => req.currentStage === 'disbursed');
    const avgProcessingTime = disbursedRequests.length > 0
      ? Math.round(disbursedRequests.reduce((sum, req) => sum + req.processingDays, 0) / disbursedRequests.length)
      : 0;

    // Calculate due soon (requests with value date within 3 days)
    const dueSoon = allRequests.filter(req => {
      const valueDate = new Date(req.valueDate);
      const today = new Date();
      const diffDays = Math.ceil((valueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && req.currentStage !== 'disbursed';
    }).length;

    return {
      totalRequests: allRequests.length,
      pendingRequests: pendingRequests.length,
      avgProcessingTime,
      dueSoon,
      byStage: {
        initial_review: allRequests.filter(r => r.currentStage === 'initial_review').length,
        technical_review: allRequests.filter(r => r.currentStage === 'technical_review').length,
        core_banking: allRequests.filter(r => r.currentStage === 'core_banking').length,
        disbursed: allRequests.filter(r => r.currentStage === 'disbursed').length
      },
      byPriority: {
        low: allRequests.filter(r => r.priority === 'low').length,
        medium: allRequests.filter(r => r.priority === 'medium').length,
        high: allRequests.filter(r => r.priority === 'high').length,
        urgent: allRequests.filter(r => r.priority === 'urgent').length
      }
    };
  }, [requests]);

  useEffect(() => {
    if (showModal || confirmDialog.isOpen || permissionDenied.isOpen || showRequestDetails) {
      // Scroll to top when modal opens
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [showModal, confirmDialog.isOpen, permissionDenied.isOpen, showRequestDetails]);

  // Map ADFD user roles to withdrawal request roles
  const mapUserRole = (adfdRole: string) => {
    switch (adfdRole) {
      case 'archive_team':
        return 'archive_team';
      case 'operations_team':
      case 'regional_operations':
      case 'head_of_operations':
        return 'operations_team';
      case 'core_banking':
        return 'core_banking_team';
      case 'core_banking_team':
        return 'core_banking_team';
      case 'admin':
        return 'admin'; // Admin users have all permissions
      case 'loan_admin':
      case 'loan_administrator':
        return 'loan_admin';
      case 'observer':
        return 'observer'; // Observer gets view-only access
      default:
        console.warn('⚠️ Unknown role:', adfdRole, 'defaulting to loan_admin');
        return 'loan_admin'; // Default to view-only
    }
  };

  // Get required role for specific actions
  const getRequiredRoleForAction = (action: ActionType): string => {
    switch (action) {
      case 'approve':
      case 'reject':
        return 'Operations Team';
      case 'disburse':
        return 'Core Banking Team';
      default:
        return 'Administrator';
    }
  };

  // Get user-friendly action names
  const getActionDisplayName = (action: ActionType): string => {
    switch (action) {
      case 'approve':
        return 'approve requests';
      case 'reject':
        return 'reject requests';
      case 'disburse':
        return 'disburse requests';
      default:
        return action.replace('_', ' ');
    }
  };







  const getStatusIcon = (stage: string) => {
    switch (stage) {
      case 'disbursed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'core_banking':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'technical_review':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'initial_review':
        return <Pause className="w-5 h-5 text-orange-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const getActionButtonsForRequest = (request: WithdrawalRequest) => {
    const buttons = [];

    if (request.currentStage === 'technical_review') {
      buttons.push(
        <motion.button
          key="approve"
          onClick={() => handleActionRequest('approve', request)}
          className="text-gray-900e p-3 rounded-2xl shadow-lg"
          style={{ backgroundColor: '#4A8B2C' }}
          title="Approve (Operations Team Only)"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <CheckCircle className="w-5 h-5" />
        </motion.button>
      );

      buttons.push(
        <motion.button
          key="reject"
          onClick={() => handleActionRequest('reject', request)}
          className="text-gray-900 p-3 rounded-2xl shadow-lg"
          style={{ backgroundColor: '#DC3545' }}
          title="Reject (Operations Team Only)"
          whileHover={{ scale: 1.1, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <XCircle className="w-5 h-5" />
        </motion.button>
      );
    }

    if (request.currentStage === 'core_banking') {
      buttons.push(
        <motion.button
          key="disburse"
          onClick={() => handleActionRequest('disburse', request)}
          className="text-gray-900 p-3 rounded-2xl shadow-lg"
          style={{ backgroundColor: '#007CBA' }}
          title="Mark as Disbursed (Core Banking Team Only)"
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <DollarSign className="w-5 h-5" />
        </motion.button>
      );
    }

    return buttons;
  };

  // Use the enhanced memoized versions

  // Show manual form if requested
  if (showManualForm) {
    return (
      <ManualWithdrawalRequestForm
        onBack={handleBackFromManualForm}
        onSuccess={handleManualFormSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white relative" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Main Content Container */}
      <div className={`relative transition-all duration-300 ${(showModal || confirmDialog.isOpen || permissionDenied.isOpen || showRequestDetails) ? 'pointer-events-none opacity-30 blur-sm' : 'opacity-100'}`}>
        {/* ADFD Brand Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white to-gray-50/30"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(0, 124, 186, 0.08), rgba(0, 77, 113, 0.05))' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: 'linear-gradient(135deg, rgba(74, 139, 44, 0.08), rgba(0, 124, 186, 0.05))' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500" style={{ background: 'linear-gradient(135deg, rgba(0, 124, 186, 0.06), rgba(74, 139, 44, 0.04))' }}></div>
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-2xl animate-pulse delay-700" style={{ background: 'linear-gradient(135deg, rgba(0, 77, 113, 0.06), rgba(0, 124, 186, 0.04))' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-2xl animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, rgba(0, 124, 186, 0.05), rgba(74, 139, 44, 0.03))' }}></div>
      </div>

      {/* ADFD Premium Header */}
      <header className="relative z-10 bg-gradient-to-r from-blue-50 to-blue-100 shadow-xl border-b-2" style={{ borderColor: '#007CBA' }}>
        {/* Header Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-full opacity-5">
            <div className="w-full h-full bg-gradient-to-l from-blue-200 to-transparent"></div>
          </div>
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200 opacity-10 animate-pulse"></div>
          <div className="absolute top-5 right-20 w-16 h-16 rounded-full bg-green-200 opacity-10 animate-pulse delay-300"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo and Title Section */}
            <div className="flex items-center space-x-5">
              <motion.div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg, #007CBA, #004D71)' }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              >
                <ADFDLogo size={28} className="text-gray-900" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur opacity-25 animate-pulse"></div>
              </motion.div>
              <div className="space-y-1">
                <motion.h1
                  className="text-3xl font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #007CBA, #004D71)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  ADFD Request Tracker
                </motion.h1>
                <motion.p
                  className="text-sm font-medium flex items-center space-x-2"
                  style={{ color: '#5B6670' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span>Real-time tracking dashboard</span>
                  <span>•</span>
                  <span>Public viewing</span>
                  <span>•</span>
                  <span>Strict role-based actions</span>
                </motion.p>
              </div>
            </div>

            {/* Right Section - Actions and Profile */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Create Request Button - Only for Archive Team */}
              {user && (user.role === 'archive_team' || user.role === 'admin') && (
                <motion.button
                  onClick={handleShowManualForm}
                  className="relative group flex items-center space-x-3 px-6 py-3 text-gray-900 font-semibold rounded-2xl shadow-xl overflow-hidden min-w-fit whitespace-nowrap"
                  style={{ backgroundColor: '#4A8B2C' }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>

                  {/* Button Content */}
                  <div className="relative flex items-center space-x-2 z-10">
                    <motion.div
                      className="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Plus className="w-3 h-3" />
                    </motion.div>
                    <span className="text-sm font-semibold tracking-wide text-white">Create New Request</span>
                  </div>

                  {/* Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </motion.button>
              )}

              {/* Enhanced Profile Section with Dropdown */}
              {user && (
                <motion.div
                  className="relative"
                  data-profile-dropdown
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {/* Profile Button */}
                  <motion.button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-3 bg-white rounded-2xl px-4 py-3 shadow-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -1 }}
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    {/* Enhanced User Avatar */}
                    <div className="relative">
                      <motion.div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-900 font-bold text-sm shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #007CBA, #004D71)' }}
                        whileHover={{ rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </motion.div>
                      {/* Online Status Indicator */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm">
                        <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                    </div>

                    {/* User Info - Show only first name */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-gray-900 truncate">
                          {getFirstName(user.name)}
                        </h3>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 capitalize truncate">
                        {user.role.replace('_', ' ')}
                      </p>
                    </div>

                    {/* Profile Icon */}
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  </motion.button>



                  {/* Subtle Glow Effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-200 to-blue-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Border Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 to-blue-500"></div>
      </header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ADFD Live Process Tracking */}
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-xl mb-8"
          style={{ border: '1px solid #DEE1E3' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <motion.h2
            className="text-xl font-bold mb-4 flex items-center"
            style={{ color: '#323E48' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Activity className="w-6 h-6 mr-2" style={{ color: '#007CBA' }} />
            Live Process Tracking
          </motion.h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { stage: 'initial_review', name: 'Initial Review', count: requests.filter(r => r.currentStage === 'initial_review').length, color: '#5B6670' },
              { stage: 'technical_review', name: 'Technical Review', count: requests.filter(r => r.currentStage === 'technical_review').length, color: '#007CBA' },
              { stage: 'core_banking', name: 'Core Banking', count: requests.filter(r => r.currentStage === 'core_banking').length, color: '#004D71' },
              { stage: 'disbursed', name: 'Disbursed', count: requests.filter(r => r.currentStage === 'disbursed').length, color: '#4A8B2C' }
            ].map((stage, index) => (
              <motion.div
                key={stage.stage}
                className="text-center"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-3 shadow-lg text-white"
                  style={{ backgroundColor: stage.color }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    className="text-2xl font-bold text-gray-900"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    {stage.count}
                  </motion.span>
                </motion.div>
                <h3 className="font-semibold" style={{ color: '#323E48' }}>{stage.name}</h3>
                <p className="text-sm" style={{ color: '#5B6670' }}>Active requests</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Dashboard Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { icon: DollarSign, label: 'Total Requests', value: stats.totalRequests, color: '#007CBA', desc: 'All time' },
            { icon: Clock, label: 'Pending Review', value: stats.pendingRequests, color: '#5B6670', desc: 'Awaiting action' },
            { icon: TrendingUp, label: 'Avg Processing', value: `${stats.avgProcessingTime} days`, color: '#4A8B2C', desc: 'Current efficiency' },
            { icon: AlertCircle, label: 'Due Soon', value: stats.dueSoon, color: '#004D71', desc: 'Urgent attention' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl"
              style={{ border: '1px solid #DEE1E3' }}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: '#5B6670' }}>{stat.label}</p>
                  <motion.p
                    className="text-3xl font-bold mb-1"
                    style={{ color: '#323E48' }}
                    animate={{ scale: animateStats ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-xs" style={{ color: '#91A3B0' }}>{stat.desc}</p>
                </div>
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: stat.color }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <stat.icon className="w-6 h-6 text-gray-900" />
                </motion.div>
              </div>
              <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#F1F3F4' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: stat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.2 * index, duration: 1, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ADFD Search and Filters */}
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-xl mb-8"
          style={{ border: '1px solid #DEE1E3' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Search Field */}
            <div className="flex-1 min-w-[320px]">
              <div className="relative flex items-center h-12 bg-white rounded-xl border-2 border-gray-100 focus-within:border-blue-300 transition-all duration-300">
                <Search className="w-5 h-5 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search by reference, beneficiary, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 h-full px-3 text-gray-700 bg-transparent border-none outline-none focus:ring-0"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-2 mr-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-blue-300 outline-none transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="initial_review">Initial Review</option>
                <option value="technical_review">Technical Review</option>
                <option value="core_banking">Core Banking</option>
                <option value="disbursed">Disbursed</option>
              </select>

              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-blue-300 outline-none transition-all duration-300"
              >
                <option value="all">All Countries</option>
                {Array.from(new Set(requests.map(r => r.country))).map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* ADFD Requests Table */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ border: '1px solid #DEE1E3' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.005, y: -2 }}
        >
          <div className="px-6 py-4 border-b" style={{ backgroundColor: '#F9F9F9', borderColor: '#DEE1E3' }}>
            <motion.h3
              className="font-bold flex items-center"
              style={{ color: '#323E48' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Users className="w-5 h-5 mr-2" style={{ color: '#007CBA' }} />
              All Withdrawal Requests - ADFD Tracking Dashboard
            </motion.h3>
            <p className="text-sm mt-1" style={{ color: '#5B6670' }}>
              🔒 Strict role controls: Archive (create) • Operations (approve/reject) • Core Banking (disburse) • Loan Admin (view only)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Value Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Processing Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50">
                {filteredRequests.map((request, index) => (
                  <motion.tr
                    key={request.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    whileHover={{ scale: 1.01, x: 5 }}
                  >
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(request.valueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900">#{request.projectNumber}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${getPriorityColor(request.priority)}`}>
                            {request.priority}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">{request.country}</div>
                        <div className="text-sm font-medium text-blue-600">{request.refNumber}</div>
                        <div className="text-sm text-gray-500">{request.beneficiaryName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">
                        {request.amount.toLocaleString()} {request.currency}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(request.currentStage)}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {request.currentStage.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 max-w-xs">
                        {request.status.length > 60 ? `${request.status.substring(0, 60)}...` : request.status}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{request.processingDays} days</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => handleViewRequestDetails(request)}
                          className="text-gray-900 p-3 rounded-2xl shadow-lg group-hover:shadow-xl"
                          style={{ backgroundColor: '#007CBA' }}
                          title="View Details"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>

                        {/* {getActionButtonsForRequest(request).map((button, btnIndex) => (
                          <motion.div
                            key={btnIndex}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * btnIndex, duration: 0.3 }}
                          >
                            {button}
                          </motion.div>
                        ))} */}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
      </div>



      

      {/* Notification Container */}
      <NotificationContainer />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        variant={confirmDialog.variant}
      />

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showModal}
        request={selectedRequest}
        onClose={() => {
          setShowModal(false);
          setSelectedRequest(null);
        }}
      />

      {/* Permission Denied Notification */}
      <PermissionDeniedNotification
        isOpen={permissionDenied.isOpen}
        onClose={() => setPermissionDenied(prev => ({ ...prev, isOpen: false }))}
        userRole={permissionDenied.userRole}
        attemptedAction={permissionDenied.attemptedAction}
        requiredRole={permissionDenied.requiredRole}
        message={permissionDenied.message}
      />
    </div>
  );
};

export default WithdrawalRequestDashboard;