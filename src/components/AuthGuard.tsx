import { useAuth } from '@/contexts/AuthContext';
import SportsbookOnboarding from '@/components/SportsbookOnboarding';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, hasAccess, loading, needsOnboarding, completeOnboarding } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">Premium Access Required</CardTitle>
            <CardDescription>
              You need a valid access code to use this platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please enter your premium access code to continue using Sports Analytics Pro.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
            >
              Enter Access Code
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsOnboarding) {
    return <SportsbookOnboarding onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
}