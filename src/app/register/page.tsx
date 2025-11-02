
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Building } from 'lucide-react';

export default function RegisterPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-accent tracking-wider">Choose Your Path</h1>
            <p className="text-muted-foreground mt-2">How will you join the Level Up Fitness universe?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card border-accent/20 shadow-lg shadow-accent/10 flex flex-col">
                <CardHeader className="text-center items-center">
                    <div className="p-4 bg-accent/10 rounded-full mb-4">
                        <User className="h-10 w-10 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">Register as a User</CardTitle>
                    <CardDescription>Join a gym, track your workouts, and level up your fitness journey.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                        <li>Track daily progress</li>
                        <li>Earn points and rewards</li>
                        <li>Chat with an AI coach</li>
                        <li>Compete on leaderboards</li>
                    </ul>
                </CardContent>
                 <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/register/user">Become a Hunter</Link>
                    </Button>
                </div>
            </Card>
             <Card className="bg-card border-accent/20 shadow-lg shadow-accent/10 flex flex-col">
                <CardHeader className="text-center items-center">
                    <div className="p-4 bg-accent/10 rounded-full mb-4">
                        <Building className="h-10 w-10 text-accent" />
                    </div>
                    <CardTitle className="text-2xl">Register as a Gym Owner</CardTitle>
                    <CardDescription>List your gym, manage your members, and grow your community.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                     <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
                        <li>Register your gym on the platform</li>
                        <li>View your member list</li>
                        <li>Access a dedicated gym dashboard</li>
                        <li>Grow your business</li>
                    </ul>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/register/gym-owner">Register Your Gym</Link>
                    </Button>
                </div>
            </Card>
        </div>
        <div className="text-center mt-8">
             <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-accent hover:underline">
                Login here
                </Link>
            </p>
        </div>
      </div>
    </main>
  );
}
