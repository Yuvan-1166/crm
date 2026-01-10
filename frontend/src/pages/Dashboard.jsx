import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import {
  DashboardHeader,
  MobileSidebar,
  ErrorAlert,
  MainContent,
  DashboardModals,
  getInitials,
  VIEW_TYPES,
} from '../components/dashboard';
import {
  getContacts,
  createContact,
  updateContact,
  promoteToMQL,
  promoteToSQL,
  convertToOpportunity,
} from '../services/contactService';
import { createSession } from '../services/sessionService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState(VIEW_TYPES.CONTACTS);
  const [activeStage, setActiveStage] = useState('LEAD');

  // Data State
  const [contacts, setContacts] = useState([]);
  const [contactCounts, setContactCounts] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSessionContact, setAddSessionContact] = useState(null);
  const [takeActionData, setTakeActionData] = useState(null);
  const [emailContact, setEmailContact] = useState(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch contacts on mount and when stage changes
  useEffect(() => {
    fetchContacts();
  }, [activeStage]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContacts({ status: activeStage });
      const contactsArray = Array.isArray(data) ? data : [];
      setContacts(contactsArray);
      setContactCounts((prev) => ({ ...prev, [activeStage]: contactsArray.length }));
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts. Please try again.');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [activeStage]);

  // Contact handlers
  const handleAddContact = useCallback(async (contactData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createContact(contactData);
      await fetchContacts();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating contact:', err);
      setError(err.response?.data?.message || 'Failed to create contact. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [fetchContacts]);

  const handleUpdateContact = useCallback(async (contactId, updates) => {
    try {
      setError(null);
      await updateContact(contactId, updates);
      await fetchContacts();
      setSelectedContact((prev) =>
        prev?.contact_id === contactId
          ? contacts.find((c) => c.contact_id === contactId)
          : prev
      );
    } catch (err) {
      console.error('Error updating contact:', err);
      setError(err.response?.data?.message || 'Failed to update contact. Please try again.');
    }
  }, [contacts, fetchContacts]);

  const handleEmailClick = useCallback((contact) => {
    setEmailContact(contact);
  }, []);

  const handleFollowupsClick = useCallback((contact) => {
    navigate(`/followups/${contact.contact_id}`, { state: { contact } });
  }, [navigate]);

  const handleAddSession = useCallback((contact) => {
    setAddSessionContact(contact);
  }, []);

  // Session handlers
  const handleSessionSubmit = useCallback(async (sessionData) => {
    try {
      setSubmitting(true);
      setError(null);
      await createSession(sessionData);
      await fetchContacts();
      setAddSessionContact(null);
    } catch (err) {
      console.error('Error creating session:', err);
      setError(err.response?.data?.message || 'Failed to create session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [fetchContacts]);

  // Promotion handlers
  const handleTakeAction = useCallback((contact, targetStatus) => {
    setTakeActionData({ contact, targetStatus });
  }, []);

  const handleConfirmPromotion = useCallback(async (contact, targetStatus, additionalData) => {
    try {
      setSubmitting(true);
      setError(null);

      if (targetStatus === 'MQL') {
        await promoteToMQL(contact.contact_id);
      } else if (targetStatus === 'SQL') {
        await promoteToSQL(contact.contact_id);
      } else if (targetStatus === 'OPPORTUNITY') {
        await convertToOpportunity(contact.contact_id, additionalData?.value ?? null);
      }

      await fetchContacts();
      setTakeActionData(null);
    } catch (err) {
      console.error('Error promoting contact:', err);
      setError(err.response?.data?.message || 'Failed to promote contact. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [fetchContacts]);

  // Navigation handlers
  const handleStageChange = useCallback((stage) => {
    setActiveStage(stage);
    setActiveView(VIEW_TYPES.CONTACTS);
  }, []);

  const handleMobileStageChange = useCallback((stage) => {
    setActiveStage(stage);
    setActiveView(VIEW_TYPES.CONTACTS);
    setMobileMenuOpen(false);
  }, []);

  const handleMobileViewChange = useCallback((view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleOpenMobileMenu = useCallback(() => {
    setMobileMenuOpen(true);
  }, []);

  const handleEmailSuccess = useCallback(() => {
    fetchContacts();
  }, [fetchContacts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div
        className={`hidden lg:block fixed left-0 top-0 h-screen z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <Sidebar
          activeStage={activeStage}
          onStageChange={handleStageChange}
          contactCounts={contactCounts}
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          onViewChange={setActiveView}
          activeView={activeView}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={handleCloseMobileMenu}
        activeStage={activeStage}
        onStageChange={handleMobileStageChange}
        contactCounts={contactCounts}
        onViewChange={handleMobileViewChange}
        activeView={activeView}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* Top Header */}
        <DashboardHeader
          user={user}
          logout={logout}
          activeView={activeView}
          activeStage={activeStage}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          userMenuRef={userMenuRef}
          onMobileMenuOpen={handleOpenMobileMenu}
          getInitials={getInitials}
        />

        {/* Error Message */}
        <ErrorAlert error={error} onDismiss={() => setError(null)} />

        {/* Page Content */}
        <MainContent
          activeView={activeView}
          activeStage={activeStage}
          contacts={contacts}
          loading={loading}
          onContactSelect={setSelectedContact}
          onEmailClick={handleEmailClick}
          onFollowupsClick={handleFollowupsClick}
          onAddContact={() => setShowAddModal(true)}
        />
      </div>

      {/* All Dashboard Modals */}
      <DashboardModals
        // Contact detail
        selectedContact={selectedContact}
        onCloseContact={() => setSelectedContact(null)}
        onUpdateContact={handleUpdateContact}
        onAddSession={handleAddSession}
        onEmailClick={handleEmailClick}
        onFollowupsClick={handleFollowupsClick}
        // Add contact modal
        showAddModal={showAddModal}
        onCloseAddModal={() => setShowAddModal(false)}
        onAddContact={handleAddContact}
        // Add session modal
        addSessionContact={addSessionContact}
        onCloseSessionModal={() => setAddSessionContact(null)}
        onSessionSubmit={handleSessionSubmit}
        // Take action modal
        takeActionData={takeActionData}
        onCloseTakeAction={() => setTakeActionData(null)}
        onConfirmPromotion={handleConfirmPromotion}
        // Email composer
        emailContact={emailContact}
        onCloseEmail={() => setEmailContact(null)}
        onEmailSuccess={handleEmailSuccess}
        // Loading
        submitting={submitting}
      />
    </div>
  );
};

export default Dashboard;
