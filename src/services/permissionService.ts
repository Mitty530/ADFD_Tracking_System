import { User, UserRole, ActionType, WithdrawalRequest, PermissionCheck, ROLE_PERMISSIONS, STAGE_TRANSITIONS } from '../types/withdrawalTypes';

class PermissionService {
  // Check if user has permission for a specific action
  hasPermission(user: User | null, action: ActionType): boolean {
    if (!user) return action === 'view'; // Only viewing is allowed without login

    // Check if user role exists in ROLE_PERMISSIONS
    if (!user.role || !ROLE_PERMISSIONS[user.role]) {
      console.error('❌ Invalid user role:', user.role, 'Available roles:', Object.keys(ROLE_PERMISSIONS));
      return false;
    }

    return ROLE_PERMISSIONS[user.role].includes(action);
  }

  // Check if user can perform action on a specific request
  canPerformAction(user: User | null, action: ActionType, request?: WithdrawalRequest): PermissionCheck {
    // Check basic permission first
    if (!this.hasPermission(user, action)) {
      return {
        canPerform: false,
        reason: `Your role (${user?.role || 'guest'}) does not have permission to ${action}.`
      };
    }

    // If no request specified, just check basic permission
    if (!request) {
      return { canPerform: true };
    }

    // Additional checks based on action and request state
    switch (action) {

      case 'approve':
        if (request.currentStage !== 'technical_review') {
          return {
            canPerform: false,
            reason: 'Requests can only be approved when in Technical Review stage.'
          };
        }
        if (user?.role !== 'operations_team') {
          return {
            canPerform: false,
            reason: 'Only Operations Team can approve requests.'
          };
        }
        return { canPerform: true };

      case 'reject':
        if (request.currentStage !== 'technical_review') {
          return {
            canPerform: false,
            reason: 'Requests can only be rejected when in Technical Review stage.'
          };
        }
        if (user?.role !== 'operations_team') {
          return {
            canPerform: false,
            reason: 'Only Operations Team can reject requests.'
          };
        }
        return { canPerform: true };

      case 'disburse':
        if (request.currentStage !== 'core_banking') {
          return {
            canPerform: false,
            reason: 'Requests can only be disbursed when in Core Banking stage.'
          };
        }
        if (user?.role !== 'core_banking_team') {
          return {
            canPerform: false,
            reason: 'Only Core Banking Team can disburse requests.'
          };
        }
        return { canPerform: true };

      case 'view':
        // Everyone can view requests
        return { canPerform: true };

      default:
        return {
          canPerform: false,
          reason: 'Unknown action type.'
        };
    }
  }

  // Get available actions for a user on a specific request
  getAvailableActions(user: User | null, request: WithdrawalRequest): ActionType[] {
    const actions: ActionType[] = ['view']; // Everyone can view

    if (!user) return actions;

    // Check each possible action
    const possibleActions: ActionType[] = ['approve', 'reject', 'disburse'];
    
    possibleActions.forEach(action => {
      const check = this.canPerformAction(user, action, request);
      if (check.canPerform) {
        actions.push(action);
      }
    });

    // Archive team permissions (no create_request action anymore)

    return actions;
  }

  // Check if user can access the dashboard
  canAccessDashboard(user: User | null): PermissionCheck {
    // Dashboard is publicly viewable, but actions require login
    return { canPerform: true };
  }

  // Get user role display name
  getRoleDisplayName(role: UserRole): string {
    const roleNames: Record<UserRole, string> = {
      archive_team: 'Archive Team',
      operations_team: 'Operations Team',
      core_banking_team: 'Core Banking Team',
      loan_admin: 'Loan Administrator',
      admin: 'Administrator',
      observer: 'Observer'
    };

    return roleNames[role] || role;
  }

  // Get action display name
  getActionDisplayName(action: ActionType): string {
    const actionNames: Record<ActionType, string> = {
      approve: 'Approve Request',
      reject: 'Reject Request',
      disburse: 'Disburse Request',
      view: 'View Request'
    };
    
    return actionNames[action] || action;
  }

  // Check if stage transition is valid
  canTransitionToStage(currentStage: string, targetStage: string): boolean {
    const transitions = STAGE_TRANSITIONS[currentStage as keyof typeof STAGE_TRANSITIONS];
    return transitions ? transitions.includes(targetStage as any) : false;
  }

  // Get required role for an action
  getRequiredRole(action: ActionType): UserRole | null {
    for (const [role, permissions] of Object.entries(ROLE_PERMISSIONS)) {
      if (permissions.includes(action)) {
        return role as UserRole;
      }
    }
    return null;
  }

  // Validate user session
  validateUserSession(user: User | null): PermissionCheck {
    if (!user) {
      return {
        canPerform: false,
        reason: 'No active user session. Please log in.'
      };
    }

    // Check if user object has required properties
    if (!user.id || !user.role || !user.name) {
      return {
        canPerform: false,
        reason: 'Invalid user session. Please log in again.'
      };
    }

    // Check if role is valid
    if (!Object.keys(ROLE_PERMISSIONS).includes(user.role)) {
      return {
        canPerform: false,
        reason: 'Invalid user role. Please contact administrator.'
      };
    }

    return { canPerform: true };
  }

  // Get permission summary for user
  getPermissionSummary(user: User | null): {
    role: string;
    permissions: string[];
    restrictions: string[];
  } {
    if (!user) {
      return {
        role: 'Guest',
        permissions: ['View requests'],
        restrictions: ['Cannot perform any actions without login']
      };
    }

    const permissions = ROLE_PERMISSIONS[user.role].map(action => 
      this.getActionDisplayName(action)
    );

    const restrictions: string[] = [];
    
    switch (user.role) {
      case 'archive_team':
        restrictions.push('Cannot approve, reject, or disburse requests');
        break;
      case 'operations_team':
        restrictions.push('Cannot create or disburse requests');
        restrictions.push('Can only act on requests in Technical Review stage');
        break;
      case 'core_banking_team':
        restrictions.push('Cannot create, approve, or reject requests');
        restrictions.push('Can only disburse requests in Core Banking stage');
        break;
      case 'loan_admin':
        restrictions.push('Read-only access - cannot perform any actions');
        break;
      case 'admin':
        restrictions.push('Full access - no restrictions');
        break;
      case 'observer':
        restrictions.push('Read-only access - cannot perform any actions');
        break;
    }

    return {
      role: this.getRoleDisplayName(user.role),
      permissions,
      restrictions
    };
  }

  // Check if user owns or is assigned to a request
  isRequestAssignedToUser(user: User | null, request: WithdrawalRequest): boolean {
    if (!user) return false;
    return request.assignedTo === user.id || request.assignedTo === user.role;
  }

  // Get next possible stages for a request
  getNextStages(currentStage: string): string[] {
    return STAGE_TRANSITIONS[currentStage as keyof typeof STAGE_TRANSITIONS] || [];
  }
}

export const permissionService = new PermissionService();
