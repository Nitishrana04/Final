
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Textarea } from '../ui/textarea';


const formSchema = z.object({
  username: z.string().min(3, { message: 'Owner name must be at least 3 characters.' }),
  gymName: z.string().min(3, { message: 'Gym name must be at least 3 characters.' }),
  address: z.string().min(10, { message: 'Please enter a full address.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export function GymOwnerRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      gymName: '',
      address: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const batch = writeBatch(db);

      // 1. Create the user document
      const userDocRef = doc(db, "users", user.uid);
      batch.set(userDocRef, {
        uid: user.uid,
        username: values.username,
        email: values.email,
        level: 1,
        points: 0,
        streak: 0,
        goal: "Manage Gym",
        createdAt: serverTimestamp(),
        role: 'gym-owner',
        subscription: "gym-free", // Gym owners start with a free plan
        gymId: user.uid, // The gym's ID will be the owner's UID
      });

      // 2. Create the gym document
      const gymDocRef = doc(db, "gyms", user.uid);
      batch.set(gymDocRef, {
          name: values.gymName,
          ownerId: user.uid,
          address: values.address,
          createdAt: serverTimestamp(),
      });

      // 3. Commit the atomic batch
      await batch.commit();
      
      toast({
          title: "Registration Successful",
          description: "Your gym owner account has been created. Please log in.",
      });
      router.push('/login');

    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An unknown error occurred during registration.";
      if (error.code) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "This email address is already in use.";
                break;
            case 'auth/weak-password':
                errorMessage = "The password is too weak. It must be at least 8 characters.";
                break;
            case 'permission-denied':
                errorMessage = "You don't have permission to perform this action. Check Firestore rules."
                break;
            default:
                 errorMessage = `An unexpected error occurred: ${error.message}`;
        }
      }
      toast({
          variant: "destructive",
          title: "Registration Failed",
          description: errorMessage,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Thomas Andre" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="gymName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Scavenger Gym" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gym Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter the full address of your gym" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Email</FormLabel>
              <FormControl>
                <Input placeholder="owner@gym.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********" 
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Create Gym and Register'}
        </Button>
      </form>
    </Form>
  );
}
