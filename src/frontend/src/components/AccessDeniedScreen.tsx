import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home } from 'lucide-react';

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-destructive">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
          <p className="text-muted-foreground">
            You do not have permission to access this page. This area is restricted to administrators only.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate({ to: '/' })}
            className="w-full gap-2"
            size="lg"
          >
            <Home className="w-5 h-5" />
            Return to Home
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            If you believe you should have access, please contact the system administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
