import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  FileText,
  UserCheck,
  Plus,
  ArrowRight,
  DollarSign,
  User,
  BarChart3
} from 'lucide-react';
import { TimelineEvent } from '../types/withdrawalTypes';

interface TimelineComponentProps {
  requestId: string;
  timeline: TimelineEvent[];
}

const TimelineComponent: React.FC<TimelineComponentProps> = ({
  requestId,
  timeline
}) => {
  const getEventIcon = (eventType: TimelineEvent['eventType']) => {
    switch (eventType) {
      case 'created':
        return <Plus className="w-5 h-5 text-blue-600" />;
      case 'status_change':
        return <ArrowRight className="w-5 h-5 text-orange-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'disbursed':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'comment_added':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'document_uploaded':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'assignment_changed':
        return <UserCheck className="w-5 h-5 text-indigo-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: TimelineEvent['eventType']) => {
    switch (eventType) {
      case 'created':
        return 'border-blue-200 bg-blue-50';
      case 'status_change':
        return 'border-orange-200 bg-orange-50';
      case 'approved':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      case 'disbursed':
        return 'border-green-200 bg-green-50';
      case 'comment_added':
        return 'border-blue-200 bg-blue-50';
      case 'document_uploaded':
        return 'border-purple-200 bg-purple-50';
      case 'assignment_changed':
        return 'border-indigo-200 bg-indigo-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date: Date | string) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - eventDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (timeline.length === 0) {
    return (
      <motion.div
        className="text-center py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-3xl border-2 border-gray-200 shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative inline-block"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Clock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">No Timeline Events Yet</h3>
        <p className="text-gray-500 font-medium max-w-md mx-auto leading-relaxed">
          Timeline events will appear here as the request progresses through the workflow stages.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            className="p-4 rounded-3xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 text-white shadow-xl"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <Clock className="w-7 h-7" />
          </motion.div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-blue-800 bg-clip-text text-transparent">
              Request Timeline
            </h3>
            <p className="text-sm text-gray-600 font-medium">{timeline.length} events recorded • Live tracking</p>
          </div>
        </div>

        <motion.div
          className="flex items-center space-x-3 px-5 py-3 bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 rounded-2xl border-2 border-purple-200 shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-sm font-bold text-purple-700">Live Updates</span>
        </motion.div>
      </motion.div>

      <div className="relative">
        {/* Enhanced Timeline Line */}
        <div className="absolute left-10 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-200 via-blue-200 to-green-200 rounded-full shadow-lg"></div>

        {/* Animated progress line */}
        <motion.div
          className="absolute left-10 top-0 w-2 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 rounded-full shadow-lg"
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ delay: 0.5, duration: 2.5, ease: "easeOut" }}
        >
          {/* Animated shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-full"
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          />
        </motion.div>

        {/* Timeline Events */}
        <div className="space-y-8">
          {timeline.map((event, index) => (
            <motion.div
              key={event.id}
              className="relative flex items-start space-x-6"
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Enhanced Event Icon */}
              <motion.div
                className={`relative z-10 flex items-center justify-center w-20 h-20 rounded-3xl border-4 shadow-2xl ${getEventColor(event.eventType)}`}
                whileHover={{ scale: 1.15, rotate: 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="relative z-10">
                  {getEventIcon(event.eventType)}
                </div>

                {/* Enhanced glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-white/10 to-transparent"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Pulse effect for recent events */}
                {index < 3 && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-3 border-current opacity-40"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                {/* Sparkle effect for latest event */}
                {index === 0 && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                    animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>

              {/* Enhanced Event Content */}
              <div className="flex-1 min-w-0 pb-8">
                <motion.div
                  className="relative bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 70%, #e2e8f0 100%)'
                  }}
                  whileHover={{ scale: 1.02, y: -8, rotateX: 2 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Enhanced background decorations */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/8 to-green-500/8"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-400/15 rounded-full -translate-y-16 translate-x-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-12 -translate-x-12"></div>

                  {/* Animated border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-purple-300 via-blue-300 to-green-300 opacity-0"
                    whileHover={{ opacity: 0.6 }}
                    transition={{ duration: 0.3 }}
                  />

                  <div className="relative z-10">
                  {/* Event Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                          {event.userAvatar || <User className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.userName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{formatRelativeTime(event.createdAt)}</p>
                      <p className="text-xs text-gray-400">{formatDate(event.createdAt)}</p>
                    </div>
                  </div>

                  {/* Event Description */}
                  <p className="text-gray-700 mb-3">{event.description}</p>

                  {/* Status Change Details */}
                  {event.eventType === 'status_change' && event.previousValue && event.newValue && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                        {event.previousValue}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {event.newValue}
                      </span>
                    </div>
                  )}

                  {/* Assignment Change Details */}
                  {event.eventType === 'assignment_changed' && event.previousValue && event.newValue && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-600">From:</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                        {event.previousValue}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">To:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {event.newValue}
                      </span>
                    </div>
                  )}

                  {/* Metadata Display */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Additional Details:</h5>
                      <div className="space-y-1">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-gray-900 font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline End Marker */}
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
        </div>
      </div>

      {/* Timeline Summary */}
      <motion.div
        className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200 shadow-lg"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.02, y: -2 }}
      >
        <motion.h4
          className="text-xl font-bold text-blue-900 mb-6 flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="p-2 rounded-xl bg-blue-500 text-white">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Timeline Summary</span>
        </motion.h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              type: 'status_change',
              label: 'Status Changes',
              color: 'blue',
              icon: ArrowRight,
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100'
            },
            {
              type: 'comment_added',
              label: 'Comments',
              color: 'green',
              icon: MessageCircle,
              gradient: 'from-green-500 to-green-600',
              bgGradient: 'from-green-50 to-green-100'
            },
            {
              type: 'document_uploaded',
              label: 'Documents',
              color: 'purple',
              icon: FileText,
              gradient: 'from-purple-500 to-purple-600',
              bgGradient: 'from-purple-50 to-purple-100'
            },
            {
              type: 'assignment_changed',
              label: 'Assignments',
              color: 'indigo',
              icon: UserCheck,
              gradient: 'from-indigo-500 to-indigo-600',
              bgGradient: 'from-indigo-50 to-indigo-100'
            }
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            const count = timeline.filter(e => e.eventType === stat.type).length;

            return (
              <motion.div
                key={stat.type}
                className={`relative bg-gradient-to-br ${stat.bgGradient} p-6 rounded-2xl border-2 border-white shadow-lg text-center overflow-hidden`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-8 translate-x-8"></div>

                {/* Icon */}
                <motion.div
                  className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconComponent className="w-5 h-5" />
                </motion.div>

                {/* Count */}
                <motion.div
                  className="text-2xl font-bold text-gray-900 mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.3, type: "spring" }}
                >
                  {count}
                </motion.div>

                {/* Label */}
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default TimelineComponent;
