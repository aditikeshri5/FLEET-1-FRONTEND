import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'password' | 'otp'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 👁️ NEW
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // 🔐 PASSWORD LOGIN
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(phone, password);
      const role = localStorage.getItem('user_role');
      if (role) navigate(`/${role}`);
    } catch {
      setError('Invalid phone or password');
    } finally {
      setIsLoading(false);
    }
  };

  // 📱 SEND OTP
  const handleSendOtp = async () => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          { size: 'invisible' }
        );
      }

      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        '+91' + phone,
        appVerifier
      );

      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP');
    }
  };

  // ✅ VERIFY OTP
  const handleVerifyOtp = async () => {
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log('Logged in:', result.user.phoneNumber);

      navigate('/manufacturer');
    } catch {
      setError('Invalid OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-[Inter]">

      {/* HEADER */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-4xl font-extrabold tracking-wider">
          <span className="text-[#1B2A4A]">FLEET</span>
          <span className="text-[#D97706]">1</span>
        </h2>

        <p className="mt-3 text-sm text-gray-500 tracking-wide">
          Logistics Aggregator ERP
        </p>
      </div>

      {/* CARD */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-2xl sm:px-10 border border-gray-100">

          {/* TOGGLE */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setLoginType('password')}
              className={`flex-1 py-2 rounded-md text-sm ${
                loginType === 'password'
                  ? 'bg-white shadow font-medium'
                  : 'text-gray-500'
              }`}
            >
              Password Login
            </button>

            <button
              onClick={() => setLoginType('otp')}
              className={`flex-1 py-2 rounded-md text-sm ${
                loginType === 'otp'
                  ? 'bg-white shadow font-medium'
                  : 'text-gray-500'
              }`}
            >
              OTP Login
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* PHONE */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600">Phone</label>

            <div className="group mt-1 flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#D97706]">
              <Phone className="text-[#1B2A4A] group-focus-within:text-[#D97706]" size={18} />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 outline-none bg-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* PASSWORD LOGIN */}
          {loginType === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">

              <div>
                <label className="text-sm font-medium text-gray-600">Password</label>

                <div className="group mt-1 flex items-center border border-gray-300 rounded-lg px-3 focus-within:ring-2 focus-within:ring-[#D97706]">
                  <Lock
                    className="text-[#1B2A4A] group-focus-within:text-[#D97706]"
                    size={18}
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 outline-none bg-transparent"
                    placeholder="Enter password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-[#D97706]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="text-right mt-1">
                  <span className="text-sm text-[#D97706] cursor-pointer hover:underline">
                    Forgot Password?
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-[#D97706] text-white rounded-lg hover:bg-[#c46a05] disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* OTP LOGIN */}
          {loginType === 'otp' && (
            <div className="space-y-4">

              {!otpSent ? (
                <button
                  onClick={handleSendOtp}
                  className="w-full py-2 bg-[#D97706] text-white rounded-lg"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border p-2 rounded-lg"
                  />

                  <button
                    onClick={handleVerifyOtp}
                    className="w-full py-2 bg-[#D97706] text-white rounded-lg"
                  >
                    Verify OTP
                  </button>
                </>
              )}

              <div id="recaptcha-container"></div>
            </div>
          )}

          {/* SIGNUP */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#D97706] font-semibold">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;