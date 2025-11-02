
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/hooks/use-user';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, User, Mail } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  gymName: z.string().min(3, 'Gym name must be at least 3 characters.'),
  address: z.string().min(10, 'Please enter a full address.'),
});

type FormData = z.infer<typeof formSchema>;

export default function GymProfilePage() {
  const { user, profile, gym, loading: userLoading } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gymName: '',
      address: '',
    },
  });

  useEffect(() => {
    if (gym) {
      form.reset({
        gymName: gym.name,
        address: (gym as any).address || '',
      });
    }
  }, [gym, form]);

  const onSubmit = async (data: FormData) => {
    if (!user || !gym) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in as a gym owner.',
      });
      return;
    }

    setIsSaving(true);
    const gymDocRef = doc(db, 'gyms', gym.id);
    const dataToUpdate = { name: data.gymName, address: data.address };

    updateDoc(gymDocRef, dataToUpdate)
      .then(() => {
        toast({
          title: 'Success!',
          description: 'Your gym profile has been updated.',
        });
        form.reset(data); // Resets the dirty state
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: gymDocRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsSaving(false);
      });
  };
  
  const hasChanges = form.formState.isDirty;

  return (
    <div className="space-y-8">
       <header>
            <h1 className="text-4xl font-bold tracking-tighter text-accent flex items-center gap-2"><Settings /> Gym Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your gym's public information.</p>
        </header>

      <Card>
        <CardHeader>
          <CardTitle>Gym Information</CardTitle>
          <CardDescription>Update your gym's details. Owner information is fixed.</CardDescription>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin h-8 w-8" />
            </div>
          ) : (
            <div className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Owner Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Owner Name</Label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                               <User className="mr-2 h-4 w-4 text-muted-foreground" />
                               {profile?.username}
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Owner Email</Label>
                             <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                               <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                               {profile?.email}
                            </div>
                        </div>
                    </div>
                </div>
                
                <Separator />

                <div>
                    <h3 className="text-lg font-medium">Editable Details</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        <FormField
                          control={form.control}
                          name="gymName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gym Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Your Gym's Name" />
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
                                <Textarea {...field} placeholder="123 Fitness Lane, Muscle City" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" disabled={isSaving || !hasChanges}>
                          {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                        </Button>
                      </form>
                    </Form>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
