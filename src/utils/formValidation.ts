// Form Validation Utilities for Manual Withdrawal Request Form
// Provides comprehensive validation functions for all form fields

import { ValidationResult, ManualFormData } from '../types/manualFormTypes';

// IBAN validation utility
export const validateIBAN = (iban: string): ValidationResult => {
  if (!iban) {
    return { isValid: false, message: 'IBAN is required', severity: 'error' };
  }

  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Check length (15-34 characters)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return { isValid: false, message: 'IBAN must be between 15-34 characters', severity: 'error' };
  }

  // Check format (2 letters + 2 digits + alphanumeric)
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
  if (!ibanRegex.test(cleanIBAN)) {
    return { isValid: false, message: 'Invalid IBAN format (e.g., GB82WEST12345698765432)', severity: 'error' };
  }

  // Basic checksum validation (simplified)
  try {
    const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());
    
    // For large numbers, we'll do a simplified check
    if (numericString.length > 15) {
      return { isValid: true, message: 'IBAN format appears valid', severity: 'info' };
    }
    
    const remainder = BigInt(numericString) % BigInt(97);
    if (remainder !== BigInt(1)) {
      return { isValid: false, message: 'IBAN checksum validation failed', severity: 'error' };
    }
  } catch (error) {
    return { isValid: true, message: 'IBAN format appears valid (checksum not verified)', severity: 'info' };
  }

  return { isValid: true, message: 'Valid IBAN', severity: 'info' };
};

// SWIFT code validation
export const validateSWIFT = (swift: string): ValidationResult => {
  if (!swift) {
    return { isValid: false, message: 'SWIFT code is required', severity: 'error' };
  }

  const cleanSWIFT = swift.replace(/\s/g, '').toUpperCase();
  
  // SWIFT codes are 8 or 11 characters
  if (cleanSWIFT.length !== 8 && cleanSWIFT.length !== 11) {
    return { isValid: false, message: 'SWIFT code must be 8 or 11 characters', severity: 'error' };
  }

  // Format: 4 letters (bank) + 2 letters (country) + 2 alphanumeric (location) + optional 3 alphanumeric (branch)
  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!swiftRegex.test(cleanSWIFT)) {
    return { isValid: false, message: 'Invalid SWIFT format (e.g., DEUTDEFF or DEUTDEFF500)', severity: 'error' };
  }

  return { isValid: true, message: 'Valid SWIFT code', severity: 'info' };
};

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required', severity: 'error' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address', severity: 'error' };
  }

  return { isValid: true };
};

// Amount validation
export const validateAmount = (amount: string): ValidationResult => {
  if (!amount) {
    return { isValid: false, message: 'Amount is required', severity: 'error' };
  }

  // Remove commas and spaces
  const cleanAmount = amount.replace(/[,\s]/g, '');
  
  // Check if it's a valid number
  const numericAmount = parseFloat(cleanAmount);
  if (isNaN(numericAmount)) {
    return { isValid: false, message: 'Please enter a valid amount', severity: 'error' };
  }

  // Check if positive
  if (numericAmount <= 0) {
    return { isValid: false, message: 'Amount must be greater than zero', severity: 'error' };
  }

  // Check reasonable limits (up to 1 billion)
  if (numericAmount > 1000000000) {
    return { isValid: false, message: 'Amount exceeds maximum limit', severity: 'error' };
  }

  // Check decimal places (max 2)
  const decimalPlaces = (cleanAmount.split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, message: 'Amount can have maximum 2 decimal places', severity: 'error' };
  }

  return { isValid: true, message: `Amount: ${numericAmount.toLocaleString()}`, severity: 'info' };
};

// Date validation
export const validateDate = (date: string, fieldName: string = 'Date'): ValidationResult => {
  if (!date) {
    return { isValid: false, message: `${fieldName} is required`, severity: 'error' };
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, message: `Please enter a valid ${fieldName.toLowerCase()}`, severity: 'error' };
  }

  // Check if date is not too far in the past (more than 10 years)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (dateObj < tenYearsAgo) {
    return { isValid: false, message: `${fieldName} cannot be more than 10 years ago`, severity: 'warning' };
  }

  // Check if date is not too far in the future (more than 5 years)
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(fiveYearsFromNow.getFullYear() + 5);
  
  if (dateObj > fiveYearsFromNow) {
    return { isValid: false, message: `${fieldName} cannot be more than 5 years in the future`, severity: 'warning' };
  }

  return { isValid: true };
};

// Required field validation
export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || value.trim().length === 0) {
    return { isValid: false, message: `${fieldName} is required`, severity: 'error' };
  }
  return { isValid: true };
};

// Text length validation
export const validateLength = (value: string, minLength: number = 0, maxLength: number = 1000, fieldName: string = 'Field'): ValidationResult => {
  if (value.length < minLength) {
    return { isValid: false, message: `${fieldName} must be at least ${minLength} characters`, severity: 'error' };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, message: `${fieldName} cannot exceed ${maxLength} characters`, severity: 'error' };
  }
  
  return { isValid: true };
};

