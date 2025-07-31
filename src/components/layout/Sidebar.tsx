import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuditTrailService } from '../../lib/auditTrail';
import {
  Home,
  FileText,
  Users,
  BarChart3,
  Settings,
  Shield,
  Archive,
  CheckCircle,
  DollarSign,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  TrendingUp,
  User
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapse: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
  roles: string[];
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, onToggle, onCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Define menu items based on user roles
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      roles: ['admin', 'archive_team', 'loan_administrator', 'head_of_operations', 'operations_team', 'core_banking', 'observer']
    },
    {
      id: 'requests',
      label: 'Requests',
      icon: FileText,
      path: '/requests',
      roles: ['admin', 'archive_team', 'loan_administrator', 'head_of_operations', 'operations_team', 'core_banking', 'observer'],
      children: [
        {
          id: 'create-request',
          label: 'Create Request',
          icon: Plus,
          path: '/requests/create',
          roles: ['admin', 'archive_team']
        },
        {
          id: 'pending-approval',
          label: 'Pending Approval',
          icon: Clock,
          path: '/requests/pending',
          roles: ['admin', 'operations_team', 'head_of_operations'],
          badge: '5',
          badgeColor: 'bg-yellow-500'
        },
        {
          id: 'approved',
          label: 'Approved',
          icon: CheckCircle,
          path: '/requests/approved',
          roles: ['admin', 'operations_team', 'head_of_operations', 'core_banking']
        },
        {
          id: 'disbursement',
          label: 'Disbursement',
          icon: DollarSign,
          path: '/requests/disbursement',
          roles: ['admin', 'core_banking'],
          badge: '3',
          badgeColor: 'bg-green-500'
        },
        {
          id: 'overdue',
          label: 'Overdue',
          icon: AlertTriangle,
          path: '/requests/overdue',
          roles: ['admin', 'loan_administrator', 'head_of_operations'],
          badge: '2',
          badgeColor: 'bg-red-500'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/analytics',
      roles: ['admin', 'loan_administrator', 'head_of_operations', 'observer'],
      children: [
        {
          id: 'performance',
          label: 'Performance',
          icon: TrendingUp,
          path: '/analytics/performance',
          roles: ['admin', 'loan_administrator', 'head_of_operations', 'observer']
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: FileText,
          path: '/analytics/reports',
          roles: ['admin', 'loan_administrator', 'head_of_operations', 'observer']
        }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      path: '/users',
      roles: ['admin']
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: Eye,
      path: '/audit',
      roles: ['admin', 'loan_administrator']
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      path: '/archive',
      roles: ['admin', 'archive_team', 'loan_administrator']
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      roles: ['admin', 'archive_team', 'loan_administrator', 'head_of_operations', 'operations_team', 'core_banking', 'observer']
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      path: '/security',
      roles: ['admin']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      roles: ['admin', 'archive_team', 'loan_administrator', 'head_of_operations', 'operations_team', 'core_banking', 'observer']
    }
  ];

  // Filter menu items based on user role
  const getFilteredMenuItems = (items: MenuItem[]): MenuItem[] => {
    if (!user?.role) return [];

    return items.filter(item => {
      const hasAccess = item.roles.includes(user.role);
      if (hasAccess && item.children) {
        item.children = getFilteredMenuItems(item.children);
      }
      return hasAccess;
    });
  };

  const filteredMenuItems = getFilteredMenuItems(menuItems);

  const handleMenuClick = (item: MenuItem) => {
    AuditTrailService.logUserActivity('navigate', `Clicked menu item: ${item.label}`, {
      menu_item_id: item.id,
      menu_path: item.path,
      user_role: user?.role
    });
  };

  const isActiveRoute = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = isActiveRoute(item.path);

    return (
      <li key={item.id}>
        <NavLink
          to={item.path}
          onClick={() => handleMenuClick(item)}
          className={({ isActive: navIsActive }) => `
            group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
            ${isChild ? 'ml-6' : ''}
            ${navIsActive || isActive
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${isCollapsed && !isChild ? 'justify-center px-2' : ''}
          `}
        >
          <Icon
            size={20}
            className={`flex-shrink-0 ${
              isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
            } ${isCollapsed && !isChild ? '' : 'mr-3'}`}
          />
          
          {(!isCollapsed || isChild) && (
            <>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white rounded-full ${item.badgeColor || 'bg-gray-500'}`}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* Render children if not collapsed and item has children */}
        {!isCollapsed && item.children && item.children.length > 0 && (
          <ul className="mt-1 space-y-1">
            {item.children.map(child => renderMenuItem(child, true))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Sidebar header */}
        <div className={`flex items-center justify-between h-16 px-4 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">ADFD</h2>
                <p className="text-xs text-gray-500">Tracking System</p>
              </div>
            </div>
          )}
          
          {/* Collapse button - only show on desktop */}
          <button
            onClick={onCollapse}
            className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <ul className="space-y-1">
            {filteredMenuItems.map(item => renderMenuItem(item))}
          </ul>
        </nav>

        {/* User info at bottom */}
        {!isCollapsed && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
