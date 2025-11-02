
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

type Gym = {
  id: string;
  name: string;
};

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  gymId: z.string({ required_error: "Please select a gym."}),
});

export function UserRegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingGyms, setIsFetchingGyms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [gyms, setGyms] = useState<Gym[]>([]);
  

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    async function fetchGyms() {
        setIsFetchingGyms(true);
        const gymsCollection = collection(db, 'gyms');
        
        getDocs(gymsCollection).then(gymSnapshot => {
            const gymsList = gymSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name } as Gym));
            setGyms(gymsList);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
              path: gymsCollection.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setGyms([]);
        }).finally(() => {
            setIsFetchingGyms(false);
        });
    }
    fetchGyms();
  }, []);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Create the user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: values.username,
        email: values.email,
        level: 1,
        points: 0,
        streak: 0,
        goal: "Not Set",
        createdAt: serverTimestamp(),
        role: 'user',
        subscription: "bronze",
        gymId: values.gymId,
      });
      
      toast({
          title: "Registration Successful",
          description: "Your account has been created. Please log in.",
      });
      router.push('/login');

    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An unknown error occurred during registration.";
      
      // Handle Auth errors
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak.";
      }
      
      // Handle potential Firestore errors (though less common with `setDoc` if rules are permissive for creation)
      if (error.name === 'FirebaseError') {
          errorMessage = "Could not save user data to database. Please try again."
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
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="e.g. SungJinWoo" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="hunter@email.com" {...field} />
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
        <FormField
            control={form.control}
            name="gymId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Select Your Gym</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFetchingGyms}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={isFetchingGyms ? "Loading gyms..." : "Select a gym"} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {gyms.map(gym => (
                                <SelectItem key={gym.id} value={gym.id}>{gym.name}</SelectItem>
                            ))}
                            {!isFetchingGyms && gyms.length === 0 && <p className="p-2 text-sm text-muted-foreground">No gyms available.</p>}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : 'Register'}
        </Button>
      </form>
    </Form>
  );
}
