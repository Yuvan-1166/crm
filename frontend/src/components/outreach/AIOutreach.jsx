import { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  Trash2,
  Users,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  Filter,
  ArrowRight,
  ArrowLeft,
  Mail,
  Zap,
  BookOpen,
  UserCheck,
  MailCheck,
  Search,
} from 'lucide-react';
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getRAGStatus,
  getContactsByThreshold,
  generateEmails,
  sendEmails,
} from '../../services/outreachService';

const STATUS_OPTIONS = [
  { value: 'LEAD', label: 'Lead' },
  { value: 'MQL', label: 'MQL' },
  { value: 'SQL', label: 'SQL' },
  { value: 'OPPORTUNITY', label: 'Opportunity' },
  { value: 'CUSTOMER', label: 'Customer' },
];

const STEPS = [
  { num: 1, label: 'Setup & Select', icon: UserCheck },
  { num: 2, label: 'Write Intent', icon: BookOpen },
  { num: 3, label: 'Review & Send', icon: MailCheck },
];

const TEMP_STYLES = {
  HOT: 'bg-red-50 text-red-600 border-red-200',
  WARM: 'bg-amber-50 text-amber-600 border-amber-200',
  COLD: 'bg-sky-50 text-sky-600 border-sky-200',
};

const AIOutreach = () => {
  // State
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // RAG State
  const [ragStatus, setRagStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Filter State
  const [fromStatus, setFromStatus] = useState('LEAD');
  const [toStatus, setToStatus] = useState('MQL');
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');

  // Email Generation State
  const [employeeIntent, setEmployeeIntent] = useState('');
  const [generatedEmails, setGeneratedEmails] = useState([]);
  const [previewEmail, setPreviewEmail] = useState(null);

  // Sending State
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  // Load RAG status on mount
  useEffect(() => {
    loadRAGStatus();
  }, []);

  const loadRAGStatus = async () => {
    try {
      const status = await getRAGStatus();
      setRagStatus(status);
    } catch (err) {
      console.error('Failed to load RAG status:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await uploadDocument(file);
      setSuccess('Document uploaded successfully!');
      await loadRAGStatus();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Delete this document?')) return;

    try {
      await deleteDocument(docId);
      await loadRAGStatus();
      setSuccess('Document deleted');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getContactsByThreshold(fromStatus, toStatus);
      setContacts(result.contacts || []);
      setSelectedContacts([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const toggleContactSelection = (contactId) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.contact_id));
    }
  };

  const handleGenerateEmails = async () => {
    if (selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }
    if (!employeeIntent.trim()) {
      setError('Please enter your intent/instructions');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await generateEmails({
        contactIds: selectedContacts,
        employeeIntent,
        fromStatus,
        toStatus,
      });
      setGeneratedEmails(result.results || []);
      setActiveStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate emails');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    const emailsToSend = generatedEmails
      .filter((e) => e.success)
      .map((e) => ({
        contactId: e.contactId,
        to: e.contactEmail,
        subject: e.email.subject,
        body: e.email.body,
        htmlBody: e.email.htmlBody,
      }));

    if (emailsToSend.length === 0) {
      setError('No valid emails to send');
      return;
    }

    try {
      setSending(true);
      setError(null);
      const result = await sendEmails(emailsToSend);
      setSendResults(result);
      setSuccess(`Sent ${result.summary.sent} of ${result.summary.total} emails`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send emails');
    } finally {
      setSending(false);
    }
  };

  const resetFlow = () => {
    setActiveStep(1);
    setContacts([]);
    setSelectedContacts([]);
    setEmployeeIntent('');
    setGeneratedEmails([]);
    setSendResults(null);
    setError(null);
    setSuccess(null);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!contactSearch.trim()) return true;
    const q = contactSearch.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const successCount = generatedEmails.filter((e) => e.success).length;
  const failCount = generatedEmails.length - successCount;

  return (
    <div className="space-y-5">
      {/* Alerts — floating toast style */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-800">Something went wrong</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl animate-slide-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-emerald-800 self-center">{success}</p>
        </div>
      )}

      {/* Stepper — horizontal pill-style */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5">
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === step.num;
            const isDone = activeStep > step.num;
            return (
              <div key={step.num} className="flex items-center flex-1">
                <button
                  onClick={() => step.num < activeStep && setActiveStep(step.num)}
                  disabled={step.num > activeStep}
                  className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-lg transition-all text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                      : isDone
                      ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isDone
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? <CheckCircle className="w-4 h-4" /> : step.num}
                  </div>
                  <span className="text-sm font-medium truncate">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className={`w-4 h-4 mx-1 flex-shrink-0 ${
                    isDone ? 'text-indigo-300' : 'text-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ======== STEP 1: Setup & Select Contacts ======== */}
      {activeStep === 1 && (
        <div className="space-y-5">
          {/* Two-column layout: Documents | Filter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Company Documents Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Knowledge Base</h3>
                    <p className="text-[11px] text-gray-400">RAG documents for AI context</p>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Upload
                  </span>
                </label>
              </div>

              <div className="p-4">
                {ragStatus?.documents?.length > 0 ? (
                  <div className="space-y-2">
                    {ragStatus.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="group flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{doc.filename}</p>
                          <p className="text-[11px] text-gray-400">{doc.chunksCount} chunks indexed</p>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No documents yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload PDF, DOCX, or TXT files for AI context</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Target Audience</h3>
                  <p className="text-[11px] text-gray-400">Filter contacts by pipeline status</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">From Status</label>
                    <select
                      value={fromStatus}
                      onChange={(e) => setFromStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    >
                      {STATUS_OPTIONS.slice(0, -1).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="pb-2.5">
                    <ArrowRight className="w-5 h-5 text-gray-300" />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">To Status</label>
                    <select
                      value={toStatus}
                      onChange={(e) => setToStatus(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    >
                      {STATUS_OPTIONS.slice(1).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={loadContacts}
                  disabled={loading}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-100"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Load Contacts
                </button>

                {/* Quick stats */}
                {contacts.length > 0 && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-indigo-700">
                      <strong>{contacts.length}</strong> contacts found
                    </span>
                    {selectedContacts.length > 0 && (
                      <span className="ml-auto text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {selectedContacts.length} selected
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contacts List Card */}
          {contacts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-sky-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Contacts
                    <span className="ml-1.5 text-xs font-normal text-gray-400">({contacts.length})</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 w-40 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <button
                    onClick={selectAllContacts}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {filteredContacts.map((contact) => {
                  const isSelected = selectedContacts.includes(contact.contact_id);
                  return (
                    <div
                      key={contact.contact_id}
                      onClick={() => toggleContactSelection(contact.contact_id)}
                      className={`flex items-center gap-3.5 px-5 py-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isSelected
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {(contact.name || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{contact.name}</p>
                        <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                        TEMP_STYLES[contact.temperature] || TEMP_STYLES.COLD
                      }`}>
                        {contact.temperature}
                      </span>
                    </div>
                  );
                })}

                {filteredContacts.length === 0 && contactSearch && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">No contacts match "{contactSearch}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Step — sticky bottom bar */}
          {selectedContacts.length > 0 && (
<div className="sticky -bottom-4 z-10 bg-white border-t border-gray-200 -mx-4 -mb-4 px-5 py-3.5 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">              <span className="text-sm text-gray-500">
                <strong className="text-gray-800">{selectedContacts.length}</strong> of {contacts.length} contacts selected
              </span>
              <button
                onClick={() => setActiveStep(2)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-100"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======== STEP 2: Write Intent & Generate ======== */}
      {activeStep === 2 && (
        <div className="space-y-5">
          {/* Intent Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Your Instructions</h3>
                <p className="text-[11px] text-gray-400">Tell the AI what you want to communicate</p>
              </div>
            </div>
            <div className="p-5">
              <textarea
                value={employeeIntent}
                onChange={(e) => setEmployeeIntent(e.target.value)}
                placeholder="e.g., I want to introduce our new product features and schedule a demo call. Focus on how we can help them improve their workflow efficiency..."
                className="w-full h-36 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white resize-none transition-colors leading-relaxed"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                The AI uses your instructions along with uploaded company documents to craft personalized emails for each contact.
              </p>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-5">
            <h4 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">Campaign Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{selectedContacts.length}</p>
                <p className="text-[11px] text-indigo-500 mt-0.5">Recipients</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{fromStatus}</p>
                <p className="text-[11px] text-indigo-500 mt-0.5">→ {toStatus}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-indigo-700">{ragStatus?.documentsCount || 0}</p>
                <p className="text-[11px] text-indigo-500 mt-0.5">Documents</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleGenerateEmails}
              disabled={loading || !employeeIntent.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-sm shadow-indigo-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate {selectedContacts.length} Emails
            </button>
          </div>
        </div>
      )}

      {/* ======== STEP 3: Review & Send ======== */}
      {activeStep === 3 && (
        <div className="space-y-5">
          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{generatedEmails.length}</p>
                <p className="text-[11px] text-gray-400">Total Generated</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{successCount}</p>
                <p className="text-[11px] text-gray-400">Ready to Send</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{failCount}</p>
                <p className="text-[11px] text-gray-400">Failed</p>
              </div>
            </div>
          </div>

          {/* Generated Emails Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MailCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Generated Emails</h3>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {generatedEmails.map((result, index) => (
                <div
                  key={index}
                  className={`px-5 py-3.5 flex items-center gap-3.5 transition-colors ${
                    result.success ? 'hover:bg-gray-50' : 'bg-red-50/40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    result.success ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                  }`}>
                    {result.success
                      ? (result.contactName || '?')[0].toUpperCase()
                      : <AlertCircle className="w-4 h-4" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{result.contactName}</span>
                      <span className="text-xs text-gray-400 truncate">{result.contactEmail}</span>
                    </div>
                    {result.success ? (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {result.email.subject}
                      </p>
                    ) : (
                      <p className="text-xs text-red-500 mt-0.5">{result.error}</p>
                    )}
                  </div>

                  {result.success && (
                    <button
                      onClick={() => setPreviewEmail(result)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Send Results */}
          {sendResults && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Emails Sent Successfully</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Delivered {sendResults.summary.sent} of {sendResults.summary.total} emails
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetFlow}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
            {!sendResults && (
              <button
                onClick={handleSendEmails}
                disabled={sending || successCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all disabled:opacity-50 shadow-sm shadow-emerald-200"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send {successCount} Emails
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======== Email Preview Modal ======== */}
      {previewEmail && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Mail className="w-4.5 h-4.5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Email Preview</h3>
                  <p className="text-xs text-gray-400">{previewEmail.contactName}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-16 flex-shrink-0">To</span>
                <span className="text-gray-700 font-medium">{previewEmail.contactEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-400 w-16 flex-shrink-0">Subject</span>
                <span className="text-gray-800 font-semibold">{previewEmail.email.subject}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {previewEmail.email.body}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIOutreach;
