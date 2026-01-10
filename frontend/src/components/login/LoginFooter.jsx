import { memo } from 'react';

/**
 * Footer with terms and privacy policy
 */
const LoginFooter = memo(({ showLinks = false, showCopyright = false }) => (
  <>
    {showLinks && (
      <p className="text-center text-sm text-gray-500 mt-6">
        By signing in, you agree to our{' '}
        <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="text-sky-600 hover:text-sky-700 font-medium">
          Privacy Policy
        </a>
      </p>
    )}

    {!showLinks && (
      <p className="text-center text-xs text-gray-400 mt-8">
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    )}

    {showCopyright && (
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400">
          © {new Date().getFullYear()} CRM System. All rights reserved.
        </p>
      </div>
    )}
  </>
));

LoginFooter.displayName = 'LoginFooter';

export default LoginFooter;
