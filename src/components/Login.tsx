import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { isAuthorizedUser, validateEmailDomain } from '../config/authorizedUsers';
import { usePerformance } from '../hooks/usePerformance';
import OptimizedLogo from './OptimizedLogo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { user, loading, signInWithMagicLink } = useAuth();
  const { logPerformanceMetrics } = usePerformance();

  // Extract first name from user profile or localStorage
  const getFirstName = (user: any) => {
    if (!user) {
      // Try to get saved name from localStorage for personalized greeting
      const savedName = localStorage.getItem('adfd-user-first-name');
      return savedName || '';
    }

    // Try to get first name from the name field
    if (user.name) {
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0];
      // Save first name to localStorage for future personalized greetings
      localStorage.setItem('adfd-user-first-name', firstName);
      return firstName;
    }

    // Fallback to email prefix
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      // Capitalize first letter
      const firstName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      // Save first name to localStorage for future personalized greetings
      localStorage.setItem('adfd-user-first-name', firstName);
      return firstName;
    }

    return 'User';
  };

  useEffect(() => {
    setMounted(true);

    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('🔗 Supabase connection test:', { data: !!data, error: error?.message || 'No error' });
      } catch (err) {
        console.error('🔗 Supabase connection failed:', err);
      }
    };

    testConnection();

    // Log performance metrics for login page
    setTimeout(() => {
      logPerformanceMetrics();
    }, 100);





    // Always start with empty email - users must enter their email each time
    setEmail('');
  }, [logPerformanceMetrics]);

  // Handle auto-redirect for logged-in users and magic link errors
  useEffect(() => {
    if (user && !loading) {
      console.log('🔄 User is authenticated, redirecting to dashboard...');
      // Show welcome message briefly, then redirect
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500); // Slightly longer delay to show the welcome message
    } else if (!loading && !user) {
      // Check if this might be a failed magic link authentication
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      if (urlParams.get('error') || hashParams.get('error')) {
        const errorMsg = urlParams.get('error_description') || hashParams.get('error_description') || 'Authentication failed';
        setError(`🚫 Authentication failed: ${errorMsg}. Please try logging in again.`);

        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [user, loading, navigate]);



  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
      }

      // Check if user is in authorized list (this also validates domain)
      if (!isAuthorizedUser(email)) {
        setError('🚫 You are not authorized to access this system. Only ADFD team members with @adfd.ae email addresses (and authorized exceptions) can access the system. Contact admin for assistance.');
        setIsLoading(false);
        return;
      }

      console.log('🔄 Sending magic link to:', email);

      // Send magic link using AuthContext
      const { error: magicLinkError } = await signInWithMagicLink(email);

      if (magicLinkError) {
        console.error('❌ Magic link error:', magicLinkError);
        setError(magicLinkError || 'Failed to send login link. Please try again or contact the administrator.');
        return;
      }

      console.log('✅ Magic link sent successfully');

      // Clear any previously saved email data
      localStorage.removeItem('adfd-remember-me');
      localStorage.removeItem('adfd-saved-email');

      setSuccess('🎉 Login link sent! Check your email and click the link to sign in.');

    } catch (error) {
      console.error('❌ Magic link error:', error);
      setError('Failed to send login link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)',
        maxHeight: '100vh'
      }}
    >
      {/* Back Button */}
      <a href="/" className="back-button">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Home
      </a>

      {/* Centered Portrait-Oriented Container */}
      <div className="login-container flex relative"
        style={{
          width: '85vw',
          maxWidth: '1200px',
          height: '90vh',
          minHeight: '700px'
        }}
      >
      {/* Premium Styles */}
      <style>{`
        .premium-login-panel {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.2),
            0 16px 32px rgba(0, 0, 0, 0.15),
            0 8px 16px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          width: 100%;
          max-width: 550px;
          min-height: 600px;
          padding: 2.5rem;
        }
        
        .premium-brand-panel {
          background: linear-gradient(135deg, #4a5568 0%, #2b6cb0 100%);
          position: relative;
          overflow: hidden;
        }
        
        .premium-brand-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 70%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 50%);
        }
        
        .premium-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        
        .premium-input:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 
            0 0 0 4px rgba(59, 130, 246, 0.1),
            0 8px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .premium-button {
          width: 100%;
          padding: 18px 24px;
          background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
          color: #0f172a;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 4px 16px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .premium-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }

        .premium-button:hover::before {
          left: 100%;
        }

        .premium-button:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          box-shadow:
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 8px 24px rgba(0, 0, 0, 0.15);
          transform: translateY(-3px);
        }

        .premium-button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        
        .fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }





        /* Back Button */
        .back-button {
          position: absolute;
          top: 24px;
          left: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
        }

        .back-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }

        .back-button svg {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .back-button:hover svg {
          transform: translateX(-2px);
        }
        
        /* Panel Layout - Ensure exact 50/50 split with improved proportions */
        .login-panel-left,
        .login-panel-right {
          flex: 1 1 50%;
          width: 50%;
          height: 100%;
          min-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .login-panel-left {
          padding: 3rem 2rem;
          flex: 1 1 50%;
          width: 50%;
        }

        .login-panel-right {
          padding: 2rem;
          flex: 1 1 50%;
          width: 50%;
        }
        
        .login-container {
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0, 0, 0, 0.25);
        }
        
        /* Fixed viewport optimizations */
        .premium-login-panel {
          max-height: 90vh;
          overflow-y: auto;
          width: 100%;
          max-width: 480px;
        }

        .premium-brand-panel {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 1024px) {
          .login-container {
            flex-direction: column;
            height: auto;
            min-height: 100vh;
          }

          .login-panel-left,
          .login-panel-right {
            width: 100% !important;
            min-height: 50vh;
            flex: none;
          }
        }

        @media (min-height: 768px) and (max-height: 900px) {
          .premium-login-panel {
            padding: 1.5rem;
            max-width: 420px;
          }
        }

        /* Specific optimizations for common laptop resolutions */
        @media (min-width: 1366px) and (max-width: 1440px) and (min-height: 768px) and (max-height: 900px) {
          .premium-login-panel {
            padding: 1.25rem;
            max-width: 400px;
          }

          .premium-brand-panel {
            padding: 1.5rem;
          }
        }

        @media (min-width: 1920px) and (min-height: 1080px) {
          .premium-login-panel {
            padding: 2rem;
            max-width: 480px;
          }

          .premium-brand-panel {
            padding: 2.5rem;
          }
        }

        /* Portrait-Oriented Vertical Design */
        .login-container {
          display: flex;
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.25),
            0 16px 32px rgba(0, 0, 0, 0.15);
        }

        .login-panel-left,
        .login-panel-right {
          width: 50%;
          height: 100%;
          flex: 1 1 50%;
          min-width: 0;
          min-height: 100%;
          max-height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
        }

        /* Responsive Portrait Emphasis */
        @media (min-width: 1366px) and (max-width: 1440px) {
          .login-container {
            width: 88vw !important;
            height: 85vh !important;
          }
        }

        @media (min-width: 1441px) and (max-width: 1600px) {
          .login-container {
            width: 85vw !important;
            height: 88vh !important;
            max-width: 1100px !important;
          }
        }

        @media (min-width: 1601px) {
          .login-container {
            width: 80vw !important;
            height: 90vh !important;
            max-width: 1200px !important;
          }
        }

        @media (max-width: 1365px) {
          .login-container {
            width: 92vw !important;
            height: 82vh !important;
            min-height: 650px !important;
          }
        }

        /* Portrait Enhancement Effects */
        .login-container {
          transition: all 0.3s ease;
        }

        .login-container:hover {
          transform: translateY(-2px);
          box-shadow:
            0 40px 80px rgba(0, 0, 0, 0.3),
            0 20px 40px rgba(0, 0, 0, 0.2);
        }

        /* Subtle vertical emphasis animations */
        @keyframes portraitFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .login-container {
          animation: portraitFadeIn 0.8s ease-out;
        }
      `}</style>

      {/* Left Panel - Login Form */}
      <div className="login-panel-left relative z-10">
        <div className={`premium-login-panel rounded-2xl ${mounted ? 'fade-in' : ''}`}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-3 mb-6">
              <div className="relative">
                <OptimizedLogo size={40} className="h-10 w-10" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quandrox</h1>
                <p className="text-xs text-gray-500 font-medium">Financial Platform</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {(() => {
                const firstName = getFirstName(user);
                return firstName ? `Welcome Back, ${firstName}!` : 'Welcome Back';
              })()}
            </h2>
            <p className="text-sm text-gray-600 font-medium">Authorized Personnel Only</p>
          </div>

          {/* Already Logged In Message */}
          {user && (
            <div className="bg-green-100 border-2 border-green-400 text-green-900 px-4 py-4 rounded-lg text-sm font-semibold mb-8 shadow-md">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-900">Welcome back, {user.name?.split(' ')[0]}!</p>
                  <p className="text-xs mt-2 text-green-800">Redirecting you to the dashboard...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-900 px-4 py-4 rounded-lg text-sm font-bold mb-8 shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-red-800 text-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border-2 border-green-400 text-green-900 px-4 py-4 rounded-lg text-sm font-semibold mb-8 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-900">{success}</p>
                </div>
              </div>
            </div>
          )}



          <form onSubmit={handleMagicLinkLogin} className="space-y-10">
            {/* Email Field */}
            <div className="space-y-4">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="premium-input"
                placeholder="Enter your email address"
              />
            </div>



            {/* Submit Button - Enhanced */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-4 px-6 bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-gray-200 text-gray-900 border-none rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-400 transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-900 font-bold">Sending link...</span>
                  </div>
                ) : (
                  <span className="text-gray-900 font-bold text-lg">Continue</span>
                )}
              </span>
              {!isLoading && (
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>







          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-blue-800 font-medium">
                Secure access protected by enterprise-grade encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Premium Branding */}
      <div className="login-panel-right premium-brand-panel relative">
        <div className="relative z-10 text-center text-white w-full max-w-md">
          {/* Logo and Brand */}
          <div className="mb-8">
            <div className="relative inline-block mb-4">
              <OptimizedLogo size={48} className="h-12 w-12 mx-auto" inverted={true} />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 blur-md"></div>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Quandrox
            </h1>
            <p className="text-lg text-blue-200 font-medium">Financial Tracking Platform</p>
          </div>

          {/* Value Proposition */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Enterprise-Grade Financial Operations
            </h2>
            <p className="text-base text-blue-100 leading-relaxed mb-6">
              Secure, intelligent tracking and management for authorized financial personnel with real-time insights and enterprise security.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">Bank-Grade Security</h3>
                <p className="text-xs text-blue-200">Multi-layer encryption & compliance</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">Real-Time Processing</h3>
                <p className="text-xs text-blue-200">Instant updates & notifications</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white text-sm">Advanced Analytics</h3>
                <p className="text-xs text-blue-200">Intelligent insights & reporting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div> {/* Close login-container */}
    </div>
  );
};

export default Login;