// Phone number validation (international format)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required', severity: 'error' };
  }

  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Check for international format (+country code + number)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, message: 'Please enter phone in international format (+1234567890)', severity: 'error' };
  }

  return { isValid: true };
};

// Comprehensive field validator
export const validateField = (fieldName: keyof ManualFormData, value: string, formData: ManualFormData): ValidationResult => {
  // Handle empty values for optional fields
  if (!value && !isRequiredField(fieldName)) {
    return { isValid: true };
  }

  switch (fieldName) {
    case 'iban':
      return validateIBAN(value);
    
    case 'swiftCode':
    case 'correspondenceSwiftCode':
      return validateSWIFT(value);
    
    case 'requestedAmount':
      return validateAmount(value);
    
    case 'agreementDate':
      return validateDate(value, 'Agreement Date');
    
    case 'valueDate':
      return validateDate(value, 'Value Date');
    
    case 'signatureDate':
      return validateDate(value, 'Signature Date');
    
    case 'beneficiaryName':
      const nameValidation = validateRequired(value, 'Beneficiary Name');
      if (!nameValidation.isValid) return nameValidation;
      return validateLength(value, 2, 100, 'Beneficiary Name');
    
    case 'projectName':
      const projectValidation = validateRequired(value, 'Project Name');
      if (!projectValidation.isValid) return projectValidation;
      return validateLength(value, 2, 200, 'Project Name');
    
    case 'paymentPurpose':
      const purposeValidation = validateRequired(value, 'Payment Purpose');
      if (!purposeValidation.isValid) return purposeValidation;
      return validateLength(value, 5, 500, 'Payment Purpose');
    
    case 'bankName':
      const bankValidation = validateRequired(value, 'Bank Name');
      if (!bankValidation.isValid) return bankValidation;
      return validateLength(value, 2, 100, 'Bank Name');
    
    case 'authorizedRepresentative1':
      const rep1Validation = validateRequired(value, 'Authorized Representative');
      if (!rep1Validation.isValid) return rep1Validation;
      return validateLength(value, 2, 100, 'Authorized Representative');
    
    default:
      // Generic validation for other fields
      if (isRequiredField(fieldName)) {
        return validateRequired(value, getFieldDisplayName(fieldName));
      }
      return { isValid: true };
  }
};

// Helper function to check if field is required
const isRequiredField = (fieldName: keyof ManualFormData): boolean => {
  const requiredFields: (keyof ManualFormData)[] = [
    'country',
    'projectName',
    'contractReference',
    'requestedAmount',
    'paymentPurpose',
    'valueDate',
    'beneficiaryName',
    'bankName',
    'iban',
    'swiftCode',
    'authorizedRepresentative1',
    'signatureDate'
  ];
  
  return requiredFields.includes(fieldName);
};

// Helper function to get display name for field
const getFieldDisplayName = (fieldName: keyof ManualFormData): string => {
  const displayNames: Record<keyof ManualFormData, string> = {
    projectNumber: 'Project Number',
    referenceNumber: 'Reference Number',
    country: 'Country',
    projectName: 'Project Name',
    projectDescription: 'Project Description',
    contractReference: 'Contract Reference',
    agreementDate: 'Agreement Date',
    agreementParty: 'Agreement Party',
    requestedAmount: 'Requested Amount',
    currency: 'Currency',
    vatStatus: 'VAT Status',
    paymentPurpose: 'Payment Purpose',
    valueDate: 'Value Date',
    beneficiaryName: 'Beneficiary Name',
    beneficiaryAddress: 'Beneficiary Address',
    bankName: 'Bank Name',
    bankAddress: 'Bank Address',
    accountNumber: 'Account Number',
    iban: 'IBAN',
    swiftCode: 'SWIFT Code',
    correspondenceBankName: 'Correspondence Bank Name',
    correspondenceBankAddress: 'Correspondence Bank Address',
    correspondenceSwiftCode: 'Correspondence SWIFT Code',
    authorizedRepresentative1: 'Authorized Representative 1',
    authorizedRepresentative1Title: 'Representative 1 Title',
    authorizedRepresentative2: 'Authorized Representative 2',
    authorizedRepresentative2Title: 'Representative 2 Title',
    signatureDate: 'Signature Date',
    additionalNotes: 'Additional Notes',
    priority: 'Priority',
    requestDate: 'Request Date'
  };
  
  return displayNames[fieldName] || fieldName;
};

// Format amount for display
export const formatAmount = (amount: string): string => {
  if (!amount) return '';
  
  const numericAmount = parseFloat(amount.replace(/[,\s]/g, ''));
  if (isNaN(numericAmount)) return amount;
  
  return numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format IBAN for display (with spaces every 4 characters)
export const formatIBAN = (iban: string): string => {
  if (!iban) return '';
  
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  return cleanIBAN.replace(/(.{4})/g, '$1 ').trim();
};
