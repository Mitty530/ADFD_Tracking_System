import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  FileText,
  Target,
  TrendingUp,
  Globe,
  CreditCard,
  Timer,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { RequestDetails } from '../types/withdrawalTypes';
import { withdrawalRequestService } from '../services/withdrawalRequestService';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from './ConfirmDialog';

interface EnhancedOverviewSectionProps {
  request: RequestDetails;
  onRequestUpdated?: () => void;
}

const EnhancedOverviewSection: React.FC<EnhancedOverviewSectionProps> = ({ request, onRequestUpdated }) => {
  const { user } = useAuth();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle approve action
  const handleApprove = async () => {
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const success = withdrawalRequestService.approveRequest(
        request.id,
        user.id,
        `Request approved by ${user.name}`
      );
      
      if (success) {
        setShowApproveDialog(false);
        onRequestUpdated?.();
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
    if (!user) return;
    
    setIsProcessing(true);
    try {
      const success = withdrawalRequestService.rejectRequest(
        request.id,
        user.id,
        `Request rejected by ${user.name}`
      );
      
      if (success) {
        setShowRejectDialog(false);
        onRequestUpdated?.();
      } else {
        console.error('Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setIsProcessing(false);
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
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4" />;
      case 'high':
        return <TrendingUp className="w-4 h-4" />;
      case 'medium':
        return <Target className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-16 translate-x-16"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <FileText className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Request Overview
                </h2>
                <p className="text-sm text-gray-600 font-medium">Reference: {request.refNumber}</p>
              </div>
            </div>

            <motion.div
              className={`px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm flex items-center space-x-2 ${getPriorityColor(request.priority)}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              {getPriorityIcon(request.priority)}
              <span>{request.priority.toUpperCase()} PRIORITY</span>
            </motion.div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(request.amount, request.currency)}
              </div>
              <div className="text-sm text-gray-600">Request Amount</div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {request.processingDays}
              </div>
              <div className="text-sm text-gray-600">Processing Days</div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {request.country}
              </div>
              <div className="text-sm text-gray-600">Destination</div>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center">
                <Timer className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {Math.floor((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-gray-600">Days Active</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Beneficiary Information */}
        <motion.div
          className="bg-white rounded-3xl p-8 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <User className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Beneficiary Details</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-blue-600" style={{ display: 'block', visibility: 'visible' }} />
                <span className="text-sm font-medium text-gray-700">Full Name</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{request.beneficiaryName}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-purple-600" style={{ display: 'block', visibility: 'visible' }} />
                <span className="text-sm font-medium text-gray-700">Country</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{request.country}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" style={{ display: 'block', visibility: 'visible' }} />
                <span className="text-sm font-medium text-gray-700">Project Number</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{request.projectNumber}</span>
            </div>
          </div>
        </motion.div>

        {/* Financial Information */}
        <motion.div
          className="bg-white rounded-3xl p-8 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          whileHover={{ scale: 1.02, y: -4 }}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <CreditCard className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Financial Details</h3>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 rounded-2xl border-2 border-green-300">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 text-green-600" style={{ display: 'block', visibility: 'visible' }} />
                  <span className="text-sm font-medium text-green-700">Total Amount</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-800">
                {formatCurrency(request.amount, request.currency)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Currency: {request.currency}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-blue-600" style={{ display: 'block', visibility: 'visible' }} />
                <span className="text-sm font-medium text-gray-700">Value Date</span>
              </div>
              <span className="font-bold text-gray-900">{formatDate(request.valueDate)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" style={{ display: 'block', visibility: 'visible' }} />
                <span className="text-sm font-medium text-gray-700">Processing Time</span>
              </div>
              <span className="font-bold text-gray-900">{request.processingDays} days</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Notes */}
      {request.notes && (
        <motion.div
          className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-3xl p-8 border-2 border-amber-200 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg">
              <FileText className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Additional Notes</h3>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-sm">
            <p className="text-gray-700 leading-relaxed text-lg">{request.notes}</p>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Summary */}
      <motion.div
        className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 border-2 border-gray-200 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-3">
          <TrendingUp className="w-6 h-6 text-blue-600" style={{ display: 'block', visibility: 'visible' }} />
          <span>Request Summary</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'Comments', value: request.totalComments, icon: FileText, color: 'blue' },
            { label: 'Timeline Events', value: request.timeline.length, icon: Clock, color: 'purple' },
            { label: 'Documents', value: request.documents.length, icon: FileText, color: 'green' },
            { label: 'Days Active', value: Math.floor((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24)), icon: Timer, color: 'orange' }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${
                  stat.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  stat.color === 'green' ? 'from-green-500 to-green-600' :
                  'from-orange-500 to-orange-600'
                } text-white flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-6 h-6 text-white" style={{ display: 'block', visibility: 'visible' }} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};

export default EnhancedOverviewSection;
