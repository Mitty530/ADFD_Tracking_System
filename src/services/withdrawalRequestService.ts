import { WithdrawalRequest, User, ActionType } from '../types/withdrawalTypes';

// Local storage keys
const STORAGE_KEYS = {
  REQUESTS: 'adfd_withdrawal_requests',
  CURRENT_USER: 'adfd_current_user',
  ACTION_HISTORY: 'adfd_action_history'
};

// Action history interface
interface ActionHistory {
  id: string;
  requestId: string;
  action: ActionType;
  userId: string;
  timestamp: Date;
  details?: string;
}

class WithdrawalRequestService {
  // Initialize with mock data if no data exists
  private initializeData(): void {
    if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
      const mockRequests: WithdrawalRequest[] = [
        {
          id: '1',
          projectNumber: '#1001',
          refNumber: 'REF/001',
          beneficiaryName: 'Company Alpha',
          country: 'UAE',
          amount: 1200000,
          currency: 'USD',
          valueDate: '2025-05-12',
          currentStage: 'disbursed',
          status: 'Disbursed',
          priority: 'high',
          assignedTo: 'core_banking_user',
          processingDays: 5,
          createdAt: new Date('2025-05-07'),
          updatedAt: new Date('2025-05-12')
        },
        {
          id: '2',
          projectNumber: '#1002',
          refNumber: 'REF/002',
          beneficiaryName: 'Company Beta',
          country: 'Egypt',
          amount: 850000,
          currency: 'EUR',
          valueDate: '2025-05-07',
          currentStage: 'technical_review',
          status: 'Pending due to expired withdrawal date; extension request submitted',
          priority: 'urgent',
          assignedTo: 'operations_user',
          processingDays: 15,
          createdAt: new Date('2025-04-22'),
          updatedAt: new Date('2025-05-07')
        },
        {
          id: '3',
          projectNumber: '#1003',
          refNumber: 'REF/003',
          beneficiaryName: 'Company Gamma',
          country: 'Jordan',
          amount: 550000,
          currency: 'USD',
          valueDate: '2025-05-13',
          currentStage: 'technical_review',
          status: 'Pending with Operations for technical approval',
          priority: 'medium',
          assignedTo: 'operations_user',
          processingDays: 8,
          createdAt: new Date('2025-05-05'),
          updatedAt: new Date('2025-05-13')
        },
        {
          id: '4',
          projectNumber: '#1004',
          refNumber: 'REF/004',
          beneficiaryName: 'Company Delta',
          country: 'Morocco',
          amount: 980000,
          currency: 'USD',
          valueDate: '2025-05-15',
          currentStage: 'core_banking',
          status: 'Awaiting authorized signature verification from beneficiary',
          priority: 'high',
          assignedTo: 'core_banking_user',
          processingDays: 6,
          createdAt: new Date('2025-05-09'),
          updatedAt: new Date('2025-05-15')
        },
        {
          id: '5',
          projectNumber: '#1005',
          refNumber: 'REF/005',
          beneficiaryName: 'Company Epsilon',
          country: 'Tunisia',
          amount: 1500000,
          currency: 'EUR',
          valueDate: '2025-05-13',
          currentStage: 'core_banking',
          status: 'Pending with Core Banking; under disbursement review',
          priority: 'medium',
          assignedTo: 'core_banking_user',
          processingDays: 7,
          createdAt: new Date('2025-05-06'),
          updatedAt: new Date('2025-05-13')
        }
      ];
      
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockRequests));
    }
  }

  // Get all withdrawal requests
  getAllRequests(): WithdrawalRequest[] {
    this.initializeData();
    const requests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return requests ? JSON.parse(requests) : [];
  }

  // Get request by ID
  getRequestById(id: string): WithdrawalRequest | null {
    const requests = this.getAllRequests();
    return requests.find(req => req.id === id) || null;
  }

  // Update request
  updateRequest(id: string, updates: Partial<WithdrawalRequest>): boolean {
    try {
      const requests = this.getAllRequests();
      const index = requests.findIndex(req => req.id === id);
      
      if (index === -1) return false;
      
      requests[index] = {
        ...requests[index],
        ...updates,
        updatedAt: new Date()
      };
      
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
      return true;
    } catch (error) {
      console.error('Error updating request:', error);
      return false;
    }
  }

  // Create new request
  createRequest(requestData: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'>): string | null {
    try {
      const requests = this.getAllRequests();
      const newId = (Math.max(...requests.map(r => parseInt(r.id))) + 1).toString();
      
      const newRequest: WithdrawalRequest = {
        ...requestData,
        id: newId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      requests.push(newRequest);
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
      return newId;
    } catch (error) {
      console.error('Error creating request:', error);
      return null;
    }
  }

  // Log action history
  logAction(requestId: string, action: ActionType, userId: string, details?: string): void {
    try {
      const history = this.getActionHistory();
      const newAction: ActionHistory = {
        id: Date.now().toString(),
        requestId,
        action,
        userId,
        timestamp: new Date(),
        details
      };
      
      history.push(newAction);
      localStorage.setItem(STORAGE_KEYS.ACTION_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }

  // Get action history
  getActionHistory(requestId?: string): ActionHistory[] {
    try {
      const history = localStorage.getItem(STORAGE_KEYS.ACTION_HISTORY);
      const allHistory: ActionHistory[] = history ? JSON.parse(history) : [];
      
      return requestId 
        ? allHistory.filter(action => action.requestId === requestId)
        : allHistory;
    } catch (error) {
      console.error('Error getting action history:', error);
      return [];
    }
  }

  // Current user management
  setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  clearCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Search and filter requests
  searchRequests(query: string): WithdrawalRequest[] {
    const requests = this.getAllRequests();
    const lowercaseQuery = query.toLowerCase();
    
    return requests.filter(request => 
      request.refNumber.toLowerCase().includes(lowercaseQuery) ||
      request.beneficiaryName.toLowerCase().includes(lowercaseQuery) ||
      request.projectNumber.toLowerCase().includes(lowercaseQuery) ||
      request.country.toLowerCase().includes(lowercaseQuery)
    );
  }

  filterRequests(filters: {
    status?: string;
    country?: string;
    priority?: string;
    stage?: string;
  }): WithdrawalRequest[] {
    let requests = this.getAllRequests();
    
    if (filters.status && filters.status !== 'all') {
      requests = requests.filter(req => req.currentStage === filters.status);
    }
    
    if (filters.country && filters.country !== 'all') {
      requests = requests.filter(req => req.country === filters.country);
    }
    
    if (filters.priority && filters.priority !== 'all') {
      requests = requests.filter(req => req.priority === filters.priority);
    }
    
    if (filters.stage && filters.stage !== 'all') {
      requests = requests.filter(req => req.currentStage === filters.stage);
    }
    
    return requests;
  }

  // Validation methods
  validateRequestData(data: Partial<WithdrawalRequest>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (data.amount && (data.amount <= 0 || data.amount > 10000000)) {
      errors.push('Amount must be between 1 and 10,000,000');
    }
    
    if (data.beneficiaryName && data.beneficiaryName.trim().length < 2) {
      errors.push('Beneficiary name must be at least 2 characters');
    }
    
    if (data.valueDate) {
      const valueDate = new Date(data.valueDate);
      const today = new Date();
      if (valueDate < today) {
        errors.push('Value date cannot be in the past');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Approve request
  approveRequest(requestId: string, userId: string, notes?: string): boolean {
    try {
      const success = this.updateRequest(requestId, {
        status: 'Approved',
        currentStage: 'approved'
      });
      
      if (success) {
        this.logAction(requestId, 'approve', userId, notes || 'Request approved');
      }
      
      return success;
    } catch (error) {
      console.error('Error approving request:', error);
      return false;
    }
  }

  // Reject request
  rejectRequest(requestId: string, userId: string, reason?: string): boolean {
    try {
      const success = this.updateRequest(requestId, {
        status: 'Rejected',
        currentStage: 'rejected'
      });
      
      if (success) {
        this.logAction(requestId, 'reject', userId, reason || 'Request rejected');
      }
      
      return success;
    } catch (error) {
      console.error('Error rejecting request:', error);
      return false;
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const withdrawalRequestService = new WithdrawalRequestService();
export type { ActionHistory };
