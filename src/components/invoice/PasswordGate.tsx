import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface PasswordGateProps {
  onAuthenticate: () => void;
}

// Simple password for admin access - in production, use proper auth
const ADMIN_PASSWORD = 'admin123';

export function PasswordGate({ onAuthenticate }: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      // Store auth in session
      sessionStorage.setItem('invoice_auth', 'true');
      onAuthenticate();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Invoice Generator Access</CardTitle>
          <CardDescription>
            Enter the admin password to access the invoice generator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full">
              Access Invoice Generator
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
