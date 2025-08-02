import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  FileText,
  Globe,
  DollarSign,
  Building,
  Users,
  Eye,
  Save,
  Loader
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import {
  ManualFormData,
  ManualFormState,
  FormSection,
  DEFAULT_MANUAL_FORM_DATA,
  FORM_SECTIONS,
  ADFD_COUNTRIES,
  CURRENCY_OPTIONS,
  VAT_STATUS_OPTIONS
} from '../types/manualFormTypes';
import { validateField, formatAmount, formatIBAN } from '../utils/formValidation';
import { withdrawalRequestService } from '../services/withdrawalRequestService';
import { requestStorageService } from '../services/requestStorageService';
import { WithdrawalRequest, Currency, Priority } from '../types/withdrawalTypes';

// Component props
export interface ManualWithdrawalRequestFormProps {
  onBack?: () => void;
  onSuccess?: (requestId: string) => void;
}

const ManualWithdrawalRequestForm: React.FC<ManualWithdrawalRequestFormProps> = ({ 
  onBack, 
  onSuccess 
}) => {
  const { user } = useAuth();
  
  // Form state management
  const [formState, setFormState] = useState<ManualFormState>({
    currentSection: 'country',
    formData: { ...DEFAULT_MANUAL_FORM_DATA },
    validation: {},
    isSubmitting: false,
    hasUnsavedChanges: false,
    completedSections: [],
    errors: [],
    lastSaved: null
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Auto-save functionality
  useEffect(() => {
    if (formState.hasUnsavedChanges) {
      const timer = setTimeout(() => {
        localStorage.setItem('adfd-manual-form-draft', JSON.stringify(formState.formData));
        setFormState(prev => ({ ...prev, lastSaved: new Date(), hasUnsavedChanges: false }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [formState.formData, formState.hasUnsavedChanges]);

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('adfd-manual-form-draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormState(prev => ({
          ...prev,
          formData: { ...DEFAULT_MANUAL_FORM_DATA, ...draftData }
        }));
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  // Generate sequential numbers (similar to AI form)
  const generateSequentialNumbers = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      projectNumber: `ADFD-${timestamp.toString().slice(-6)}-${random.toString().padStart(3, '0')}`,
      referenceNumber: `REF-${new Date().getFullYear()}-${timestamp.toString().slice(-4)}`
    };
  }, []);

  // Handle country selection
  const handleCountrySelect = (countryValue: string) => {
    const selectedCountry = ADFD_COUNTRIES.find(c => c.value === countryValue);
    if (!selectedCountry) return;

    const { projectNumber, referenceNumber } = generateSequentialNumbers();
    
    setFormState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        country: selectedCountry.label,
        projectNumber,
        referenceNumber,
        requestDate: new Date().toISOString().split('T')[0]
      },
      currentSection: 'project',
      completedSections: ['country'],
      hasUnsavedChanges: true
    }));
  };

  // Handle input changes
  const handleInputChange = (field: keyof ManualFormData, value: string) => {
    setFormState(prev => {
      const newFormData = { ...prev.formData, [field]: value };

      // Validate the field
      const validation = validateField(field, value, newFormData);
      const newValidation = { ...prev.validation, [field]: validation };

      return {
        ...prev,
        formData: newFormData,
        validation: newValidation,
        hasUnsavedChanges: true
      };
    });
  };

  // Navigation functions
  const goToNextSection = () => {
    const currentIndex = FORM_SECTIONS.findIndex(s => s.id === formState.currentSection);
    if (currentIndex < FORM_SECTIONS.length - 1) {
      const nextSection = FORM_SECTIONS[currentIndex + 1];
      setFormState(prev => ({
        ...prev,
        currentSection: nextSection.id,
        completedSections: [...prev.completedSections.filter(s => s !== formState.currentSection), formState.currentSection]
      }));
    }
  };

  const goToPreviousSection = () => {
    const currentIndex = FORM_SECTIONS.findIndex(s => s.id === formState.currentSection);
    if (currentIndex > 0) {
      const previousSection = FORM_SECTIONS[currentIndex - 1];
      setFormState(prev => ({
        ...prev,
        currentSection: previousSection.id
      }));
    }
  };

  // Check if current section is valid
  const isCurrentSectionValid = () => {
    const currentSectionConfig = FORM_SECTIONS.find(s => s.id === formState.currentSection);
    if (!currentSectionConfig) return false;

    // For country section, just check if country is selected
    if (formState.currentSection === 'country') {
      return !!formState.formData.country;
    }

    // For other sections, check required fields
    return currentSectionConfig.requiredFields.every(field => {
      const value = formState.formData[field as keyof ManualFormData];
      if (!value || value.trim().length === 0) return false;

      // Check validation if it exists
      const validation = formState.validation[field];
      if (validation && validation.isValid === false) return false;

      return true;
    });
  };

  // Convert form data to withdrawal request format
  const convertToWithdrawalRequest = (): Omit<WithdrawalRequest, 'id' | 'createdAt' | 'updatedAt'> => {
    const amount = parseFloat(formState.formData.requestedAmount.replace(/[,\s]/g, ''));

    return {
      projectNumber: formState.formData.projectNumber,
      refNumber: formState.formData.referenceNumber,
      beneficiaryName: formState.formData.beneficiaryName,
      country: formState.formData.country,
      amount: amount,
      currency: formState.formData.currency as Currency,
      valueDate: formState.formData.valueDate,
      currentStage: 'initial_review',
      status: `New manual request - ${formState.formData.projectName} - Pending initial review`,
      priority: 'medium' as Priority,
      assignedTo: 'archive001', // Default assignment
      processingDays: 0,
      notes: `Manual entry request for ${formState.formData.projectName}. Payment purpose: ${formState.formData.paymentPurpose}. ${formState.formData.additionalNotes ? 'Additional notes: ' + formState.formData.additionalNotes : ''}`,
      attachments: [] // No attachments for manual entry
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    try {
      setFormState(prev => ({ ...prev, isSubmitting: true, errors: [] }));

      // Final validation
      const allRequiredFields = FORM_SECTIONS.flatMap(section => section.requiredFields);
      const missingFields = allRequiredFields.filter(field => {
        const value = formState.formData[field as keyof ManualFormData];
        return !value || value.trim().length === 0;
      });

      if (missingFields.length > 0) {
        setFormState(prev => ({
          ...prev,
          errors: [`Missing required fields: ${missingFields.join(', ')}`],
          isSubmitting: false
        }));
        return;
      }

      // Convert and submit
      const withdrawalRequest = convertToWithdrawalRequest();
      const requestId = withdrawalRequestService.createRequest(withdrawalRequest);

      if (requestId) {
        // Clear draft
        localStorage.removeItem('adfd-manual-form-draft');

        // Success callback
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(requestId);
          }, 1500);
        }
      } else {
        throw new Error('Failed to create withdrawal request');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setFormState(prev => ({
        ...prev,
        errors: [error instanceof Error ? error.message : 'Failed to submit request'],
        isSubmitting: false
      }));
    }
  };

  // Filter countries based on search
  const filteredCountries = ADFD_COUNTRIES.filter(country =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get section icon
  const getSectionIcon = (section: FormSection) => {
    switch (section) {
      case 'country': return Globe;
      case 'project': return FileText;
      case 'financial': return DollarSign;
      case 'beneficiary': return Building;
      case 'authorization': return Users;
      case 'review': return Eye;
      default: return FileText;
    }
  };

  // Check if user has permission to create requests
  if (!user || !user.can_create_requests) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to create withdrawal requests. Only Archive team members can create new requests.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative" style={{ backgroundColor: '#FFFFFF' }}>
      {/* ADFD Brand Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50/30 via-white to-gray-50/30"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(0, 124, 186, 0.08), rgba(0, 77, 113, 0.05))' }}></div>
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse delay-150" style={{ background: 'linear-gradient(135deg, rgba(74, 139, 44, 0.06), rgba(0, 124, 186, 0.04))' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full blur-2xl animate-pulse delay-300" style={{ background: 'linear-gradient(135deg, rgba(0, 124, 186, 0.05), rgba(74, 139, 44, 0.03))' }}></div>
      </div>

      {/* ADFD Premium Header */}
      <header className="relative z-10 bg-white shadow-lg border-b" style={{ borderColor: '#DEE1E3' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #007CBA, #004D71)' }}
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <motion.h1
                  className="text-2xl font-bold"
                  style={{ color: '#1F2937' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  Create Withdrawal Request
                </motion.h1>
                <p className="text-sm" style={{ color: '#5B6670' }}>Manual data entry for ADFD withdrawal requests</p>
              </div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <motion.div
          className="bg-white p-6 rounded-3xl shadow-xl mb-8"
          style={{ border: '1px solid #DEE1E3' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          <div className="flex items-center justify-between">
            {FORM_SECTIONS.map((section, index) => {
              const Icon = getSectionIcon(section.id);
              const isCompleted = formState.completedSections.includes(section.id);
              const isCurrent = formState.currentSection === section.id;

              return (
                <div key={section.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <motion.div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
                        isCompleted ? 'text-white' :
                        isCurrent ? 'text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                      style={{
                        backgroundColor: isCompleted ? '#4A8B2C' :
                                        isCurrent ? '#007CBA' : undefined
                      }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </motion.div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${
                        isCurrent ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {section.title}
                      </p>
                      <p className="text-xs text-gray-400">{section.description}</p>
                    </div>
                  </div>
                  {index < FORM_SECTIONS.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-1 rounded-full transition-colors duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
          style={{ border: '1px solid #DEE1E3' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.01, y: -2 }}
        >
          {/* Auto-save indicator */}
          {formState.lastSaved && (
            <div className="bg-green-50 border-b border-green-200 px-6 py-2">
              <div className="flex items-center text-sm text-green-700">
                <Save className="w-4 h-4 mr-2" />
                Last saved: {formState.lastSaved.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Error display */}
          {formState.errors.length > 0 && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {formState.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Country Selection Step */}
              {formState.currentSection === 'country' && (
                <motion.div
                  key="country"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Project Country</h2>
                  <p className="text-gray-600 mb-8">Choose the country for this withdrawal request</p>

                  {/* Search input */}
                  <div className="max-w-md mx-auto mb-6">
                    <input
                      type="text"
                      placeholder="Search countries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Country grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {filteredCountries.map((country) => (
                      <motion.button
                        key={country.value}
                        onClick={() => handleCountrySelect(country.value)}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center">
                          <Globe className="w-5 h-5 text-gray-400 group-hover:text-green-500 mr-3" />
                          <span className="font-medium text-gray-800 group-hover:text-green-700">
                            {country.label}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {filteredCountries.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No countries found matching "{searchTerm}"</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Project Information Step */}
              {formState.currentSection === 'project' && (
                <motion.div
                  key="project"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Information</h2>
                    <p className="text-gray-600">Enter project and agreement details</p>
                  </div>

                  {/* Auto-generated fields display */}
                  <div className="backdrop-blur-md bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 rounded-3xl border border-white/20 mb-6">
                    <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
                      <Check className="w-5 h-5 mr-2 text-green-600" />
                      Auto-Generated Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white/50 rounded-2xl p-4">
                        <span className="text-blue-600 font-medium text-sm">Country:</span>
                        <p className="text-blue-800 font-semibold">{formState.formData.country}</p>
                      </div>
                      <div className="bg-white/50 rounded-2xl p-4">
                        <span className="text-blue-600 font-medium text-sm">Project Number:</span>
                        <p className="text-blue-800 font-mono font-semibold">{formState.formData.projectNumber}</p>
                      </div>
                      <div className="bg-white/50 rounded-2xl p-4">
                        <span className="text-blue-600 font-medium text-sm">Reference Number:</span>
                        <p className="text-blue-800 font-mono font-semibold">{formState.formData.referenceNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Project form fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={formState.formData.projectName}
                        onChange={(e) => handleInputChange('projectName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md ${
                          formState.validation.projectName?.isValid === false ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
                        }`}
                        placeholder="Enter the project name"
                      />
                      {formState.validation.projectName && !formState.validation.projectName.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.projectName.message}</p>
                      )}
                    </div>

                    {/* Contract Reference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contract Reference *
                      </label>
                      <input
                        type="text"
                        value={formState.formData.contractReference}
                        onChange={(e) => handleInputChange('contractReference', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formState.validation.contractReference?.isValid === false ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Contract reference number"
                      />
                      {formState.validation.contractReference && !formState.validation.contractReference.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.contractReference.message}</p>
                      )}
                    </div>

                    {/* Agreement Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agreement Date
                      </label>
                      <input
                        type="date"
                        value={formState.formData.agreementDate}
                        onChange={(e) => handleInputChange('agreementDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formState.validation.agreementDate?.isValid === false ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formState.validation.agreementDate && !formState.validation.agreementDate.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.agreementDate.message}</p>
                      )}
                    </div>

                    {/* Agreement Party */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Agreement Party
                      </label>
                      <input
                        type="text"
                        value={formState.formData.agreementParty}
                        onChange={(e) => handleInputChange('agreementParty', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Name of the agreement party"
                      />
                    </div>

                    {/* Project Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Description
                      </label>
                      <textarea
                        value={formState.formData.projectDescription}
                        onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Brief description of the project"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Financial Details Step */}
              {formState.currentSection === 'financial' && (
                <motion.div
                  key="financial"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Financial Details</h2>
                    <p className="text-gray-600">Enter payment amount and financial information</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Requested Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requested Amount *
                      </label>
                      <input
                        type="text"
                        value={formState.formData.requestedAmount}
                        onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formState.validation.requestedAmount?.isValid === false ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter amount (e.g., 100,000.00)"
                      />
                      {formState.validation.requestedAmount && !formState.validation.requestedAmount.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.requestedAmount.message}</p>
                      )}
                      {formState.validation.requestedAmount?.isValid && formState.validation.requestedAmount.message && (
                        <p className="mt-1 text-sm text-green-600">{formState.validation.requestedAmount.message}</p>
                      )}
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency *
                      </label>
                      <select
                        value={formState.formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        {CURRENCY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* VAT Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT Status
                      </label>
                      <select
                        value={formState.formData.vatStatus}
                        onChange={(e) => handleInputChange('vatStatus', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        {VAT_STATUS_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Value Date *
                      </label>
                      <input
                        type="date"
                        value={formState.formData.valueDate}
                        onChange={(e) => handleInputChange('valueDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formState.validation.valueDate?.isValid === false ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formState.validation.valueDate && !formState.validation.valueDate.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.valueDate.message}</p>
                      )}
                    </div>

                    {/* Payment Purpose */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Purpose *
                      </label>
                      <textarea
                        value={formState.formData.paymentPurpose}
                        onChange={(e) => handleInputChange('paymentPurpose', e.target.value)}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          formState.validation.paymentPurpose?.isValid === false ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Describe the purpose of this payment"
                      />
                      {formState.validation.paymentPurpose && !formState.validation.paymentPurpose.isValid && (
                        <p className="mt-1 text-sm text-red-600">{formState.validation.paymentPurpose.message}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Beneficiary & Banking Step */}
              {formState.currentSection === 'beneficiary' && (
                <motion.div
                  key="beneficiary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Beneficiary & Banking Details</h2>
                    <p className="text-gray-600">Enter beneficiary and banking information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Beneficiary Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Beneficiary Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiary Name *
                          </label>
                          <input
                            type="text"
                            value={formState.formData.beneficiaryName}
                            onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formState.validation.beneficiaryName?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Full name of the beneficiary"
                          />
                          {formState.validation.beneficiaryName && !formState.validation.beneficiaryName.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.beneficiaryName.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiary Address
                          </label>
                          <textarea
                            value={formState.formData.beneficiaryAddress}
                            onChange={(e) => handleInputChange('beneficiaryAddress', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Complete address of the beneficiary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Banking Details */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Banking Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            value={formState.formData.bankName}
                            onChange={(e) => handleInputChange('bankName', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formState.validation.bankName?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Name of the bank"
                          />
                          {formState.validation.bankName && !formState.validation.bankName.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.bankName.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SWIFT Code *
                          </label>
                          <input
                            type="text"
                            value={formState.formData.swiftCode}
                            onChange={(e) => handleInputChange('swiftCode', e.target.value.toUpperCase())}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                              formState.validation.swiftCode?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="DEUTDEFF or DEUTDEFF500"
                            maxLength={11}
                          />
                          {formState.validation.swiftCode && !formState.validation.swiftCode.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.swiftCode.message}</p>
                          )}
                          {formState.validation.swiftCode?.isValid && formState.validation.swiftCode.message && (
                            <p className="mt-1 text-sm text-green-600">{formState.validation.swiftCode.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bank Address
                          </label>
                          <textarea
                            value={formState.formData.bankAddress}
                            onChange={(e) => handleInputChange('bankAddress', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Complete address of the bank"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={formState.formData.accountNumber}
                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                            placeholder="Bank account number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IBAN *
                          </label>
                          <input
                            type="text"
                            value={formState.formData.iban}
                            onChange={(e) => handleInputChange('iban', e.target.value.toUpperCase())}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                              formState.validation.iban?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="GB82 WEST 1234 5698 7654 32"
                            maxLength={34}
                          />
                          {formState.validation.iban && !formState.validation.iban.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.iban.message}</p>
                          )}
                          {formState.validation.iban?.isValid && formState.validation.iban.message && (
                            <p className="mt-1 text-sm text-green-600">{formState.validation.iban.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Correspondence Bank (Optional) */}
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Correspondence Bank</h3>
                      <p className="text-sm text-gray-600 mb-4">Optional - Only if required for international transfers</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correspondence Bank Name
                          </label>
                          <input
                            type="text"
                            value={formState.formData.correspondenceBankName}
                            onChange={(e) => handleInputChange('correspondenceBankName', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Name of correspondence bank"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correspondence SWIFT Code
                          </label>
                          <input
                            type="text"
                            value={formState.formData.correspondenceSwiftCode}
                            onChange={(e) => handleInputChange('correspondenceSwiftCode', e.target.value.toUpperCase())}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono ${
                              formState.validation.correspondenceSwiftCode?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="SWIFT code"
                            maxLength={11}
                          />
                          {formState.validation.correspondenceSwiftCode && !formState.validation.correspondenceSwiftCode.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.correspondenceSwiftCode.message}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correspondence Bank Address
                          </label>
                          <textarea
                            value={formState.formData.correspondenceBankAddress}
                            onChange={(e) => handleInputChange('correspondenceBankAddress', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Address of correspondence bank"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Authorization Step */}
              {formState.currentSection === 'authorization' && (
                <motion.div
                  key="authorization"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authorization</h2>
                    <p className="text-gray-600">Enter authorized representatives and signature information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Primary Representative */}
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Primary Authorized Representative</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Representative Name *
                          </label>
                          <input
                            type="text"
                            value={formState.formData.authorizedRepresentative1}
                            onChange={(e) => handleInputChange('authorizedRepresentative1', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formState.validation.authorizedRepresentative1?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Full name of authorized representative"
                          />
                          {formState.validation.authorizedRepresentative1 && !formState.validation.authorizedRepresentative1.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.authorizedRepresentative1.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title/Position
                          </label>
                          <input
                            type="text"
                            value={formState.formData.authorizedRepresentative1Title}
                            onChange={(e) => handleInputChange('authorizedRepresentative1Title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Managing Director, CFO"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Representative (Optional) */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Secondary Authorized Representative</h3>
                      <p className="text-sm text-gray-600 mb-4">Optional - Additional signatory if required</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Representative Name
                          </label>
                          <input
                            type="text"
                            value={formState.formData.authorizedRepresentative2}
                            onChange={(e) => handleInputChange('authorizedRepresentative2', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Full name of second representative"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title/Position
                          </label>
                          <input
                            type="text"
                            value={formState.formData.authorizedRepresentative2Title}
                            onChange={(e) => handleInputChange('authorizedRepresentative2Title', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="e.g., Finance Manager, Director"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Signature Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Signature Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Signature Date *
                          </label>
                          <input
                            type="date"
                            value={formState.formData.signatureDate}
                            onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              formState.validation.signatureDate?.isValid === false ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {formState.validation.signatureDate && !formState.validation.signatureDate.isValid && (
                            <p className="mt-1 text-sm text-red-600">{formState.validation.signatureDate.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Review Step */}
              {formState.currentSection === 'review' && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Review & Submit</h2>
                    <p className="text-gray-600">Review all information before submitting your request</p>
                  </div>

                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Project Summary */}
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4">Project Information</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Country:</span> {formState.formData.country}</div>
                          <div><span className="font-medium">Project:</span> {formState.formData.projectName}</div>
                          <div><span className="font-medium">Contract:</span> {formState.formData.contractReference}</div>
                          <div><span className="font-medium">Project #:</span> {formState.formData.projectNumber}</div>
                          <div><span className="font-medium">Reference #:</span> {formState.formData.referenceNumber}</div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">Financial Details</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Amount:</span> {formatAmount(formState.formData.requestedAmount)} {formState.formData.currency}</div>
                          <div><span className="font-medium">VAT:</span> {formState.formData.vatStatus}</div>
                          <div><span className="font-medium">Value Date:</span> {formState.formData.valueDate}</div>
                          <div><span className="font-medium">Purpose:</span> {formState.formData.paymentPurpose.substring(0, 50)}{formState.formData.paymentPurpose.length > 50 ? '...' : ''}</div>
                        </div>
                      </div>

                      {/* Beneficiary Summary */}
                      <div className="bg-purple-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">Beneficiary & Banking</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Beneficiary:</span> {formState.formData.beneficiaryName}</div>
                          <div><span className="font-medium">Bank:</span> {formState.formData.bankName}</div>
                          <div><span className="font-medium">IBAN:</span> {formatIBAN(formState.formData.iban)}</div>
                          <div><span className="font-medium">SWIFT:</span> {formState.formData.swiftCode}</div>
                        </div>
                      </div>

                      {/* Authorization Summary */}
                      <div className="bg-orange-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-orange-800 mb-4">Authorization</h3>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Representative:</span> {formState.formData.authorizedRepresentative1}</div>
                          {formState.formData.authorizedRepresentative1Title && (
                            <div><span className="font-medium">Title:</span> {formState.formData.authorizedRepresentative1Title}</div>
                          )}
                          <div><span className="font-medium">Signature Date:</span> {formState.formData.signatureDate}</div>
                          {formState.formData.authorizedRepresentative2 && (
                            <div><span className="font-medium">Second Rep:</span> {formState.formData.authorizedRepresentative2}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={formState.formData.additionalNotes}
                        onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Any additional information or special instructions..."
                      />
                    </div>

                    {/* Submission Confirmation */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">Before Submitting</h4>
                          <p className="text-sm text-yellow-700">
                            Please review all information carefully. Once submitted, this request will be sent to the Operations team for review and approval.
                            You will receive email notifications about the status of your request.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Footer */}
          {formState.currentSection !== 'country' && (
            <div className="bg-white px-6 py-4 flex justify-between items-center border-t" style={{ borderColor: '#DEE1E3' }}>
              <div className="flex space-x-3">
                {FORM_SECTIONS.findIndex(s => s.id === formState.currentSection) > 0 && (
                  <motion.button
                    onClick={goToPreviousSection}
                    className="flex items-center px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: '#5B6670', color: 'white' }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </motion.button>
                )}
              </div>

              <div className="flex space-x-3">
                {FORM_SECTIONS.findIndex(s => s.id === formState.currentSection) < FORM_SECTIONS.length - 1 ? (
                  <motion.button
                    onClick={goToNextSection}
                    disabled={!isCurrentSectionValid()}
                    className={`flex items-center px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isCurrentSectionValid()
                        ? 'text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: isCurrentSectionValid() ? '#4A8B2C' : undefined
                    }}
                    whileHover={isCurrentSectionValid() ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isCurrentSectionValid() ? { scale: 0.95 } : {}}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!isCurrentSectionValid() || formState.isSubmitting}
                    className={`flex items-center px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isCurrentSectionValid() && !formState.isSubmitting
                        ? 'text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    style={{
                      backgroundColor: isCurrentSectionValid() && !formState.isSubmitting ? '#4A8B2C' : undefined
                    }}
                    whileHover={isCurrentSectionValid() && !formState.isSubmitting ? { scale: 1.05, y: -2 } : {}}
                    whileTap={isCurrentSectionValid() && !formState.isSubmitting ? { scale: 0.95 } : {}}
                  >
                    {formState.isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Request
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default ManualWithdrawalRequestForm;
