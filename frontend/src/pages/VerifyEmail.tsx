import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from location state or localStorage
    const stateEmail = (location.state as any)?.email;
    const storedUser = localStorage.getItem("user") || localStorage.getItem("auth_user");
    
    if (stateEmail) {
      setEmail(stateEmail);
    } else if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.email) {
          setEmail(user.email);
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    // If no email found, redirect to register
    if (!stateEmail && !storedUser) {
      navigate("/register");
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setVerified(true);
      // Update user in localStorage to mark as verified
      const storedUser = localStorage.getItem("user") || localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          user.emailVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("auth_user", JSON.stringify(user));
        } catch (e) {
          console.error("Failed to update user in localStorage:", e);
        }
      }

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError(null);
    setResendLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setCountdown(60); // 60 second countdown
      setError(null);
      alert("OTP has been resent to your email");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">Your email has been successfully verified. Redirecting...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit verification code to
            <br />
            <span className="font-semibold text-gray-900">{email || "your email"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Enter Verification Code</label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                className="w-full"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend OTP (${countdown}s)`
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend OTP
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/register")}
                className="text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;

