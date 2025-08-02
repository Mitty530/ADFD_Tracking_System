import React from 'react';
import { motion } from 'framer-motion';
import {
  Archive,
  Settings,
  CreditCard,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { WithdrawalRequest, TimelineEvent } from '../types/withdrawalTypes';

interface HorizontalTimelineComponentProps {
  request: WithdrawalRequest;
  timeline: TimelineEvent[];
}

const HorizontalTimelineComponent: React.FC<HorizontalTimelineComponentProps> = ({
  request,
  timeline
}) => {
  // Define the 4-stage workflow with proper mapping
  const workflowStages = [
    {
      id: 'initial_review',
      name: 'Archive Team',
      shortName: 'Archive',
      description: 'Document verification and initial review',
      icon: Archive,
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-700',
      estimatedDays: 1
    },
    {
      id: 'technical_review',
      name: 'Operations Team',
      shortName: 'Operations',
      description: 'Technical assessment and approval',
      icon: Settings,
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      borderColor: 'border-purple-300',
      textColor: 'text-purple-700',
      estimatedDays: 3
    },
    {
      id: 'core_banking',
      name: 'Core Banking',
      shortName: 'Banking',
      description: 'Financial processing and disbursement',
      icon: CreditCard,
      color: 'orange',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      borderColor: 'border-orange-300',
      textColor: 'text-orange-700',
      estimatedDays: 2
    },
    {
      id: 'disbursed',
      name: 'Loan Admin',
      shortName: 'Complete',
      description: 'Funds disbursed successfully',
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-700',
      estimatedDays: 0
    }
  ];

  // Get current stage index
  const currentStageIndex = workflowStages.findIndex(stage => stage.id === request.currentStage);
  const isCompleted = request.currentStage === 'disbursed';

  // Calculate progress percentage
  const progressPercentage = isCompleted ? 100 : ((currentStageIndex + 1) / workflowStages.length) * 100;

  const getStageStatus = (stageIndex: number) => {
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'current';
    return 'pending';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get stage events from timeline
  const getStageEvents = (stageId: string) => {
    return timeline.filter(event => 
      event.metadata?.stage === stageId || 
      (stageId === 'initial_review' && event.eventType === 'created') ||
      (stageId === 'disbursed' && event.eventType === 'disbursed')
    );
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center space-x-5">
          <motion.div
            className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-green-600 text-white shadow-2xl"
            whileHover={{ scale: 1.08, rotate: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ArrowRight className="w-8 h-8" />
          </motion.div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 bg-clip-text text-transparent">
              Request Progress
            </h3>
            <p className="text-sm text-gray-600 font-medium">Track your request through the 4-stage workflow • Real-time updates</p>
          </div>
        </div>

        <motion.div
          className="text-right bg-gradient-to-br from-white via-blue-50 to-green-50 rounded-3xl p-6 border-2 border-blue-200 shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.05, y: -2 }}
        >
          <motion.div
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {Math.round(progressPercentage)}%
          </motion.div>
          <div className="text-sm text-gray-600 font-bold">Complete</div>
        </motion.div>
      </motion.div>

      {/* Enhanced Main Progress Bar */}
      <motion.div
        className="relative bg-white rounded-3xl p-10 border-2 border-blue-200 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.01, y: -4 }}
      >
        {/* Enhanced background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-purple-50/70 to-green-50/70"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-16 -translate-x-16"></div>
        
        {/* Enhanced Progress Track */}
        <div className="relative">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-250 to-gray-300 rounded-full overflow-hidden shadow-inner border border-gray-300">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full relative shadow-lg"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ delay: 0.6, duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Enhanced animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
              />
              
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-green-400/30 rounded-full blur-sm"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </div>

          {/* Stage Indicators */}
          <div className="flex justify-between items-center mt-8">
            {workflowStages.map((stage, index) => {
              const status = getStageStatus(index);
              const IconComponent = stage.icon;
              const stageEvents = getStageEvents(stage.id);
              const latestEvent = stageEvents[stageEvents.length - 1];

              return (
                <motion.div
                  key={stage.id}
                  className="flex flex-col items-center space-y-3 relative"
                  style={{ width: '22%' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
                >
                  {/* Stage Icon */}
                  <motion.div
                    className={`relative flex items-center justify-center w-20 h-20 rounded-3xl border-4 shadow-2xl transition-all duration-500 ${
                      status === 'completed'
                        ? 'bg-gradient-to-br from-green-500 to-green-600 text-white border-green-400'
                        : status === 'current'
                        ? `bg-gradient-to-br ${stage.bgColor.replace('bg-', 'from-')} to-${stage.color}-600 text-white border-${stage.color}-400`
                        : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 border-gray-300'
                    }`}
                    whileHover={{ scale: 1.15, rotate: 8, y: -4 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="relative z-10">
                      <IconComponent className="w-9 h-9" />
                    </div>

                    {/* Enhanced status indicators */}
                    {status === 'completed' && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, duration: 0.5, type: "spring", bounce: 0.6 }}
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {status === 'current' && (
                      <motion.div
                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                        animate={{ scale: [1, 1.3, 1], rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Clock className="w-4 h-4 text-white" />
                      </motion.div>
                    )}

                    {/* Enhanced glow effects */}
                    {status === 'current' && (
                      <>
                        <motion.div
                          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stage.bgColor.replace('bg-', 'from-')} to-${stage.color}-600 opacity-40`}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-3xl border-2 border-white/50"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </>
                    )}

                    {/* Sparkle effect for completed stages */}
                    {status === 'completed' && (
                      <motion.div
                        className="absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 rounded-full"
                        animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
                      />
                    )}
                  </motion.div>

                  {/* Stage Info */}
                  <div className="text-center space-y-1">
                    <h4 className={`font-bold text-sm ${
                      status === 'completed' ? 'text-green-700' :
                      status === 'current' ? stage.textColor :
                      'text-gray-500'
                    }`}>
                      {stage.shortName}
                    </h4>
                    <p className="text-xs text-gray-600 leading-tight max-w-20">
                      {stage.description}
                    </p>
                    
                    {/* Timestamp */}
                    {latestEvent && (
                      <motion.div
                        className="text-xs text-gray-500 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        {formatDate(latestEvent.createdAt)}
                      </motion.div>
                    )}

                    {/* Status badge */}
                    <motion.div
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'completed' ? 'bg-green-100 text-green-700' :
                        status === 'current' ? `${stage.lightBg} ${stage.textColor}` :
                        'bg-gray-100 text-gray-500'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                    >
                      {status === 'completed' && <CheckCircle className="w-3 h-3" />}
                      {status === 'current' && <Clock className="w-3 h-3" />}
                      {status === 'pending' && <AlertCircle className="w-3 h-3" />}
                      <span>
                        {status === 'completed' ? 'Done' :
                         status === 'current' ? 'Active' :
                         'Pending'}
                      </span>
                    </motion.div>
                  </div>

                  {/* Connection line */}
                  {index < workflowStages.length - 1 && (
                    <div className="absolute top-8 left-full w-full h-0.5 bg-gray-300 -z-10">
                      <motion.div
                        className={`h-full ${
                          index < currentStageIndex ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: index < currentStageIndex ? '100%' : '0%' }}
                        transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Timeline Events Summary */}
      {timeline.length > 0 && (
        <motion.div
          className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-200 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          {/* Background decorations */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-indigo-400/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10">
            <motion.h4
              className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <motion.div
                className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Calendar className="w-6 h-6" />
              </motion.div>
              <span>Recent Activity</span>
            </motion.h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timeline.slice(0, 3).map((event, index) => (
                <motion.div
                  key={event.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.05, y: -8, rotateY: 5 }}
                >
                  <div className="flex items-start space-x-4">
                    <motion.div
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 mb-2 leading-tight">{event.title}</p>
                      <p className="text-xs text-gray-600 font-medium mb-1">{event.userName}</p>
                      <p className="text-xs text-gray-500 font-medium">{formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/10 to-purple-400/10 opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HorizontalTimelineComponent;
