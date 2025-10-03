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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);  
    
   
    const success = await login(username, password);

    if (success) {
      // On successful login, the server sets the cookie,
      // so we can navigate to the home page.
      navigate("/");
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect username or password. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      <Card className="w-full max-w-sm shadow-elegant bg-card/80 backdrop-blur-sm mt-32">
        <CardHeader>
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