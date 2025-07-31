import { Notification } from '../types/withdrawalTypes';

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      autoClose: notification.autoClose ?? true,
      duration: notification.duration ?? 5000
    };

    this.notifications.push(newNotification);
    this.notifyListeners();

    // Auto-remove notification if autoClose is enabled
    if (newNotification.autoClose) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  // Remove a notification
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods for different notification types
  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  }

  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      autoClose: false, // Errors should be manually dismissed
      ...options
    });
  }

  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  }

  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  }

  // Predefined notifications for common actions
  requestCreated(refNumber: string): string {
    return this.success(
      'Request Created',
      `Withdrawal request ${refNumber} has been created successfully.`
    );
  }

  requestApproved(refNumber: string): string {
    return this.success(
      'Request Approved',
      `Withdrawal request ${refNumber} has been approved and moved to Core Banking.`
    );
  }

  requestRejected(refNumber: string): string {
    return this.warning(
      'Request Rejected',
      `Withdrawal request ${refNumber} has been rejected and returned to Initial Review.`
    );
  }

  requestDisbursed(refNumber: string): string {
    return this.success(
      'Request Disbursed',
      `Withdrawal request ${refNumber} has been successfully disbursed.`
    );
  }

  loginSuccess(userName: string): string {
    return this.success(
      'Login Successful',
      `Welcome back, ${userName}! You are now logged in.`
    );
  }

  loginError(reason: string): string {
    return this.error(
      'Login Failed',
      reason
    );
  }

  permissionDenied(action: string, userRole?: string, requiredRole?: string): string {
    const title = '🚫 Access Denied';
    const message = userRole && requiredRole
      ? `Your role (${userRole.replace('_', ' ')}) cannot ${action}. Only ${requiredRole.replace('_', ' ')} members can perform this action.`
      : `You do not have permission to ${action}. Please contact your administrator.`;

    return this.error(title, message, {
      duration: 8000, // Longer duration for permission errors
      autoClose: false // Require manual dismissal
    });
  }

  validationError(errors: string[]): string {
    return this.error(
      'Validation Error',
      `Please fix the following errors: ${errors.join(', ')}`
    );
  }

  networkError(): string {
    return this.error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  unexpectedError(): string {
    return this.error(
      'Unexpected Error',
      'An unexpected error occurred. Please try again or contact support if the problem persists.'
    );
  }
}

export const notificationService = new NotificationService();
