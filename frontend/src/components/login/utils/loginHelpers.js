/**
 * Login mode constants
 */
export const LOGIN_MODES = {
  DEFAULT: 'default',
  ADMIN_REGISTER: 'admin-register',
  INVITE: 'invite',
};

/**
 * Error code to user-friendly message mapping
 */
export const ERROR_MESSAGES = {
  NOT_INVITED: "You haven't been invited to this platform yet. Please ask your administrator for an invitation.",
  EMAIL_MISMATCH: null, // Use server message
  INVALID_INVITE: 'This invitation link is invalid or has expired. Please ask your administrator for a new invitation.',
  PENDING_INVITATION: 'Please use the invitation link sent to your email to complete your registration.',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact your administrator.',
  DEFAULT: 'Login failed. Please try again.',
  GOOGLE_ERROR: 'Google login failed. Please try again.',
};

/**
 * Get user-friendly error message from error response
 * @param {Object} error - Error object from API
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.message;

  if (errorCode && ERROR_MESSAGES[errorCode] !== undefined) {
    return ERROR_MESSAGES[errorCode] ?? errorMessage;
  }

  return errorMessage || ERROR_MESSAGES.DEFAULT;
};

/**
 * Feature items for admin registration
 */
export const ADMIN_FEATURES = [
  {
    icon: 'Building2',
    title: 'Create Your Company',
    description: 'Set up your organization profile',
    bgColor: 'bg-amber-50/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    icon: 'Users',
    title: 'Invite Your Team',
    description: 'Add employees via email invitations',
    bgColor: 'bg-orange-50/50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: 'Shield',
    title: 'Full Admin Access',
    description: 'Manage team, leads, and analytics',
    bgColor: 'bg-yellow-50/50',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
];

/**
 * Theme configurations for different login modes
 */
export const MODE_THEMES = {
  [LOGIN_MODES.DEFAULT]: {
    gradient: 'from-sky-100 via-blue-50 to-cyan-100',
    bgDecor1: 'bg-sky-200',
    bgDecor2: 'bg-blue-200',
    cardBorder: 'border-sky-100',
    spinnerColor: 'border-sky-500',
    iconGradient: 'from-sky-400 to-blue-500',
    shadowColor: 'shadow-sky-500/30',
  },
  [LOGIN_MODES.ADMIN_REGISTER]: {
    gradient: 'from-amber-50 via-orange-50 to-yellow-50',
    bgDecor1: 'bg-amber-200',
    bgDecor2: 'bg-orange-200',
    cardBorder: 'border-amber-100',
    spinnerColor: 'border-amber-500',
    iconGradient: 'from-amber-400 to-orange-500',
    shadowColor: 'shadow-amber-500/30',
  },
  [LOGIN_MODES.INVITE]: {
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    bgDecor1: 'bg-emerald-200',
    bgDecor2: 'bg-green-200',
    cardBorder: 'border-emerald-100',
    spinnerColor: 'border-emerald-500',
    iconGradient: 'from-emerald-400 to-green-500',
    shadowColor: 'shadow-emerald-500/30',
  },
};
