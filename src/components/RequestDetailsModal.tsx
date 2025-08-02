import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  DollarSign,
  MapPin,
  User,
  Clock,
  MessageCircle,
  FileText,
  Activity,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { WithdrawalRequest, RequestDetails, RequestDetailsModalState } from '../types/withdrawalTypes';
import { withdrawalRequestService } from '../services/withdrawalRequestService';
import { commentService } from '../services/commentService';
import { timelineService } from '../services/timelineService';
import CommentSystem from './CommentSystem';
import TimelineComponent from './TimelineComponent';
import RequestTrackingDashboard from './RequestTrackingDashboard';
import HorizontalTimelineComponent from './HorizontalTimelineComponent';
import EnhancedOverviewSection from './EnhancedOverviewSection';
import EnhancedCommentSystem from './EnhancedCommentSystem';
import EnhancedDocumentsSection from './EnhancedDocumentsSection';
import ConfirmDialog from './ConfirmDialog';

interface RequestDetailsModalProps {
  isOpen: boolean;
  request: WithdrawalRequest | null;
  onClose: () => void;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  request,
  onClose
}) => {
  const { user } = useAuth();
  const [modalState, setModalState] = useState<RequestDetailsModalState>({
    isOpen: false,
    requestId: null,
    activeTab: 'overview',
    isLoading: false
  });
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load request details when modal opens
  useEffect(() => {
    if (isOpen && request) {
      setModalState(prev => ({ ...prev, isLoading: true }));
      loadRequestDetails(request.id);
    }
  }, [isOpen, request]);

  const loadRequestDetails = async (id: string) => {
    try {
      const request = withdrawalRequestService.getRequestById(id);
      if (!request) {
        console.error('Request not found:', id);
        return;
      }

      const comments = commentService.getCommentsByRequestId(id);
      const timeline = timelineService.getTimelineByRequestId(id);
      const timelineStats = timelineService.getTimelineStats(id);

      const details: RequestDetails = {
        ...request,
        comments,
        timeline,
        documents: [], // TODO: Implement document service
        totalComments: comments.length,
        lastActivity: timelineStats.lastActivity || request.updatedAt
      };

      setRequestDetails(details);
    } catch (error) {
      console.error('Error loading request details:', error);
    } finally {
      setModalState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleClose = () => {
    setRequestDetails(null);
    setModalState({
      isOpen: false,
      requestId: null,
      activeTab: 'overview',
      isLoading: false
    });
    onClose();
  };

    useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTabChange = (tab: RequestDetailsModalState['activeTab']) => {
    setModalState(prev => ({ ...prev, activeTab: tab }));
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disbursed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Pause className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'disbursed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle approve action
  const handleApprove = async () => {
    if (!user || !requestDetails) return;
    
    setIsProcessing(true);
    try {
      const success = withdrawalRequestService.approveRequest(
        requestDetails.id,
        user.id,
        `Request approved by ${user.name}`
      );
      
      if (success) {
        setShowApproveDialog(false);
        loadRequestDetails(requestDetails.id);
      } else {
        console.error('Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!user || !requestDetails) return;
    
    setIsProcessing(true);
    try {
      const success = withdrawalRequestService.rejectRequest(
        requestDetails.id,
        user.id,
        `Request rejected by ${user.name}`
      );
      
      if (success) {
        setShowRejectDialog(false);
        loadRequestDetails(requestDetails.id);
      } else {
        console.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !requestDetails) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && requestDetails &&  (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-start justify-center p-4 pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
          style={{ overflow: 'hidden' }}
        >
        <motion.div
          className="bg-white rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
          style={{
            border: '1px solid #DEE1E3',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)'
          }}
          initial={{ opacity: 0, y: 60, scale: 0.9, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, y: 60, scale: 0.9, rotateX: 15 }}
          transition={{
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.1
          }}
        >
          {/* Header */}
          <motion.div
            className="px-6 py-5 border-b flex items-center justify-between relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderColor: '#e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-blue-500"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-green-500"></div>
            </div>

            <div className="flex items-center space-x-6 relative z-10">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="p-2 rounded-xl bg-white shadow-sm border border-gray-200">
                  {getStatusIcon(requestDetails.status)}
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Request Details
                  </h2>
                  <p className="text-sm text-gray-600 font-medium">{requestDetails.refNumber}</p>
                </div>
              </motion.div>

              <motion.div
                className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(requestDetails.status)}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                {requestDetails.status}
              </motion.div>
            </div>
           <motion.button
              onClick={handleClose}
              className="relative p-3 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg backdrop-blur-xl border border-white/30"
              title="Close Modal"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'linear-gradient(145deg, #f87171, #ef4444)',
                boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                zIndex: 9999,
                position: 'relative'
              }}
            >
              <X className="w-5 h-5 text-white" style={{ display: 'block', visibility: 'visible' }} />
              
              {/* Enhanced close button with better visibility */}
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500 opacity-0"
                whileHover={{ opacity: 0.2 }}
                transition={{ duration: 0.2 }}
              />
            </motion.button>


          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            className="px-6 py-4 border-b relative"
            style={{
              background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
              borderColor: '#e2e8f0'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <div className="flex space-x-2 relative overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Eye, color: 'blue' },
                { id: 'timeline', label: 'Timeline', icon: Activity, color: 'purple' },
                { id: 'comments', label: `Comments (${requestDetails.totalComments})`, icon: MessageCircle, color: 'green' },
                { id: 'documents', label: 'Documents', icon: FileText, color: 'orange' }
              ].map((tab, index) => {
                const IconComponent = tab.icon;
                const isActive = modalState.activeTab === tab.id;

                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`relative flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-gray-900 shadow-lg border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                    }`}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    style={{ zIndex: 10, position: 'relative' }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r opacity-10 ${
                          tab.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          tab.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          tab.color === 'green' ? 'from-green-500 to-green-600' :
                          'from-orange-500 to-orange-600'
                        }`}
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}

                    {/* Enhanced Icon with better visibility */}
                    <motion.div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center relative z-10 ${
                        isActive
                          ? tab.color === 'blue' ? 'bg-blue-100' :
                            tab.color === 'purple' ? 'bg-purple-100' :
                            tab.color === 'green' ? 'bg-green-100' :
                            'bg-orange-100'
                          : 'bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className={`w-4 h-4 ${
                        isActive
                          ? tab.color === 'blue' ? 'text-blue-600' :
                            tab.color === 'purple' ? 'text-purple-600' :
                            tab.color === 'green' ? 'text-green-600' :
                            'text-orange-600'
                          : 'text-gray-500'
                      }`} />
                    </motion.div>
                    
                    {/* Enhanced Text with better visibility */}
                    <span className={`relative z-10 text-sm font-semibold ${
                      isActive ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {tab.label}
                    </span>

                    {/* Hover glow effect */}
                    <motion.div
                      className={`absolute inset-0 rounded-xl opacity-0 ${
                        tab.color === 'blue' ? 'bg-blue-500' :
                        tab.color === 'purple' ? 'bg-purple-500' :
                        tab.color === 'green' ? 'bg-green-500' :
                        'bg-orange-500'
                      }`}
                      whileHover={{ opacity: 0.05 }}
                      transition={{ duration: 0.2 }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Content Area with scrollbar */}
          <div className="flex-1 relative bg-gradient-to-br from-blue-50/30 via-indigo-50/30 to-purple-50/30">
            <div
              className="h-full overflow-y-auto modal-scrollbar"
              style={{ maxHeight: 'calc(95vh - 280px)', paddingBottom: '100px' }}
            >
              {modalState.isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <motion.div
                    className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="text-sm text-gray-600 font-medium">Loading request details...</p>
                </div>
              ) : (
                <div className="p-6 md:p-8">
                  {modalState.activeTab === 'overview' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <EnhancedOverviewSection
                          request={requestDetails}
                          onRequestUpdated={() => loadRequestDetails(requestDetails.id)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {modalState.activeTab === 'timeline' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <HorizontalTimelineComponent
                          request={requestDetails}
                          timeline={requestDetails.timeline}
                        />
                      </div>
                    </motion.div>
                  )}

                  {modalState.activeTab === 'comments' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <EnhancedCommentSystem
                          requestId={requestDetails.id}
                          comments={requestDetails.comments}
                          onCommentAdded={() => loadRequestDetails(requestDetails.id)}
                        />
                      </div>
                    </motion.div>
                  )}

                  {modalState.activeTab === 'documents' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                        <EnhancedDocumentsSection
                          requestId={requestDetails.id}
                          documents={requestDetails.documents}
                          onDocumentUploaded={() => loadRequestDetails(requestDetails.id)}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Fixed Action Buttons at Bottom Right */}
            <motion.div
              className="absolute bottom-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                >
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg">{isProcessing ? 'Processing...' : 'Request Validation'}</span>
                </motion.button>

                <motion.button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                >
                  <XCircle className="w-6 h-6" />
                  <span className="text-lg">{isProcessing ? 'Processing...' : 'Cancel'}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Request Validation Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showApproveDialog}
            title="Request Validation"
            message={`Are you sure you want to validate this withdrawal request for ${formatCurrency(requestDetails.amount, requestDetails.currency)}? This will approve the request and move it to the next stage.`}
            confirmText="Validate"
            cancelText="Cancel"
            variant="info"
            onConfirm={handleApprove}
            onCancel={() => setShowApproveDialog(false)}
          />

          {/* Cancel Request Confirmation Dialog */}
          <ConfirmDialog
            isOpen={showRejectDialog}
            title="Cancel Request"
            message={`Are you sure you want to cancel this withdrawal request for ${formatCurrency(requestDetails.amount, requestDetails.currency)}? This will reject the request and return it for review.`}
            confirmText="Cancel Request"
            cancelText="Keep Request"
            variant="warning"
            onConfirm={handleReject}
            onCancel={() => setShowRejectDialog(false)}
          />
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );
};

export default RequestDetailsModal;
