import { memo } from 'react';
import { ContactDetail, AddContactModal } from '../contacts';
import { AddSessionModal, TakeActionModal } from '../sessions';
import EmailComposer from '../email/EmailComposer';

/**
 * Contact detail sidebar with backdrop
 */
const ContactDetailSidebar = memo(({
  contact,
  onClose,
  onEmailClick,
  onUpdate,
  onAddSession,
  onFollowupsClick,
}) => {
  if (!contact) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <ContactDetail
        contact={contact}
        onEmailClick={onEmailClick}
        onClose={onClose}
        onUpdate={onUpdate}
        onAddSession={onAddSession}
        onFollowupsClick={onFollowupsClick}
      />
    </>
  );
});

ContactDetailSidebar.displayName = 'ContactDetailSidebar';

/**
 * Dashboard modals container
 * Groups all modal components used in the dashboard
 */
const DashboardModals = memo(({
  // Contact detail
  selectedContact,
  onCloseContact,
  onUpdateContact,
  onAddSession,
  onEmailClick,
  onFollowupsClick,
  
  // Add contact modal
  showAddModal,
  onCloseAddModal,
  onAddContact,
  
  // Add session modal
  addSessionContact,
  onCloseSessionModal,
  onSessionSubmit,
  
  // Take action modal
  takeActionData,
  onCloseTakeAction,
  onConfirmPromotion,
  
  // Email composer
  emailContact,
  onCloseEmail,
  onEmailSuccess,
  
  // Loading state
  submitting,
}) => {
  return (
    <>
      {/* Contact Detail Sidebar */}
      <ContactDetailSidebar
        contact={selectedContact}
        onClose={onCloseContact}
        onEmailClick={onEmailClick}
        onUpdate={onUpdateContact}
        onAddSession={onAddSession}
        onFollowupsClick={onFollowupsClick}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={showAddModal}
        onClose={onCloseAddModal}
        onSubmit={onAddContact}
        loading={submitting}
      />

      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={!!addSessionContact}
        contact={addSessionContact}
        onClose={onCloseSessionModal}
        onSubmit={onSessionSubmit}
        loading={submitting}
      />

      {/* Take Action Modal */}
      <TakeActionModal
        isOpen={!!takeActionData}
        contact={takeActionData?.contact}
        targetStatus={takeActionData?.targetStatus}
        onClose={onCloseTakeAction}
        onConfirm={onConfirmPromotion}
        loading={submitting}
      />

      {/* Email Compose Modal */}
      <EmailComposer
        isOpen={!!emailContact}
        contact={emailContact}
        onClose={onCloseEmail}
        onSuccess={onEmailSuccess}
      />
    </>
  );
});

DashboardModals.displayName = 'DashboardModals';

export default DashboardModals;
