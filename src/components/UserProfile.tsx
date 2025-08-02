import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User as UserIcon,
  Bell,
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NotificationPreference {
  id: 'newRequests' | 'statusUpdates' | 'systemAlerts' | 'weeklyReports';
  icon: string;
  title: string;
  description: string;
}

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Enhanced user data based on profile.txt structure
  const userData = {
    // Basic Info
    fullName: user?.name || 'Ousmane Diallo',
    email: user?.email || 'ousmane.diallo@adfd.ae',
    role: user?.role || 'loan_admin',
    department: 'Operations Department',
    position: 'Senior Loan Administrator',

    // Contact
    phone: '+971 2 234 5678',
    mobile: '+971 50 234 5678',
    address: 'Al Reem Island P.O. Box: 912, Abu Dhabi, UAE',

    // Work Details
    supervisor: 'Dr. Mohammed Al-Hassan',
    officeLocation: 'Abu Dhabi Main Office',

    // Settings
    language: 'English',
    timezone: 'Asia/Dubai',
    currency: 'AED',



    // Profile
    lastLogin: '2024-11-20 09:15:00',

    // Enhanced stats
    totalRequests: 142,
    approvalRate: 96.5,
    avgProcessingTime: 1.8,
    performanceScore: 99
  };

  // Add the missing animation variants
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
        type: "tween" as const,
        duration: 0.2
      }
    }
  };

  // Add notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    newRequests: true,
    statusUpdates: true,
    systemAlerts: false,
    weeklyReports: true
  });

  const handleToggleNotification = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleAll = () => {
    const areAllEnabled = Object.values(notificationPreferences).every(value => value);
    setNotificationPreferences({
      newRequests: !areAllEnabled,
      statusUpdates: !areAllEnabled,
      systemAlerts: !areAllEnabled,
      weeklyReports: !areAllEnabled
    });
  };

  const notificationOptions: NotificationPreference[] = [
    {
      id: 'newRequests',
      icon: '📝',
      title: 'New Withdrawal Requests',
      description: 'When new requests are submitted',
    },
    {
      id: 'statusUpdates',
      icon: '🔄',
      title: 'Status Updates',
      description: 'When request status changes',
    },
    {
      id: 'systemAlerts',
      icon: '⚠️',
      title: 'System Alerts',
      description: 'Important system notifications',
    },
    {
      id: 'weeklyReports',
      icon: '📊',
      title: 'Weekly Reports',
      description: 'Weekly summary of activities',
    }
  ];

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
        // variants={containerVariants}
        // initial="hidden"
        // animate="visible"
      >

        {/* Header */}
        <motion.div
          className="flex items-center space-x-4 mb-8"
          // variants={itemVariants}
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
              className="text-4xl font-bold text-gray-900 drop-shadow-lg"
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
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="p-8 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                {/* Profile Avatar */}
                <motion.div
                  className="relative flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-blue-400/30 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-gray-900 text-2xl font-bold shadow-xl">
                    {userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </motion.div>

                {/* User Information */}
                <div>
                  <motion.h2
                    className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {userData.fullName}
                  </motion.h2>
                  <motion.p
                    className="text-gray-900 font-semibold text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {userData.position}
                  </motion.p>
                </div>
              </div>

              {/* Edit Button - Aligned with user info */}
              <motion.button
                className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white/50 text-gray-900 font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Profile</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Tabs */}
        <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-300 mb-6 p-3">
            <motion.div className="flex flex-wrap gap-2 justify-center" layout>
              {[
                { id: 'profile', label: '👤 Profile', icon: UserIcon },
                { id: 'notifications', label: '🔔 Notifications', icon: Bell }
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 lg:px-6 py-3 rounded-xl font-bold transition-all duration-300 relative flex-1 min-w-fit ${activeTab === tab.id
                      ? 'text-gray-900 shadow-xl'
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
                <div className="grid gap-6">
                  {notificationOptions.map((pref) => (
                    <motion.div
                      key={pref.id}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-xl border-2 border-blue-300 p-6 hover:shadow-2xl hover:border-blue-400 transition-all duration-300"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                          <div className="text-2xl">{pref.icon}</div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{pref.title}</h3>
                            <p className="text-sm text-slate-600">{pref.description}</p>
                          </div>
                        </div>
                        <motion.button
                          onClick={() => handleToggleNotification(pref.id)}
                          className="relative w-16 h-8 rounded-full transition-colors duration-300"
                          style={{
                            backgroundColor: notificationPreferences[pref.id] ? '#0EA5E9' : '#E2E8F0'
                          }}
                        >
                          <motion.div
                            className="absolute w-6 h-6 bg-white rounded-full shadow-lg top-1"
                            animate={{
                              x: notificationPreferences[pref.id] ? 32 : 4
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                          <span className="sr-only">
                            {notificationPreferences[pref.id] ? 'Active' : 'Inactive'}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserProfile;