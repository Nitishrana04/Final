
import { UserRegisterForm } from '@/components/auth/user-register-form';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function UserRegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-accent/20 shadow-lg shadow-accent/10 relative">
        <Button variant="ghost" size="icon" className="absolute top-4 left-4" asChild>
            <Link href="/register">
                <ArrowLeft />
            </Link>
        </Button>
        <CardHeader className="text-center pt-12">
          <CardTitle className="text-3xl font-bold text-accent tracking-wider">User Registration</CardTitle>
          <CardDescription>Join the ranks of elite Hunters</CardDescription>
        </CardHeader>
        <CardContent>
          <UserRegisterForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
