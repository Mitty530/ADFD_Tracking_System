import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User as UserIcon,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Edit3,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'create' | 'approve' | 'reject' | 'disburse' | 'view' | 'edit';
  requestId?: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Enhanced user data based on profile.txt structure
  const userData = {
    // Basic Info
    fullName: user?.name || 'Ahmed Al-Mahmoud',
    email: user?.email || 'ahmed.mahmoud@adfd.ae',
    role: user?.role || 'loan_admin',
    department: 'Operations Department',
    position: 'Senior Loan Administrator',

    // Contact
    phone: '+971 2 123 4567',
    mobile: '+971 50 123 4567',
    address: 'Al Buteen P.O. Box: 814, Abu Dhabi, UAE',

    // Work Details
    supervisor: 'Dr. Sarah Al-Zahra',
    officeLocation: 'Abu Dhabi Main Office',

    // Settings
    language: 'English',
    timezone: 'Asia/Dubai',
    currency: 'AED',



    // Profile
    lastLogin: '2024-11-20 09:15:00',

    // Enhanced stats
    totalRequests: 156,
    approvalRate: 94.2,
    avgProcessingTime: 2.3,
    performanceScore: 98
  };

  // Mock activity data with enhanced details - in real app, this would come from API
  useEffect(() => {
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        action: 'Approved withdrawal request',
        description: 'ARC/2024/156 - Madagascar Infrastructure Project',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'approve',
        requestId: 'ARC/2024/156'
      },
      {
        id: '2',
        action: 'Updated project information',
        description: 'Project 4313 - Phase 2 details updated',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        type: 'edit',
        requestId: 'Project 4313'
      },
      {
        id: '3',
        action: 'Generated monthly report',
        description: 'October 2024 disbursement report',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'view'
      },
      {
        id: '4',
        action: 'Profile updated',
        description: 'Contact information modified',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000),
        type: 'edit'
      }
    ];
    setActivityLogs(mockActivities);
  }, []);





  const getActivityIcon = (type: ActivityLog['type']) => {
    const iconConfig = {
      create: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
      approve: { icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
      reject: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100' },
      disburse: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100' },
      view: { icon: Activity, color: 'text-gray-500', bg: 'bg-gray-100' },
      edit: { icon: Edit3, color: 'text-orange-500', bg: 'bg-orange-100' }
    };

    const config = iconConfig[type] || iconConfig.view;
    const IconComponent = config.icon;

    return (
      <motion.div
        className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center shadow-sm`}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <IconComponent className={`w-5 h-5 ${config.color}`} />
      </motion.div>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-900 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >

        {/* Header */}
        <motion.div
          className="flex items-center space-x-4 mb-8"
          variants={itemVariants}
        >
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center space-x-3 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.02, x: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
            <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">Back to Dashboard</span>
          </motion.button>

          <div>
            <motion.h1
              className="text-4xl font-bold text-white drop-shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              User Profile
            </motion.h1>
            <motion.p
              className="text-blue-200 text-lg font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Manage your account and preferences
            </motion.p>
          </div>
        </motion.div>

        {/* Enhanced Profile Header - Matching Design */}
        <motion.div
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden mb-8 max-w-5xl mx-auto"
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
              {/* Left Section - Avatar and User Info */}
              <div className="flex items-start gap-6">
                {/* Profile Avatar */}
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-blue-400/30 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </motion.div>

                {/* User Information */}
                <div className="text-white">
                  <motion.h2
                    className="text-3xl lg:text-4xl font-bold text-white mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {userData.fullName}
                  </motion.h2>

                  <motion.div
                    className="flex flex-wrap items-center gap-3 mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-400/30 backdrop-blur-sm border border-white/20">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <span className="text-white font-semibold">Loan Administrator</span>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                      <span className="text-white font-semibold">{userData.department}</span>
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-blue-100 font-semibold text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {userData.position}
                  </motion.p>
                </div>
              </div>

              {/* Right Section - Edit Button */}
              <motion.button
                className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit</span>
              </motion.button>
            </div>

            {/* Statistics Section */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: '📊', value: userData.totalRequests, label: 'Total Requests' },
                { icon: '📈', value: `${userData.approvalRate}%`, label: 'Approval Rate' },
                { icon: '⏱️', value: `${userData.avgProcessingTime} days`, label: 'Avg Processing' },
                { icon: '⭐', value: `${userData.performanceScore}%`, label: 'Performance' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-300 mb-6 p-3">
            <motion.div className="flex flex-wrap gap-2 justify-center" layout>
              {[
                { id: 'profile', label: '👤 Profile', icon: UserIcon },
                { id: 'notifications', label: '🔔 Notifications', icon: Bell },
                { id: 'activity', label: '📊 Activity', icon: Activity }
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-xl font-bold transition-all duration-300 relative flex-1 min-w-fit ${
                    activeTab === tab.id
                      ? 'text-white shadow-xl'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-blue-100 border-2 border-transparent hover:border-blue-300'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-sm lg:text-base">{tab.label}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 max-w-6xl mx-auto"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Enhanced Personal Information Card */}
                  <motion.div
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border-2 border-blue-300 p-6 group hover:shadow-2xl hover:border-blue-400"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <motion.div
                      className="flex items-center gap-3 mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="text-2xl">👤</div>
                      <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
                    </motion.div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {[
                        { label: '👤 Full Name', value: userData.fullName, field: 'fullName', type: 'text' },
                        { label: '📧 Email Address', value: userData.email, field: 'email', type: 'email' }
                      ].map((input, index) => (
                        <motion.div
                          key={input.field}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <label className="block text-sm font-bold text-slate-800 mb-3">{input.label}</label>
                          <motion.input
                            type={input.type}
                            value={input.value}
                            readOnly
                            className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl bg-white text-slate-700 font-medium cursor-default"
                          />
                        </motion.div>
                      ))}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <label className="block text-sm font-bold text-slate-800 mb-3">📍 Address</label>
                        <motion.textarea
                          value={userData.address}
                          readOnly
                          rows={3}
                          className="w-full px-4 py-4 border-2 border-blue-300 rounded-xl bg-white text-slate-700 font-medium resize-none cursor-default"
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Work Information Card */}
                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-xl border-2 border-green-300 p-6 group hover:shadow-2xl hover:border-green-400"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <motion.div
                      className="flex items-center gap-3 mb-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="text-2xl">🏢</div>
                      <h3 className="text-xl font-bold text-slate-800">Work Information</h3>
                    </motion.div>

                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {[
                        { label: '💼 Position', value: userData.position, field: 'position', type: 'text' },
                        { label: '📍 Office Location', value: userData.officeLocation, field: 'officeLocation', type: 'text' }
                      ].map((input, index) => (
                        <motion.div
                          key={input.field}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <label className="block text-sm font-bold text-slate-800 mb-3">{input.label}</label>
                          <motion.input
                            type={input.type}
                            value={input.value}
                            readOnly
                            className="w-full px-4 py-4 border-2 border-green-300 rounded-xl bg-white text-slate-700 font-medium cursor-default"
                          />
                        </motion.div>
                      ))}


                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}



            {/* Enhanced Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 max-w-4xl mx-auto"
              >

              </motion.div>
            )}

            {/* Enhanced Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6 max-w-4xl mx-auto"
              >
                <motion.div
                  className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl shadow-xl border-2 border-cyan-300 p-6 hover:shadow-2xl hover:border-cyan-400"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="text-2xl">📊</div>
                    <h3 className="text-xl font-bold text-slate-800">Recent Activity</h3>
                  </div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                  >
                    {activityLogs.map((log, index) => (
                      <motion.div
                        key={log.id}
                        className="flex items-start gap-4 p-5 bg-cyan-50 rounded-xl hover:bg-cyan-100 transition-all duration-300 group cursor-pointer border border-cyan-200 hover:border-cyan-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        {getActivityIcon(log.type)}
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 group-hover:text-cyan-700 transition-colors mb-1">{log.action}</p>
                          <p className="text-sm text-slate-700 font-medium mb-2">{log.description}</p>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-cyan-600" />
                              <span className="text-xs text-slate-600 font-semibold">{formatTimeAgo(log.timestamp)}</span>
                            </div>
                            {log.requestId && (
                              <span className="text-xs bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-3 py-1 rounded-full font-bold shadow-sm">
                                {log.requestId}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-cyan-500"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All Activity
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;
