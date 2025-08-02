// Authorized ADFD Team Members
// Only these users are allowed to access the system
// Updated: Added Ousame as admin user

export interface AuthorizedUser {
  email: string;
  name: string;
  role: string;
  department: string;
  can_create_requests: boolean;
  can_approve_reject: boolean;
  can_disburse: boolean;
  view_only_access: boolean;
}

export const AUTHORIZED_USERS: AuthorizedUser[] = [
  // Archive Team
  {
    email: 'aalzaabi@adfd.ae',
    name: 'Ahmed Al Zaabi',
    role: 'archive_team',
    department: 'Archive Team',
    can_create_requests: true,
    can_approve_reject: false,
    can_disburse: false,
    view_only_access: false
  },
  {
    email: 'mkalmheire@adfd.ae',
    name: 'Meera Al Mehairi',
    role: 'archive_team',
    department: 'Archive Team',
    can_create_requests: true,
    can_approve_reject: false,
    can_disburse: false,
    view_only_access: false
  },

  // Observer Roles
  {
    email: 'falhamadi@adfd.ae',
    name: 'Fatima Al Hammadi',
    role: 'observer',
    department: 'Observer',
    can_create_requests: false,
    can_approve_reject: false,
    can_disburse: false,
    view_only_access: true
  },
  {
    email: 'aalhousani@adfd.ae',
    name: 'Adel Al Hosani',
    role: 'observer',
    department: 'Observer',
    can_create_requests: false,
    can_approve_reject: false,
    can_disburse: false,
    view_only_access: true
  },

  // Regional Operations
  {
    email: 'aalderei@adfd.ae',
    name: 'Ali Al Derie',
    role: 'operations_team',
    department: 'Regional Operations',
    can_create_requests: false,
    can_approve_reject: true,
    can_disburse: false,
    view_only_access: false
  },
  {
    email: 'aalkalbani@adfd.ae',
    name: 'Ahmed Al Kalbani',
    role: 'operations_team',
    department: 'Regional Operations',
    can_create_requests: false,
    can_approve_reject: true,
    can_disburse: false,
    view_only_access: false
  },
  {
    email: 'amalmansoori@adfd.ae',
    name: 'Abdulla Al Mansoori',
    role: 'operations_team',
    department: 'Regional Operations',
    can_create_requests: false,
    can_approve_reject: true,
    can_disburse: false,
    view_only_access: false
  },

  // Core Banking
  {
    email: 'asiddique@adfd.ae',
    name: 'Ahmed Siddique',
    role: 'core_banking',
    department: 'Core Banking',
    can_create_requests: false,
    can_approve_reject: false,
    can_disburse: true,
    view_only_access: false
  },
  {
    email: 'yjamous@adfd.ae',
    name: 'Yazan Jamous',
    role: 'core_banking',
    department: 'Core Banking',
    can_create_requests: false,
    can_approve_reject: false,
    can_disburse: true,
    view_only_access: false
  },
  {
    email: 'ahmotiwala@adfd.ae',
    name: 'Ameer Hamza',
    role: 'core_banking',
    department: 'Core Banking',
    can_create_requests: false,
    can_approve_reject: false,
    can_disburse: true,
    view_only_access: false
  },

  // Admin (Exception for testing)
  {
    email: 'Mamadouourydiallo819@gmail.com',
    name: 'Mitty Mamadouourydiallo',
    role: 'admin',
    department: 'Administration',
    can_create_requests: true,
    can_approve_reject: true,
    can_disburse: true,
    view_only_access: false
  },
  {
    email: 'ousmanehabi.168@gmail.com',
    name: 'Ousmane',
    role: 'admin',
    department: 'Administration',
    can_create_requests: true,
    can_approve_reject: true,
    can_disburse: true,
    view_only_access: false
  }
];

// Helper functions
export const isAuthorizedUser = (email: string): boolean => {
  const normalizedEmail = email.toLowerCase().trim();
  return AUTHORIZED_USERS.some(user => 
    user.email.toLowerCase() === normalizedEmail
  );
};

export const getAuthorizedUser = (email: string): AuthorizedUser | null => {
  const normalizedEmail = email.toLowerCase().trim();
  return AUTHORIZED_USERS.find(user => 
    user.email.toLowerCase() === normalizedEmail
  ) || null;
};

export const validateEmailDomain = (email: string): boolean => {
  const adminEmails = [
    'Mamadouourydiallo819@gmail.com',
    'ousmanehabi.168@gmail.com'
  ];
  const allowedDomain = '@adfd.ae';

  // Normalize email for comparison (case-insensitive)
  const normalizedEmail = email.toLowerCase().trim();

  // Allow admin emails as exceptions (case-insensitive)
  if (adminEmails.some(adminEmail =>
    normalizedEmail === adminEmail.toLowerCase()
  )) {
    return true;
  }

  // Check if email ends with allowed domain (case-insensitive)
  return normalizedEmail.endsWith(allowedDomain.toLowerCase());
};
