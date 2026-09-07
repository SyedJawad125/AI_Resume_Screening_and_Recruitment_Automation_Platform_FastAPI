'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ArrowLeft, Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, Key, Sparkles } from 'lucide-react';

const ChangePassword = () => {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    if (strength < 40) return { strength, label: 'Weak', color: 'from-red-500 to-red-600' };
    if (strength < 70) return { strength, label: 'Medium', color: 'from-amber-500 to-amber-600' };
    return { strength, label: 'Strong', color: 'from-emerald-500 to-emerald-600' };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const payload = {
      old_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };

    try {
      const response = await AxiosInstance.post('/api/user/v1/reset/password/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setSuccess('Password changed successfully! Redirecting...');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        setTimeout(() => {
          router.push('/admindashboard');
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleback = () => {
    router.push("/admindashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-xl relative z-10">
        {/* Back Button */}
        <button
          onClick={handleback}
          className="group flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-all duration-200 hover:gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center group-hover:bg-slate-700/50 transition-all group-hover:scale-110">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          {/* Header Section */}
          <div className="relative p-8 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                  Change Password
                </h2>
                <p className="text-slate-400 text-sm">Update your account security credentials</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Alert Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400 font-medium text-sm">Error</p>
                  <p className="text-red-300/80 text-sm mt-0.5">{error}</p>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-bounce-soft">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-emerald-400 font-medium text-sm">Success</p>
                  <p className="text-emerald-300/80 text-sm mt-0.5">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-400" />
                  Current Password
                </label>
                <div className="relative group">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3.5 bg-slate-800/50 text-white border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 pr-12 group-hover:border-slate-600/60"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" />
                  New Password
                </label>
                <div className="relative group">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3.5 bg-slate-800/50 text-white border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all placeholder:text-slate-500 pr-12 group-hover:border-slate-600/60"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Password Strength</span>
                      <span className={`font-semibold bg-gradient-to-r ${passwordStrength.color} bg-clip-text text-transparent`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                      <div
                        className={`h-full bg-gradient-to-r ${passwordStrength.color} transition-all duration-500 rounded-full`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  Confirm New Password
                </label>
                <div className="relative group">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3.5 bg-slate-800/50 text-white border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all placeholder:text-slate-500 pr-12 group-hover:border-slate-600/60"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-400 text-xs flex items-center gap-1.5 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Password Requirements
                </p>
                <ul className="space-y-2 text-xs text-slate-400">
                  <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center gap-2 ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    Mix of uppercase & lowercase letters
                  </li>
                  <li className={`flex items-center gap-2 ${/\d/.test(newPassword) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(newPassword) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    At least one number
                  </li>
                  <li className={`flex items-center gap-2 ${/[^a-zA-Z0-9]/.test(newPassword) ? 'text-emerald-400' : ''}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                    At least one special character
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 text-white font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Your password is encrypted and secure
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-bounce-soft {
          animation: bounce-soft 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ChangePassword;