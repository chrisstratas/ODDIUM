import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { passwordSchema, emailSchema, accessCodeSchema, sanitizeInput, rateLimiter, securityLogger } from '@/lib/security';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isRateLimited, setIsRateLimited] = useState(false);
  const { signUp, signIn, submitAccessCode, user, hasAccess } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for rate limiting on component mount
  useEffect(() => {
    const identifier = localStorage.getItem('auth_identifier') || 'anonymous';
    setIsRateLimited(rateLimiter.isRateLimited(identifier, 5, 15 * 60 * 1000));
  }, []);

  const validateForm = (type: 'signin' | 'signup' | 'accesscode') => {
    const errors: Record<string, string> = {};
    
    if (type !== 'accesscode') {
      try {
        emailSchema.parse(email);
      } catch (e: any) {
        errors.email = e.errors[0]?.message || 'Invalid email';
      }
      
      if (type === 'signup') {
        try {
          passwordSchema.parse(password);
        } catch (e: any) {
          errors.password = e.errors[0]?.message || 'Password does not meet requirements';
        }
      } else if (!password) {
        errors.password = 'Password is required';
      }
    } else {
      try {
        accessCodeSchema.parse(accessCode);
      } catch (e: any) {
        errors.accessCode = e.errors[0]?.message || 'Invalid access code format';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRateLimit = (identifier: string) => {
    if (rateLimiter.isRateLimited(identifier)) {
      setIsRateLimited(true);
      setError('Too many attempts. Please wait 15 minutes before trying again.');
      return true;
    }
    return false;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    const identifier = sanitizeInput(email) || 'anonymous';
    localStorage.setItem('auth_identifier', identifier);
    
    if (handleRateLimit(identifier)) {
      setLoading(false);
      return;
    }
    
    if (!validateForm('signup')) {
      setLoading(false);
      return;
    }
    
    securityLogger.log({
      type: 'auth_attempt',
      email: sanitizeInput(email),
      details: { action: 'signup' }
    });
    
    const { error } = await signUp(sanitizeInput(email), password);
    
    if (error) {
      setError(error.message);
      securityLogger.log({
        type: 'auth_failure',
        email: sanitizeInput(email),
        details: { action: 'signup', error: error.message }
      });
    } else {
      securityLogger.log({
        type: 'auth_success',
        email: sanitizeInput(email),
        details: { action: 'signup' }
      });
      rateLimiter.reset(identifier);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    const identifier = sanitizeInput(email) || 'anonymous';
    localStorage.setItem('auth_identifier', identifier);
    
    if (handleRateLimit(identifier)) {
      setLoading(false);
      return;
    }
    
    if (!validateForm('signin')) {
      setLoading(false);
      return;
    }
    
    securityLogger.log({
      type: 'auth_attempt',
      email: sanitizeInput(email),
      details: { action: 'signin' }
    });
    
    const { error } = await signIn(sanitizeInput(email), password);
    
    if (error) {
      setError(error.message);
      securityLogger.log({
        type: 'auth_failure',
        email: sanitizeInput(email),
        details: { action: 'signin', error: error.message }
      });
    } else {
      securityLogger.log({
        type: 'auth_success',
        email: sanitizeInput(email),
        details: { action: 'signin' }
      });
      rateLimiter.reset(identifier);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    }
    
    setLoading(false);
  };

  const handleAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});
    
    const identifier = user?.email || 'anonymous';
    
    if (handleRateLimit(identifier)) {
      setLoading(false);
      return;
    }
    
    if (!validateForm('accesscode')) {
      setLoading(false);
      return;
    }
    
    securityLogger.log({
      type: 'access_code_attempt',
      userId: user?.id,
      email: user?.email,
      details: { code: sanitizeInput(accessCode) }
    });
    
    const { error } = await submitAccessCode(sanitizeInput(accessCode));
    
    if (error) {
      setError(error.message);
      securityLogger.log({
        type: 'auth_failure',
        userId: user?.id,
        email: user?.email,
        details: { action: 'access_code', error: error.message }
      });
    } else {
      securityLogger.log({
        type: 'auth_success',
        userId: user?.id,
        email: user?.email,
        details: { action: 'access_code' }
      });
      rateLimiter.reset(identifier);
      toast({
        title: "Access granted!",
        description: "You now have premium access to the platform.",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  // If user is logged in and has access, redirect to home
  if (user && hasAccess) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sports Analytics Pro</CardTitle>
          <CardDescription>
            {!user ? 'Sign in or create an account to continue' : 'Enter your access code to unlock premium features'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!user ? (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signin-email">Email</Label>
                     <Input
                       id="signin-email"
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className={validationErrors.email ? 'border-destructive' : ''}
                       required
                     />
                     {validationErrors.email && (
                       <p className="text-sm text-destructive">{validationErrors.email}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signin-password">Password</Label>
                     <Input
                       id="signin-password"
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className={validationErrors.password ? 'border-destructive' : ''}
                       required
                     />
                     {validationErrors.password && (
                       <p className="text-sm text-destructive">{validationErrors.password}</p>
                     )}
                   </div>
                   <Button type="submit" className="w-full" disabled={loading || isRateLimited}>
                     {loading ? 'Signing in...' : 'Sign In'}
                   </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                   <div className="space-y-2">
                     <Label htmlFor="signup-email">Email</Label>
                     <Input
                       id="signup-email"
                       type="email"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className={validationErrors.email ? 'border-destructive' : ''}
                       required
                     />
                     {validationErrors.email && (
                       <p className="text-sm text-destructive">{validationErrors.email}</p>
                     )}
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="signup-password">Password</Label>
                     <Input
                       id="signup-password"
                       type="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className={validationErrors.password ? 'border-destructive' : ''}
                       required
                     />
                     {validationErrors.password && (
                       <p className="text-sm text-destructive">{validationErrors.password}</p>
                     )}
                     <PasswordStrengthIndicator password={password} className="mt-2" />
                   </div>
                   <Button type="submit" className="w-full" disabled={loading || isRateLimited}>
                     {loading ? 'Creating account...' : 'Create Account'}
                   </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleAccessCode} className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="access-code">Premium Access Code</Label>
                 <Input
                   id="access-code"
                   type="text"
                   value={accessCode}
                   onChange={(e) => setAccessCode(sanitizeInput(e.target.value.toUpperCase()))}
                   placeholder="Enter your access code"
                   className={validationErrors.accessCode ? 'border-destructive' : ''}
                   required
                 />
                 {validationErrors.accessCode && (
                   <p className="text-sm text-destructive">{validationErrors.accessCode}</p>
                 )}
               </div>
               <Button type="submit" className="w-full" disabled={loading || isRateLimited}>
                 {loading ? 'Verifying...' : 'Submit Access Code'}
               </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}