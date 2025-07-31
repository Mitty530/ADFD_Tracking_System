import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuditTrailService } from '../../lib/auditTrail';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle, sidebarOpen }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState([
    {
      id: 1,
      title: 'New Request Assigned',
      message: 'Request #WR-2024-001 has been assigned to you',
      time: '5 minutes ago',
      unread: true,
      type: 'assignment'
    },
    {
      id: 2,
      title: 'Deadline Approaching',
      message: 'Request #WR-2024-002 deadline is in 2 hours',
      time: '1 hour ago',
      unread: true,
      type: 'deadline'
    },
    {
      id: 3,
      title: 'Status Update',
      message: 'Request #WR-2024-003 has been approved',
      time: '3 hours ago',
      unread: false,
      type: 'status'
    }
  ]);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      AuditTrailService.logUserActivity('logout', 'User initiated logout from header menu');
      
      // Clear Remember Me data on explicit logout
      localStorage.removeItem('adfd-remember-me');
      localStorage.removeItem('adfd-saved-email');
      
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
      AuditTrailService.logError('logout_error', 'Failed to sign out from header', error instanceof Error ? error.stack : undefined);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      AuditTrailService.logUserActivity('view', `Search performed: "${searchQuery}"`, {
        search_query: searchQuery,
        search_location: 'header'
      });
      // TODO: Implement search functionality
      console.log('Search:', searchQuery);
    }
  };

  const handleNotificationClick = (notificationId: number) => {
    AuditTrailService.logUserActivity('view', `Notification clicked: ${notificationId}`);
    // TODO: Mark notification as read and navigate to relevant page
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrator',
      'archive_team': 'Archive Team',
      'loan_administrator': 'Loan Administrator',
      'head_of_operations': 'Head of Operations',
      'operations_team': 'Operations Team',
      'core_banking': 'Core Banking',
      'observer': 'Observer'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800 border-red-200',
      'archive_team': 'bg-blue-100 text-blue-800 border-blue-200',
      'loan_administrator': 'bg-purple-100 text-purple-800 border-purple-200',
      'head_of_operations': 'bg-green-100 text-green-800 border-green-200',
      'operations_team': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'core_banking': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'observer': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and menu toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">ADFD Tracking System</h1>
              </div>
            </div>
          </div>

          {/* Center - Search */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search requests, users, or documents..."
              />
            </form>
          </div>

          {/* Right side - Notifications and user menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  AuditTrailService.logUserActivity('view', 'Notifications panel toggled');
                }}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button className="text-sm text-blue-600 hover:text-blue-500">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  AuditTrailService.logUserActivity('view', 'User menu toggled');
                }}
                className="flex items-center space-x-3 p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                  </div>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColor(user?.role || '')}`}>
                          {getRoleDisplayName(user?.role || '')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                        AuditTrailService.logUserActivity('navigate', 'Navigated to profile page from user menu');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-3" />
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/security');
                        setShowUserMenu(false);
                        AuditTrailService.logUserActivity('navigate', 'Navigated to security page from user menu');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Shield size={16} className="mr-3" />
                      Security
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowUserMenu(false);
                        AuditTrailService.logUserActivity('navigate', 'Navigated to settings page from user menu');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
