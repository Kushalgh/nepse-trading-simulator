"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  const { signup } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(username, email, password);
      if (result.twoFactorSecret) {
        setTwoFactorSecret(result.twoFactorSecret);
        setShowTwoFactorSetup(true);
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
          variant: "success",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    toast({
      title: "Account created",
      description: "Your account has been created successfully!",
      variant: "success",
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>

        {!showTwoFactorSetup ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Login
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">
                Two-Factor Authentication Setup
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app to set up
                two-factor authentication.
              </p>
              <div className="mb-4 flex justify-center">
                <img
                  src={`https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/StockTraderPro:${email}?secret=${twoFactorSecret}&issuer=StockTraderPro`}
                  alt="QR Code for 2FA"
                  className="h-48 w-48"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretKey">
                  Secret Key (if you can't scan the QR code)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input id="secretKey" value={twoFactorSecret} readOnly />
                </div>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
