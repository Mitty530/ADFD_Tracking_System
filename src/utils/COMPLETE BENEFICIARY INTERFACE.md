import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  DollarSign, 
  CreditCard, 
  User, 
  FileText, 
  Globe,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Upload,
  Info
} from 'lucide-react';

export default function BeneficiaryWithdrawalForm() {
  const [formData, setFormData] = useState({
    // Project Information
    projectNumber: '',
    projectName: '',
    country: '',
    
    // Beneficiary Details
    beneficiaryName: '',
    beneficiaryAddress: '',
    beneficiaryPhone: '',
    beneficiaryEmail: '',
    
    // Financial Information
    requestedAmount: '',
    currency: 'USD',
    vatStatus: 'exclusive',
    paymentPurpose: '',
    contractReference: '',
    
    // Banking Information
    bankName: '',
    bankAddress: '',
    accountNumber: '',
    iban: '',
    swiftCode: '',
    
    // Correspondence Bank (if applicable)
    correspondenceBankName: '',
    correspondenceBankAddress: '',
    correspondenceSwiftCode: '',
    
    // Authorization
    authorizedRepresentative: '',
    representativeTitle: '',
    signatureDate: '',
    
    // Supporting Documents
    attachments: []
  });

  const countries = [
    { value: 'madagascar', label: 'Madagascar', region: 'Africa' },
    { value: 'seychelles', label: 'Seychelles', region: 'Africa' },
    { value: 'kenya', label: 'Kenya', region: 'Africa' },
    { value: 'oman', label: 'Oman', region: 'Asia' },
    { value: 'bangladesh', label: 'Bangladesh', region: 'Asia' },
    { value: 'indonesia', label: 'Indonesia', region: 'Asia' },
    { value: 'brazil', label: 'Brazil', region: 'South America' },
    { value: 'colombia', label: 'Colombia', region: 'South America' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'AED', label: 'AED - UAE Dirham' },
    { value: 'GBP', label: 'GBP - British Pound' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-900">
            <Building2 className="h-8 w-8" />
            Abu Dhabi Fund for Development
          </CardTitle>
          <p className="text-blue-700 font-medium">Withdrawal Request Form</p>
          <p className="text-sm text-blue-600">
            Al Buteen P.O. Box: 814, Abu Dhabi, United Arab Emirates
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        
        {/* Project Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Project Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please provide details about the project for which you are requesting withdrawal
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectNumber" className="text-sm font-medium">
                  Project Number *
                </Label>
                <Input
                  id="projectNumber"
                  placeholder="e.g., 4313"
                  value={formData.projectNumber}
                  onChange={(e) => handleInputChange('projectNumber', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Country of Operation *
                </Label>
                <Select 
                  value={formData.country} 
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{country.label}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {country.region}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-sm font-medium">
                Project Name/Description *
              </Label>
              <Input
                id="projectName"
                placeholder="e.g., West Coast Road Rehabilitation Project - Phase 2"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractReference" className="text-sm font-medium">
                Contract Reference
              </Label>
              <Input
                id="contractReference"
                placeholder="Contract reference number or agreement details"
                value={formData.contractReference}
                onChange={(e) => handleInputChange('contractReference', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Beneficiary Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-600" />
              Beneficiary Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please provide complete information about the entity requesting the withdrawal
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="beneficiaryName" className="text-sm font-medium">
                Beneficiary Name/Company Name *
              </Label>
              <Input
                id="beneficiaryName"
                placeholder="e.g., United Concrete Products Seychelles Limited"
                value={formData.beneficiaryName}
                onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="beneficiaryAddress" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Complete Address *
              </Label>
              <Textarea
                id="beneficiaryAddress"
                placeholder="Full business address including street, city, postal code, and country"
                rows={3}
                value={formData.beneficiaryAddress}
                onChange={(e) => handleInputChange('beneficiaryAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="beneficiaryPhone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="beneficiaryPhone"
                  placeholder="+248 123 4567"
                  value={formData.beneficiaryPhone}
                  onChange={(e) => handleInputChange('beneficiaryPhone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beneficiaryEmail" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="beneficiaryEmail"
                  type="email"
                  placeholder="contact@company.com"
                  value={formData.beneficiaryEmail}
                  onChange={(e) => handleInputChange('beneficiaryEmail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              Financial Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please specify the amount and currency for the withdrawal request
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount" className="text-sm font-medium">
                  Requested Amount *
                </Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  step="0.01"
                  placeholder="26511.14"
                  value={formData.requestedAmount}
                  onChange={(e) => handleInputChange('requestedAmount', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">
                  Currency *
                </Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">VAT Status *</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="vatStatus"
                    value="exclusive"
                    checked={formData.vatStatus === 'exclusive'}
                    onChange={(e) => handleInputChange('vatStatus', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Exclusive of VAT</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="vatStatus"
                    value="inclusive"
                    checked={formData.vatStatus === 'inclusive'}
                    onChange={(e) => handleInputChange('vatStatus', e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">Inclusive of VAT</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentPurpose" className="text-sm font-medium">
                Purpose of Payment *
              </Label>
              <Textarea
                id="paymentPurpose"
                placeholder="Describe the purpose of this withdrawal request (e.g., contractor payment for Phase 2 construction work)"
                rows={2}
                value={formData.paymentPurpose}
                onChange={(e) => handleInputChange('paymentPurpose', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Banking Information Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              Banking Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please provide complete banking details for the withdrawal transfer
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-sm font-medium">
                Beneficiary Bank Name *
              </Label>
              <Input
                id="bankName"
                placeholder="e.g., MAURITIUS COMMERCIAL BANK (SEYCHELLES) LTD"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAddress" className="text-sm font-medium">
                Bank Address *
              </Label>
              <Textarea
                id="bankAddress"
                placeholder="Complete bank address"
                rows={2}
                value={formData.bankAddress}
                onChange={(e) => handleInputChange('bankAddress', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-medium">
                  Bank Account Number *
                </Label>
                <Input
                  id="accountNumber"
                  placeholder="0000744612"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode" className="text-sm font-medium">
                  SWIFT Code *
                </Label>
                <Input
                  id="swiftCode"
                  placeholder="MCBLSCSC"
                  value={formData.swiftCode}
                  onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban" className="text-sm font-medium">
                IBAN (if applicable)
              </Label>
              <Input
                id="iban"
                placeholder="SC78MCBL06010000000744612"
                value={formData.iban}
                onChange={(e) => handleInputChange('iban', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Correspondence Bank Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              Correspondence Bank (If Required)
            </CardTitle>
            <p className="text-sm text-gray-600">
              Fill this section only if your bank requires a correspondence bank for international transfers
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="correspondenceBankName" className="text-sm font-medium">
                Correspondence Bank Name
              </Label>
              <Input
                id="correspondenceBankName"
                placeholder="e.g., CITIBANK A NEWYORK"
                value={formData.correspondenceBankName}
                onChange={(e) => handleInputChange('correspondenceBankName', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="correspondenceSwiftCode" className="text-sm font-medium">
                  Correspondence SWIFT Code
                </Label>
                <Input
                  id="correspondenceSwiftCode"
                  placeholder="CTIUS33"
                  value={formData.correspondenceSwiftCode}
                  onChange={(e) => handleInputChange('correspondenceSwiftCode', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correspondenceBankAddress" className="text-sm font-medium">
                  Correspondence Bank Address
                </Label>
                <Input
                  id="correspondenceBankAddress"
                  placeholder="388 GREENWICH STREET NEWYORK"
                  value={formData.correspondenceBankAddress}
                  onChange={(e) => handleInputChange('correspondenceBankAddress', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authorization Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-red-600" />
              Authorization
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please provide details of the person authorized to make this request
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authorizedRepresentative" className="text-sm font-medium">
                  Authorized Representative *
                </Label>
                <Input
                  id="authorizedRepresentative"
                  placeholder="Mr. Jhon Alberta"
                  value={formData.authorizedRepresentative}
                  onChange={(e) => handleInputChange('authorizedRepresentative', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="representativeTitle" className="text-sm font-medium">
                  Title/Position *
                </Label>
                <Input
                  id="representativeTitle"
                  placeholder="CHAIRMAN"
                  value={formData.representativeTitle}
                  onChange={(e) => handleInputChange('representativeTitle', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signatureDate" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date of Request *
              </Label>
              <Input
                id="signatureDate"
                type="date"
                value={formData.signatureDate}
                onChange={(e) => handleInputChange('signatureDate', e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Supporting Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" />
              Supporting Documents
            </CardTitle>
            <p className="text-sm text-gray-600">
              Please attach any relevant supporting documents for your withdrawal request
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
              </p>
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Important Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Please ensure all information provided is accurate and complete. 
            Incomplete or incorrect information may result in delays in processing your withdrawal request. 
            By submitting this form, you confirm that you are authorized to make this request on behalf of the beneficiary entity.
          </AlertDescription>
        </Alert>

        {/* Submit Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="w-full sm:w-auto">
                Save as Draft
              </Button>
              <Button onClick={handleSubmit} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Submit Withdrawal Request
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              After submission, you will receive a confirmation email with your request reference number. 
              Processing typically takes 5-10 business days.
            </p>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}