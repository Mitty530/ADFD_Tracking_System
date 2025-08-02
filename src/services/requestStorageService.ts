import { WithdrawalRequest } from '../types/withdrawalTypes';

const STORAGE_KEY = 'withdrawal_requests';

export const requestStorageService = {
  saveRequest(request: WithdrawalRequest) {
    const requests = this.getAllRequests();
    requests.push(request);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    return request;
  },

  getAllRequests(): WithdrawalRequest[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  updateRequest(id: string, updates: Partial<WithdrawalRequest>) {
    const requests = this.getAllRequests();
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      return requests[index];
    }
    return null;
  }
};
