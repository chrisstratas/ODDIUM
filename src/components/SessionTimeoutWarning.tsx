import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionManager } from '@/lib/security';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const { signOut, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkSession = () => {
      if (SessionManager.isSessionExpired()) {
        signOut();
        return;
      }

      const shouldWarn = SessionManager.shouldShowWarning();
      setShowWarning(shouldWarn);

      if (shouldWarn) {
        const expiry = SessionManager.getSessionExpiry();
        const remaining = Math.max(0, expiry - Date.now());
        setTimeLeft(Math.ceil(remaining / 1000));
      }
    };

    // Check immediately
    checkSession();

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, [user, signOut]);

  const handleExtendSession = () => {
    SessionManager.updateSessionExpiry();
    setShowWarning(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle>Session Expiring Soon</CardTitle>
          <CardDescription>
            Your session will expire in {formatTime(timeLeft)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Would you like to extend your session or sign out?
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="flex-1"
            >
              Sign Out
            </Button>
            <Button
              onClick={handleExtendSession}
              className="flex-1"
            >
              Extend Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}