import { useState } from "react";
import { Button, Input, Divider } from "@nextui-org/react";
import emailValidator from "email-validator";
import { Turnstile } from "@marsidev/react-turnstile";
import { createClient } from "@/utils/supabase/client";
import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";

export default function Auth() {
  const supabase = createClient();
  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showCheckEmail, setShowCheckEmail] = useState(false);
  const [otp, setOtp] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    process.env.NODE_ENV === "development" ? "development" : undefined
  );
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    setEmailLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { captchaToken },
    });

    if (error) {
      alert(error.message);
    } else {
      setShowCheckEmail(true);
      setCaptchaToken(undefined);
    }
    setEmailLoading(false);
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      alert(error.message);
    }
    setOtpLoading(false);
  };

  const handleGitHubLogin = async () => {
    setGithubLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    }
    setGithubLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      alert(error.message);
    }
    setGoogleLoading(false);
  };

  const canSendMagicLink = emailValidator.validate(email) && captchaToken;

  const handleEmailKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canSendMagicLink) {
      handleLogin();
    }
  };

  const canVerifyOtp = otp.length === 6;

  const handleOtpKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canVerifyOtp) {
      handleVerifyOtp();
    }
  };

  if (showCheckEmail) {
    return (
      <div className="flex items-center justify-center px-10 py-10">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Check your email&nbsp;&nbsp;📨</h1>
          <p className="text-sm text-default-500">
            Please click on the magic link we sent to your email to sign in.
          </p>
          <div className="pt-4">
            <p className="text-sm text-default-500 mb-2">
              Or enter the 6-digit code from the email:
            </p>
            <div className="space-y-4">
              <Input
                type="text"
                label="6-digit code"
                value={otp}
                onValueChange={setOtp}
                variant="bordered"
                size="lg"
                maxLength={6}
                pattern="[0-9]*"
                onKeyUp={handleOtpKeyUp}
              />
              <Button
                color="primary"
                isDisabled={!canVerifyOtp}
                isLoading={otpLoading}
                onClick={handleVerifyOtp}
                size="lg"
                className="w-full font-medium"
              >
                Verify code
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-10 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome!</h1>
          <p className="text-sm text-default-500">
            Please enter your email address to receive a magic link to sign in.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="email"
            label="Email address"
            value={email}
            onValueChange={setEmail}
            variant="bordered"
            size="lg"
            onKeyUp={handleEmailKeyUp}
          />
          {process.env.NODE_ENV !== "development" && (
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={setCaptchaToken}
            />
          )}
          <Button
            color="primary"
            isDisabled={!canSendMagicLink}
            isLoading={emailLoading}
            onClick={handleLogin}
            size="lg"
            className="w-full font-medium"
          >
            Send magic link
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Divider className="flex-1" />
          <span className="text-xs text-default-500">or</span>
          <Divider className="flex-1" />
        </div>

        <div className="space-y-4">
          <Button
            startContent={<GoogleOutlined style={{ fontSize: "1.25rem" }} />}
            variant="bordered"
            size="lg"
            className="w-full font-medium"
            onClick={handleGoogleLogin}
            isLoading={googleLoading}
          >
            Continue with Google
          </Button>
          <Button
            startContent={<GithubOutlined style={{ fontSize: "1.25rem" }} />}
            variant="bordered"
            size="lg"
            className="w-full font-medium"
            onClick={handleGitHubLogin}
            isLoading={githubLoading}
          >
            Continue with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
