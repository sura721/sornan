import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import loginBg from '@/assets/public.avif';
import { Loader2, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login } = useData();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Inside your Login component (where you had the original handleLogin)

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Assuming 'login' in useData calls your 'loginUserApi' and may return either
    // a boolean true on success or an object containing a token.
    const response = await login(username, password) as unknown;

    // If the login returned an object with a token, persist it
    if (response && typeof response === "object" && "token" in (response as Record<string, unknown>)) {
      const token = (response as any).token;
      if (typeof token === "string") {
        localStorage.setItem("authToken", token);
      }
      // On successful login and token storage, navigate
      navigate("/");
    } else if (response === true) {
      // Legacy boolean success; navigate without token
      navigate("/");
    } else {
      // Login failed (message handled by `login` utility)
      setIsLoading(false);
    }
  } catch (error) {
    // Handle any network/API errors that 'login' didn't already catch
    setIsLoading(false);
    toast({
      title: "Login Failed",
      description: "Could not connect to the server or process credentials.",
      variant: "destructive"
    });
  }
};
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
<Card className="w-full max-w-sm border border-white/20 bg-white/10 backdrop-blur-md shadow-lg mt-32">        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif text-primary">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                // Prevent iOS from auto-capitalizing or autocorrecting the username
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="username"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // Prevent iOS from trying to correct or auto-capitalize passwords
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="current-password"
                required
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-7 w-7"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button type="submit" className="w-full bg-gradient-primary shadow-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;