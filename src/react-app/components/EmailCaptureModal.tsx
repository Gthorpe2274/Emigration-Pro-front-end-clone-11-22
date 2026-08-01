import { useState, useEffect } from 'react';
import { Mail, X, ArrowRight } from 'lucide-react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  assessmentId?: number;
}

export default function EmailCaptureModal({ isOpen, onClose, onSubmit, assessmentId }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Capture affiliate ref code from URL on first load and persist it in sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) sessionStorage.setItem('affiliateRef', ref);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store email lead in database and create CRM record
      const affiliateCode = sessionStorage.getItem('affiliateRef') || null;

      const response = await fetch('/api/subscribe-for-permanent-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          assessment_id: assessmentId,
          affiliate_code: affiliateCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save email');
      }

      const data = await response.json();

      // Store email and session code in sessionStorage for future use
      sessionStorage.setItem('userEmail', email.toLowerCase());
      if (data.session_code) {
        sessionStorage.setItem('accessToken', data.session_code);
      }

      // Redirect to report generation app
      if (data.report_url) {
        // Use the report URL provided by backend (already relative)
        window.location.href = data.report_url;
      } else {
        // Fallback: rebuild the same relative URL the worker would have
        // returned. It must stay on this origin — sending the user to another
        // host drops sessionStorage, and with it the affiliate attribution.
        const params = new URLSearchParams();
        if (affiliateCode) params.append('ref', affiliateCode);
        if (assessmentId) params.append('assessment_id', String(assessmentId));
        params.append('email', email.toLowerCase());
        window.location.href = `/checkout-report?${params.toString()}`;
      }
      
      // Keep the modal in submitting state until redirect completes
    } catch (err) {
      console.error('Error capturing email:', err);
      setError(err instanceof Error ? err.message : 'Failed to save email. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Your Emigration Report
          </h2>
          <p className="text-gray-600">
            Enter your email to proceed to checkout and receive your personalized emigration guide
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                Continue to Generate your Report and check out
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your email will be used to send your report and provide support. We respect your privacy.
        </p>
      </div>
    </div>
  );
}
