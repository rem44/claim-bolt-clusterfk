import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimsContext';
import { ClaimStatus, Department, ClaimCategory, ProductCategory } from '../types/claim';
import { Client } from '../types/client';
import ClientSelector from '../components/ui/ClientSelector';
import InvoiceSelector from '../components/ui/InvoiceSelector';
import { 
  ArrowLeft, 
  ChevronRight,
  ChevronLeft,
  Save,
  Upload,
  FileText,
  Calendar,
  Hash
} from 'lucide-react';

const CreateClaim: React.FC = () => {
  const navigate = useNavigate();
  const { addClaim } = useClaims();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    claimNumber: `CLM-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000)).substring(1)}`,
    clientId: '',
    clientName: '',
    department: '',
    claimCategory: '',
    category: '',
    installed: false,
    installationDate: '',
    installerName: '',
    invoiceLink: '',
    description: '',
    products: [],
    solutionAmount: 0,
    claimedAmount: 0,
    documents: [],
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      clientId: client.id,
      clientName: client.name
    });

    if (validationErrors.clientId) {
      const newErrors = { ...validationErrors };
      delete newErrors.clientId;
      setValidationErrors(newErrors);
    }
  };

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.clientId) errors.clientId = 'Client selection is required';
      if (!formData.department) errors.department = 'Department is required';
      if (!formData.claimCategory) errors.claimCategory = 'Claim category is required';
      if (!formData.category) errors.category = 'Product category is required';
      if (formData.installed) {
        if (!formData.installationDate) {
          errors.installationDate = 'Installation date is required when product is installed';
        }
        if (!formData.installerName) {
          errors.installerName = 'Installer name is required when product is installed';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      try {
        const newClaim = {
          claim_number: formData.claimNumber,
          client_id: formData.clientId,
          creation_date: new Date().toISOString(),
          status: ClaimStatus.New,
          department: formData.department as Department,
          claim_category: formData.claimCategory as ClaimCategory,
          category: formData.category as ProductCategory,
          installed: formData.installed,
          installation_date: formData.installed && formData.installationDate ? new Date(formData.installationDate).toISOString() : null,
          installer_name: formData.installed ? formData.installerName : null,
          invoice_link: formData.invoiceLink,
          description: formData.description,
          solution_amount: 0,
          claimed_amount: 0,
          saved_amount: 0,
          last_updated: new Date().toISOString(),
          alerts: [],
          alert_count: 0,
          last_alert_check: new Date().toISOString()
        };

        const claim = await addClaim(newClaim);
        navigate(`/claims/${claim.id}`);
      } catch (error) {
        console.error('Error creating claim:', error);
        setValidationErrors({
          submit: 'Failed to create claim. Please try again.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button 
          onClick={() => navigate('/')}
          className="mr-3 text-gray-500 hover:text-corporate-secondary transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Claim</h1>
          <p className="text-gray-500">Complete all required information to submit a new claim</p>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claim Number
            </label>
            <input 
              type="text" 
              value={formData.claimNumber}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent bg-gray-50"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated claim number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Creation Date
            </label>
            <div className="relative">
              <input 
                type="text" 
                value={new Date().toLocaleDateString()}
                className="w-full p-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent bg-gray-50"
                disabled
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>

          <div className={validationErrors.clientId ? 'has-error' : ''}>
            <ClientSelector 
              onClientSelect={handleClientSelect}
              selectedClientId={formData.clientId}
            />
            {validationErrors.clientId && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.clientId}</p>
            )}
          </div>

          <div className={validationErrors.department ? 'has-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className={`w-full p-2 border ${
                validationErrors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent`}
            >
              <option value="">Select Department</option>
              {Object.values(Department).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {validationErrors.department && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.department}</p>
            )}
          </div>

          <div className={validationErrors.claimCategory ? 'has-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claim Category <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.claimCategory}
              onChange={(e) => handleChange('claimCategory', e.target.value)}
              className={`w-full p-2 border ${
                validationErrors.claimCategory ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent`}
            >
              <option value="">Select Category</option>
              {Object.values(ClaimCategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {validationErrors.claimCategory && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.claimCategory}</p>
            )}
          </div>

          <div className={validationErrors.category ? 'has-error' : ''}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Category <span className="text-red-500">*</span>
            </label>
            <select 
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={`w-full p-2 border ${
                validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent`}
            >
              <option value="">Select Product Category</option>
              {Object.values(ProductCategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installed Product
            </label>
            <div className="flex items-center mt-2">
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input 
                  type="checkbox"
                  id="installed-toggle"
                  checked={formData.installed}
                  onChange={(e) => handleChange('installed', e.target.checked)}
                  className="absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer checked:right-0 checked:border-corporate-secondary transition-all duration-200"
                />
                <label 
                  htmlFor="installed-toggle"
                  className="block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
              <label htmlFor="installed-toggle" className="text-sm text-gray-700 cursor-pointer">
                {formData.installed ? 'Yes' : 'No'}
              </label>
            </div>
          </div>

          {formData.installed && (
            <>
              <div className={validationErrors.installationDate ? 'has-error' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installation Date <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => handleChange('installationDate', e.target.value)}
                  className={`w-full p-2 border ${
                    validationErrors.installationDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent`}
                />
                {validationErrors.installationDate && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.installationDate}</p>
                )}
              </div>

              <div className={validationErrors.installerName ? 'has-error' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Installer Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={formData.installerName}
                  onChange={(e) => handleChange('installerName', e.target.value)}
                  placeholder="Enter installer name"
                  className={`w-full p-2 border ${
                    validationErrors.installerName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent`}
                />
                {validationErrors.installerName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.installerName}</p>
                )}
              </div>
            </>
          )}

          <div>
            <InvoiceSelector 
              onInvoiceSelect={(invoiceNumber) => handleChange('invoiceLink', invoiceNumber)}
              selectedInvoice={formData.invoiceLink}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea 
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-corporate-secondary focus:border-transparent"
              rows={4}
              placeholder="Describe the claim in detail"
            ></textarea>
          </div>
        </div>

        {validationErrors.submit && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {validationErrors.submit}
          </div>
        )}

        <div className="flex justify-end mt-6 space-x-3">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-corporate-secondary text-white rounded-md flex items-center ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-corporate-accent'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Create Claim
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateClaim;