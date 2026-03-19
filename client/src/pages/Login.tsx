import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { labels } from "@/lib/labels";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await signIn(username, password);

    if (result.error) {
      setError("Invalid username or password. Please check your credentials and try again.");
    } else {
      navigate("/dashboard");
    }

    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/50 px-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="pb-2 pt-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">EmployeeConnect</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enterprise Employee Management System
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">{labels.auth.welcome}</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to your admin account to continue
            </p>
          </div>

          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{labels.auth.username}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{labels.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 pr-10 h-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="cursor-pointer text-sm text-muted-foreground">
                Remember me for 30 days
              </label>
            </div>

            <Button type="submit" className="w-full h-11" size="lg" disabled={submitting}>
              {submitting ? "Signing in..." : labels.auth.signIn}
              {!submitting ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>© 2026 EmployeeConnect. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}