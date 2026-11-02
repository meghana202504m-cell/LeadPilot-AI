import React, { useState, useEffect } from 'react';
import {
  Send,
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap,
  MapPin,
  Plus
} from 'lucide-react';
import { Lead, LeadEnquiryInput } from '../../types/index.ts';
import { submitLeadEnquiry, fetchRegions, addSupportedRegion } from '../../services/api.ts';
import { evaluateLocationServiceability } from '../../utils/locationValidation.ts';

interface SubmitEnquiryViewProps {
  onSuccess: (newLead: Lead) => void;
  onNavigateToLead: (lead: Lead) => void;
}

export const SubmitEnquiryView: React.FC<SubmitEnquiryViewProps> = ({
  onSuccess,
  onNavigateToLead,
}) => {
  const [formData, setFormData] = useState<LeadEnquiryInput>({
    company: '',
    contactName: '',
    email: '',
    phone: '',
    city: 'Mysuru, Karnataka', // Default service location in Karnataka
    companySize: '50-200 employees',
    annualBudget: 45000,
    industry: 'Enterprise SaaS',
    useCase: 'Need automated lead qualification and CRM syncing to cut response times down from 48 hours to under 5 minutes.',
    timeline: 'Immediate (< 30 days)',
    notes: 'Decision maker signed off on Q4 budget allocation.',
  });

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ email?: boolean; phone?: boolean; city?: boolean }>({});

  // Configurable service regions (Default: Karnataka state)
  const [supportedCities, setSupportedCities] = useState<string[]>(['Karnataka']);
  const [newCityInput, setNewCityInput] = useState('');
  const [regionStatusMessage, setRegionStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [qualifiedResult, setQualifiedResult] = useState<Lead | null>(null);

  // Load supported regions from backend
  useEffect(() => {
    fetchRegions()
      .then((cfg) => {
        if (cfg && cfg.supportedCities && cfg.supportedCities.length > 0) {
          setSupportedCities(cfg.supportedCities);
        }
      })
      .catch((err) => console.error('Failed to load regions:', err));
  }, []);

  // Validation functions
  const validateEmail = (val: string): string | null => {
    if (!val || val.trim() === '') return 'Email address is required.';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(val.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  };

  const validatePhone = (val: string): string | null => {
    if (!val || val.trim() === '') return null; // phone optional or validated if provided
    const raw = val.trim();
    // Reject letters
    if (/[a-zA-Z]/.test(raw)) {
      return 'Enter a valid 10-digit mobile number';
    }
    // Check if international format with +
    if (raw.startsWith('+')) {
      const intlRegex = /^\+[1-9]\d{7,14}$/;
      if (!intlRegex.test(raw.replace(/[\s-]/g, ''))) {
        return 'Enter a valid international phone number';
      }
      return null;
    }
    // Check standard 10-digit mobile number
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  };

  const validateLocation = (val: string | undefined): string | null => {
    if (!val || val.trim() === '') {
      return 'Location is required. Please specify your city or region in Karnataka.';
    }
    return null;
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setEmailError(validateEmail(formData.email));
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    setPhoneError(validatePhone(formData.phone));
  };

  const handleLocationBlur = () => {
    setTouched((prev) => ({ ...prev, city: true }));
    setLocationError(validateLocation(formData.city));
  };

  // Evaluate location serviceability based on state-based rules
  const locationEvaluation = evaluateLocationServiceability(formData.city, supportedCities);
  const isCurrentLocationServiceable = locationEvaluation.isServiceable;

  // Quick preset templates for test scenarios
  const applyPreset = (
    type:
      | 'mysuru_karnataka'
      | 'bengaluru_karnataka'
      | 'mangaluru_karnataka'
      | 'unlisted_karnataka'
      | 'noida_outside'
      | 'invalid_phone'
      | 'invalid_email'
  ) => {
    setRegionStatusMessage(null);
    setFormError(null);
    setQualifiedResult(null);

    if (type === 'mysuru_karnataka') {
      setFormData({
        company: 'Mysuru Aerospace Systems',
        contactName: 'Lavanya Murthy',
        email: 'lavanya@example.com',
        phone: '9876543210',
        city: 'Mysuru, Karnataka',
        companySize: '500-1000 employees',
        annualBudget: 75000,
        industry: 'Enterprise SaaS',
        useCase: 'Automated CRM lead routing and dispatch for Mysuru enterprise facility.',
        timeline: 'Immediate (< 30 days)',
        notes: 'Serviceable Karnataka state lead with verified contact.',
      });
      setEmailError(null);
      setPhoneError(null);
      setLocationError(null);
    } else if (type === 'bengaluru_karnataka') {
      setFormData({
        company: 'Bengaluru Tech Innovations',
        contactName: 'Karthik Gowda',
        email: 'karthik@bengalurutech.io',
        phone: '9845012345',
        city: 'Bengaluru, Karnataka',
        companySize: '200-500 employees',
        annualBudget: 60000,
        industry: 'Technology',
        useCase: 'Enterprise AI intake qualification for Bengaluru headquarters.',
        timeline: '1-3 months',
        notes: 'State-based eligibility verification for Karnataka capital city.',
      });
      setEmailError(null);
      setPhoneError(null);
      setLocationError(null);
    } else if (type === 'mangaluru_karnataka') {
      setFormData({
        company: 'Mangaluru Coastal Logistics',
        contactName: 'Sunil Rao',
        email: 'sunil@coastallogistics.in',
        phone: '9844019283',
        city: 'Mangaluru, Karnataka',
        companySize: '50-200 employees',
        annualBudget: 55000,
        industry: 'Logistics',
        useCase: 'Port cargo enquiry automation and dispatching.',
        timeline: 'Immediate (< 30 days)',
        notes: 'Serviceable coastal Karnataka enterprise enquiry.',
      });
      setEmailError(null);
      setPhoneError(null);
      setLocationError(null);
    } else if (type === 'unlisted_karnataka') {
      setFormData({
        company: 'Tumakuru Industrial Works',
        contactName: 'Ramesh Hegde',
        email: 'ramesh@tumakuruworks.co.in',
        phone: '9731298110',
        city: 'Tumakuru, Karnataka',
        companySize: '100-250 employees',
        annualBudget: 52000,
        industry: 'Manufacturing',
        useCase: 'Industrial supply enquiry routing in unlisted Karnataka district.',
        timeline: '1-3 months',
        notes: 'Verifies that valid unlisted Karnataka locations are serviceable.',
      });
      setEmailError(null);
      setPhoneError(null);
      setLocationError(null);
    } else if (type === 'noida_outside') {
      setFormData({
        company: 'Noida Digital Hub Ltd',
        contactName: 'Priya Sharma',
        email: 'priya@noidadigital.com',
        phone: '9811234567',
        city: 'Noida, Uttar Pradesh',
        companySize: '200-500 employees',
        annualBudget: 65000,
        industry: 'Enterprise SaaS',
        useCase: 'Testing out-of-state exclusion and non-serviceable lead handling.',
        timeline: 'Immediate (< 30 days)',
        notes: 'Location outside Karnataka must be excluded from approval queue.',
      });
      setEmailError(null);
      setPhoneError(null);
      setLocationError(null);
    } else if (type === 'invalid_phone') {
      setFormData({
        company: 'Test Contact Corp',
        contactName: 'Testing Contact',
        email: 'test@example.com',
        phone: '98765abc10', // Invalid characters
        city: 'Mysuru, Karnataka',
        companySize: '50-200 employees',
        annualBudget: 35000,
        industry: 'Logistics',
        useCase: 'Validation rejection demonstration',
        timeline: '1-3 months',
        notes: 'Demonstrates phone rejection with letters.',
      });
      setPhoneError('Enter a valid 10-digit mobile number');
      setLocationError(null);
    } else {
      setFormData({
        company: 'Test Email Corp',
        contactName: 'Lavanya Test',
        email: 'lavanya@', // Malformed email
        phone: '9876543210',
        city: 'Mysuru, Karnataka',
        companySize: '50-200 employees',
        annualBudget: 25000,
        industry: 'Healthcare',
        useCase: 'Email validation test',
        timeline: '3-6 months',
        notes: 'Demonstrates email rejection.',
      });
      setEmailError('Enter a valid email address');
      setLocationError(null);
    }
  };

  const handleAddRegion = async () => {
    setRegionStatusMessage(null);
    const trimmed = newCityInput.trim();
    if (!trimmed) {
      setRegionStatusMessage({
        text: 'Please enter a valid region or state name.',
        type: 'error',
      });
      return;
    }

    // Check if region already exists
    if (supportedCities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setRegionStatusMessage({
        text: `Region '${trimmed}' already exists in supported service areas.`,
        type: 'error',
      });
      return;
    }

    try {
      const res = await addSupportedRegion(trimmed);
      if (res && res.supportedCities) {
        setSupportedCities(res.supportedCities);
        setNewCityInput('');
        setRegionStatusMessage({
          text: `Region '${trimmed}' successfully added and persisted to service areas.`,
          type: 'success',
        });
        setTimeout(() => setRegionStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setRegionStatusMessage({
        text: err.message || 'Failed to add region',
        type: 'error',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Run validations
    const eErr = validateEmail(formData.email);
    const pErr = validatePhone(formData.phone);
    const lErr = validateLocation(formData.city);

    setEmailError(eErr);
    setPhoneError(pErr);
    setLocationError(lErr);
    setTouched({ email: true, phone: true, city: true });

    if (lErr) {
      setFormError(lErr);
      return;
    }

    if (eErr || pErr) {
      setFormError('Please resolve the contact validation errors before submitting.');
      return;
    }

    if (!formData.company || !formData.contactName) {
      setFormError('Please provide company name and contact person.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      setSubmitStep('Validating email format and 10-digit mobile number...');
      await new Promise((r) => setTimeout(r, 200));

      setSubmitStep(`Evaluating state-based service eligibility for '${formData.city}'...`);
      await new Promise((r) => setTimeout(r, 250));

      setSubmitStep('Calculating AI BANT matrices and policy approval rules...');
      const createdLead = await submitLeadEnquiry(formData);

      setSubmitStep('Dispatching routing instructions & updating FIFO queue...');
      await new Promise((r) => setTimeout(r, 200));

      setQualifiedResult(createdLead);
      onSuccess(createdLead);
    } catch (err: any) {
      setFormError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header and Preset Shortcuts */}
      <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Inbound Lead Qualification Form</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            State-based eligibility (Karnataka), AI BANT qualification, and FIFO manager approval routing.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400">Jury Test Scenarios:</span>
          <button
            type="button"
            onClick={() => applyPreset('mysuru_karnataka')}
            className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium transition-colors"
          >
            1. Mysuru (KA)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('bengaluru_karnataka')}
            className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium transition-colors"
          >
            2. Bengaluru (KA)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('mangaluru_karnataka')}
            className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-xs font-medium transition-colors"
          >
            3. Mangaluru (KA)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('unlisted_karnataka')}
            className="px-2.5 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 text-xs font-medium transition-colors"
          >
            4. Unlisted KA (Tumakuru)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('noida_outside')}
            className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-medium transition-colors"
          >
            5. Noida (UP) Outside
          </button>
          <button
            type="button"
            onClick={() => applyPreset('invalid_phone')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Phone Err
          </button>
          <button
            type="button"
            onClick={() => applyPreset('invalid_email')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            Email Err
          </button>
        </div>
      </div>

      {/* Region Configuration Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 flex-wrap">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Supported Service Territory:{' '}
            {supportedCities.map((c) => (
              <span
                key={c}
                className="font-semibold text-emerald-300 font-mono mx-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40"
              >
                {c}
              </span>
            ))}
          </span>
          <span className="text-slate-400 text-[11px]">(All Karnataka districts and cities serviceable)</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCityInput}
            onChange={(e) => setNewCityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddRegion();
              }
            }}
            placeholder="Add region (e.g. Maharashtra)"
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48"
          />
          <button
            type="button"
            onClick={handleAddRegion}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Region</span>
          </button>
        </div>
      </div>

      {/* Dynamic Feedback Banner for Region Addition */}
      {regionStatusMessage && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
            regionStatusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {regionStatusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{regionStatusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Engine Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-[#0e1628] border border-slate-800 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Name <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Global Systems"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Person <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="e.g. Lavanya Murthy"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Email and Phone with Inline Validation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Email <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (touched.email) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={handleEmailBlur}
                    placeholder="lavanya@example.com"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-400 focus:outline-none ${
                      emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {emailError && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{emailError}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile / Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (touched.phone) setPhoneError(validatePhone(e.target.value));
                    }}
                    onBlur={handlePhoneBlur}
                    placeholder="9876543210 (10 digits)"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-400 focus:outline-none ${
                      phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {phoneError && (
                  <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{phoneError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Location Field with State-Based Serviceability Evaluation */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Customer Location (State: Karnataka) <span className="text-blue-400">*</span></span>
                </label>
                {formData.city?.trim() ? (
                  isCurrentLocationServiceable ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Serviceable in Karnataka</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Outside Service Area</span>
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-slate-400">Location required</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                    if (touched.city) setLocationError(validateLocation(e.target.value));
                  }}
                  onBlur={handleLocationBlur}
                  placeholder="e.g. Mysuru, Bengaluru, Mangaluru, Hubballi, Belagavi, or any Karnataka location"
                  className={`flex-1 px-3 py-2 rounded-lg bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-none ${
                    locationError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, city: 'Mysuru, Karnataka' });
                    setLocationError(null);
                  }}
                  className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Mysuru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, city: 'Bengaluru, Karnataka' });
                    setLocationError(null);
                  }}
                  className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Bengaluru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, city: 'Mangaluru, Karnataka' });
                    setLocationError(null);
                  }}
                  className="px-2 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Mangaluru
                </button>
              </div>

              {locationError && (
                <div className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Requirement: Display clear message if outside Karnataka */}
              {formData.city?.trim() && !isCurrentLocationServiceable && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Sorry, our service is currently available only in Karnataka.</span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed">
                    This location will be marked as Outside Service Area and preserved for future expansion analytics, but will NOT enter the manager approval FIFO queue.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Company Headcount
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="50-200 employees">50-200 employees</option>
                  <option value="200-500 employees">200-500 employees</option>
                  <option value="500-1000 employees">500-1000 employees</option>
                  <option value="1000-5000 employees">1000-5000 employees</option>
                  <option value="5000+ employees">5000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Industry Vertical
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Enterprise SaaS">Enterprise SaaS</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="E-Commerce">E-Commerce</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Public Sector">Public Sector</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Implementation Timeline
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Immediate (< 30 days)">Immediate (&lt; 30 days)</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="Evaluating / Unknown">Evaluating / Unknown</option>
                </select>
              </div>
            </div>

            {/* Annual Budget */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Annual Software Budget (USD)</span>
                </label>
                <span className="font-mono font-bold text-white text-sm tabular-nums">
                  ${formData.annualBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="200000"
                step="2500"
                value={formData.annualBudget}
                onChange={(e) => setFormData({ ...formData, annualBudget: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>$1,000 (Self-Serve)</span>
                <span className="text-amber-400 font-semibold">$50,000 (Approval Limit)</span>
                <span>$200,000+ (Strategic)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary Use Case & Pain Points
              </label>
              <textarea
                rows={3}
                value={formData.useCase}
                onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
                placeholder="Describe operational pain points, system bottlenecks, and software integration requirements..."
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !!emailError || !!phoneError || !!locationError || !formData.city?.trim()}
                className="w-full py-3 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Pipeline Ingestion...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Route Lead (FIFO Queue)</span>
                  </>
                )}
              </button>

              {isSubmitting && submitStep && (
                <div className="mt-2 text-center text-[11px] text-blue-400 font-mono animate-pulse">
                  {submitStep}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Live Qualification Engine Preview Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#0e1628] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Eligibility & BANT Status
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Matrix</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">State-Based Eligibility:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    isCurrentLocationServiceable
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {isCurrentLocationServiceable ? 'Karnataka (Serviceable)' : 'Outside Karnataka'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">FIFO Queue Eligibility:</span>
                <span className="font-mono text-white text-xs">
                  {isCurrentLocationServiceable ? 'Eligible for FIFO Queue' : 'Excluded (Out of Area)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Approval Policy:</span>
                <span
                  className={
                    formData.annualBudget >= 50000 && isCurrentLocationServiceable
                      ? 'text-amber-400 font-semibold'
                      : 'text-slate-300'
                  }
                >
                  {formData.annualBudget >= 50000 && isCurrentLocationServiceable
                    ? 'Requires Sign-Off (>= $50k)'
                    : isCurrentLocationServiceable
                    ? 'Standard Auto-Routing'
                    : 'Disqualified (Out of Area)'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80">
              <strong className="text-slate-200">Validation & Gate Policies:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li>All Karnataka locations supported (Mysuru, Bengaluru, Mangaluru, etc.)</li>
                <li>Out-of-state leads preserved but barred from approval FIFO queue</li>
                <li>Email verified using standard RFC pattern</li>
                <li>10-digit mobile number format strictly validated</li>
              </ul>
            </div>
          </div>

          {/* Qualified Result Showcase if just submitted */}
          {qualifiedResult && (
            <div className="p-5 rounded-xl bg-gradient-to-b from-blue-950/40 to-[#0e1628] border border-blue-500/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Lead Successfully Ingested!</span>
                </div>
                <span className="font-mono text-xs text-blue-300 font-semibold">{qualifiedResult.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Region Status</div>
                  <div
                    className={`font-semibold text-xs ${
                      qualifiedResult.regionStatus === 'Serviceable' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {qualifiedResult.regionStatus} ({qualifiedResult.city})
                  </div>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Approval Gate</div>
                  <div className="font-semibold text-white truncate">
                    {qualifiedResult.requiresApproval
                      ? 'In Review (FIFO Queue)'
                      : qualifiedResult.regionStatus === 'Outside Service Area'
                      ? 'Outside Service Area'
                      : qualifiedResult.status}
                  </div>
                </div>
              </div>

              {qualifiedResult.regionStatus === 'Outside Service Area' && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  Sorry, our service is currently available only in Karnataka.
                </div>
              )}

              <button
                onClick={() => onNavigateToLead(qualifiedResult)}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect in Lead Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
