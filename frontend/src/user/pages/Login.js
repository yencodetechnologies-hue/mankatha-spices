import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../api/authApi';
import MankathaBanner from '../../components/Brand/MankathaBanner';
import MankathaLoader from '../../components/Brand/MankathaLoader';

function isSafeCustomerReturnPath(path) {
  if (path == null || !String(path).startsWith('/')) return false;
  const p = String(path);
  if (p.startsWith('/adminpanel')) return false;
  if (p.startsWith('/vendor')) return false;
  if (p.startsWith('/biller')) return false;
  return true;
}

function redirectByRole(navigate, nextUser, fromPath) {
  if (nextUser.role === 'admin') {
    navigate('/adminpanel/overview', { replace: true });
    return;
  }
  if (nextUser.role === 'vendor') {
    navigate('/vendor/dashboard', { replace: true });
    return;
  }
  if (nextUser.role === 'biller') {
    navigate('/biller/dashboard', { replace: true });
    return;
  }
  navigate(isSafeCustomerReturnPath(fromPath) ? fromPath : '/', { replace: true });
}

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  // Forgot Password States
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email/Phone, 2: OTP, 3: New Password
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');

  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [showResetPasswordEye, setShowResetPasswordEye] = useState(false);
  
  const { loginWithSession, isAuthenticated, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = location.state?.from;

  useEffect(() => {
    if (!isForgotPassword || forgotStep !== 2 || forgotCountdown <= 0) return;
    const timer = setInterval(() => {
      setForgotCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isForgotPassword, forgotStep, forgotCountdown]);

  const handleForgotSubmitEmail = async (e) => {
    e.preventDefault();
    if (!forgotEmailOrPhone) {
      setForgotError('Please enter your email address or phone number.');
      return;
    }
    setForgotError('');
    setIsLoading(true);

    try {
      await authApi.forgotSendOtp({ emailOrPhone: forgotEmailOrPhone });
      setForgotStep(2);
      setForgotCountdown(60);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send reset code. Please try again.';
      setForgotError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setIsLoading(true);

    try {
      await authApi.forgotVerifyOtp({
        emailOrPhone: forgotEmailOrPhone,
        otp: forgotOtp,
      });
      setForgotStep(3);
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid verification code. Please try again.';
      setForgotError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotError('');
    setIsLoading(true);

    try {
      await authApi.resetPassword({
        emailOrPhone: forgotEmailOrPhone,
        otp: forgotOtp,
        password: forgotNewPassword,
      });
      setForgotSuccess('Your password has been reset successfully! Redirecting you to sign in...');
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotStep(1);
        setForgotEmailOrPhone('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotSuccess('');
      }, 3000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password. Please try again.';
      setForgotError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotResendOtp = async () => {
    setForgotError('');
    try {
      await authApi.forgotSendOtp({ emailOrPhone: forgotEmailOrPhone });
      setForgotCountdown(60);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to resend reset code. Please try again.';
      setForgotError(msg);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;
    redirectByRole(navigate, user, fromPath);
  }, [authLoading, isAuthenticated, user, navigate, fromPath]);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return undefined;

    const scriptId = 'google-identity-services-script';
    let script = document.getElementById(scriptId);

    const initGoogle = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          if (!response?.credential) return;
          try {
            const { token, user: nextUser } = await authApi.googleLogin(response.credential);
            loginWithSession(token, nextUser);
            redirectByRole(navigate, nextUser, fromPath);
          } catch (error) {
            setErrors({
              general: error.response?.data?.message || 'Google sign-in failed. Try email/password login.',
            });
          }
        },
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }

    return undefined;
  }, [loginWithSession, navigate, fromPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const password = formData.password;
      const { token, user: nextUser } = await authApi.login(email, password);
      loginWithSession(token, nextUser, rememberMe);
      redirectByRole(navigate, nextUser, fromPath);
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Invalid email or password. Check your details or sign up.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <MankathaLoader fullScreen message="Checking your session…" />;
  }

  if (isAuthenticated && user) {
    return <MankathaLoader fullScreen message="Redirecting…" />;
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl"></div>
        </div>
        <div className="z-10 max-w-md w-full space-y-8 backdrop-blur-xl bg-white/80 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
          <div>
            <div className="flex justify-center mb-4">
              <MankathaBanner variant="strip" className="w-full max-w-[280px] shadow-sm border border-primary-100" />
            </div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Reset Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {forgotStep === 1 && "Enter your registered email or phone to get an OTP verification code."}
              {forgotStep === 2 && "Enter the 6-digit OTP code sent to your phone/email."}
              {forgotStep === 3 && "Create a secure new password for your account."}
            </p>
          </div>



          {forgotError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {forgotError}
            </div>
          )}

          {forgotSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              {forgotSuccess}
            </div>
          )}

          {forgotStep === 1 && (
            <form className="mt-8 space-y-6" onSubmit={handleForgotSubmitEmail}>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address or Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="forgot-email"
                    type="text"
                    required
                    value={forgotEmailOrPhone}
                    onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter email or phone number"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors uppercase tracking-wider animate-pulseFast"
              >
                {isLoading ? "Sending OTP..." : "Send Verification OTP"}
              </button>
            </form>
          )}

          {forgotStep === 2 && (
            <form className="mt-8 space-y-6" onSubmit={handleForgotVerifyOtp}>
              <div>
                <label htmlFor="forgot-otp" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Enter 6-Digit Verification OTP
                </label>
                <input
                  id="forgot-otp"
                  type="text"
                  maxLength={6}
                  required
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                  className="block w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50/50"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={forgotOtp.length !== 6}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors uppercase tracking-wider"
              >
                Verify Reset OTP
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Didn't receive code?</span>
                {forgotCountdown > 0 ? (
                  <span>Resend in {forgotCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleForgotResendOtp}
                    className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {forgotStep === 3 && (
            <form className="mt-8 space-y-6" onSubmit={handleForgotResetPassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type={showResetPasswordEye ? "text" : "password"}
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showResetPasswordEye ? "text" : "password"}
                    required
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                    placeholder="Re-enter password"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="show-forgot-pass"
                    type="checkbox"
                    checked={showResetPasswordEye}
                    onChange={() => setShowResetPasswordEye(!showResetPasswordEye)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="show-forgot-pass" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                    Show Passwords
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-500 hover:bg-primary-600 transition-colors uppercase tracking-wider"
              >
                {isLoading ? "Resetting..." : "Confirm & Save Password"}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setForgotStep(1);
                setForgotError('');
              }}
              className="text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-200/30 blur-3xl"></div>
      </div>
      <div className="z-10 max-w-md w-full space-y-8 backdrop-blur-xl bg-white/80 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <div>
          <div className="flex justify-center mb-4">
            <MankathaBanner variant="strip" className="w-full max-w-[280px] shadow-sm border border-primary-100" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to Mankatha Spices
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

      
        </form>
      </div>
    </div>
  );
};

export default Login;


