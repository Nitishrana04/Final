import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-accent/20 shadow-lg shadow-accent/10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-accent tracking-wider">Level Up Fitness</CardTitle>
          <CardDescription>Login to your Hunter account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-accent hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
