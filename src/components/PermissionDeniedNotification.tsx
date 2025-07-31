import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, AlertTriangle, Lock, Info } from 'lucide-react';

interface PermissionDeniedNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  attemptedAction: string;
  requiredRole: string;
  message?: string;
}

const PermissionDeniedNotification: React.FC<PermissionDeniedNotificationProps> = ({
  isOpen,
  onClose,
  userRole,
  attemptedAction,
  requiredRole,
  message
}) => {
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'archive_team':
        return 'Archive Team';
      case 'operations_team':
        return 'Operations Team';
      case 'core_banking_team':
      case 'core_banking':
        return 'Core Banking Team';
      case 'loan_admin':
        return 'Loan Administrator';
      case 'admin':
        return 'Administrator';
      default:
        return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getActionDisplayName = (action: string) => {
    switch (action) {
      case 'create_request':
        return 'create new requests';
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

  const getPermissionMessage = () => {
    if (message) return message;
    
    return `Your current role (${getRoleDisplayName(userRole)}) does not have permission to ${getActionDisplayName(attemptedAction)}. Only ${getRoleDisplayName(requiredRole)} members can perform this action.`;
  };

  const getRoleSpecificAdvice = () => {
    switch (userRole) {
      case 'archive_team':
        return "As an Archive Team member, you can create new withdrawal requests but cannot approve, reject, or disburse them.";
      case 'operations_team':
        return "As an Operations Team member, you can approve or reject requests in Technical Review stage, but cannot create or disburse them.";
      case 'core_banking_team':
      case 'core_banking':
        return "As a Core Banking Team member, you can disburse approved requests but cannot create, approve, or reject them.";
      case 'loan_admin':
        return "As a Loan Administrator, you have view-only access to monitor all requests but cannot perform any actions.";
      default:
        return "Please contact your system administrator if you believe you should have access to this feature.";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Notification Modal */}
          <motion.div
            className="fixed top-4 right-4 z-50 max-w-md w-full mx-4"
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="p-2 bg-white/20 rounded-xl"
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Access Denied</h3>
                      <p className="text-red-100 text-sm">Insufficient Permissions</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Main Message */}
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium leading-relaxed">
                      {getPermissionMessage()}
                    </p>
                  </div>
                </div>

                {/* Role Information */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Your Role Permissions</span>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {getRoleSpecificAdvice()}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                  <motion.button
                    onClick={onClose}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    I Understand
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PermissionDeniedNotification;
