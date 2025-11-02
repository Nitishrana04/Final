
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  gymName: z.string().min(3, { message: 'Gym name must be at least 3 characters.' }),
});

export default function CreateGymPage() {
  const { user, profile } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gymName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !profile || profile.role !== 'gym-owner') {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You are not authorized to create a gym.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const gymDocRef = doc(db, 'gyms', user.uid);
      await setDoc(gymDocRef, {
        name: values.gymName,
        ownerId: user.uid,
      });

      // Also update the user's profile to link to the gym
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { gymId: user.uid }, { merge: true });

      toast({
        title: 'Gym Created!',
        description: `Your gym "${values.gymName}" has been successfully registered.`,
      });

      router.push('/gym-owner/dashboard');
    } catch (error) {
      console.error('Error creating gym:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Create Gym',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Your Gym</CardTitle>
          <CardDescription>
            Welcome, Gym Owner! Let's get your gym registered on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="gymName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gym Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Monarch's Fitness Palace" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Gym'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
