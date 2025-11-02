
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Gem, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/use-user'; // Import the hook
import type { UserProfile } from '@/hooks/use-user';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function ProfilePage() {
    const { user, profile: initialProfile, loading, getClassFromLevel } = useUser(); // Use the hook
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const [userClass, setUserClass] = useState('N/A');

    const goalIsSet = initialProfile?.goal && initialProfile.goal !== 'Not Set';

    useEffect(() => {
        if (initialProfile) {
            setProfile(initialProfile);
            setUserClass(getClassFromLevel(initialProfile.level));
        }
    }, [initialProfile, getClassFromLevel]);


    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (profile) {
            setProfile({ ...profile, [e.target.id]: e.target.value });
        }
    };

    const handleGoalChange = (value: string) => {
        if (profile) {
            setProfile({ ...profile, goal: value });
        }
    }

    const handleSaveChanges = async () => {
        if (!user || !profile) return;
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const dataToSave: { username: string; goal?: string } = {
                username: profile.username,
            };

            if (!goalIsSet && profile.goal && profile.goal !== 'Not Set') {
                dataToSave.goal = profile.goal;
            }

            await setDoc(userDocRef, dataToSave, { merge: true });
            toast({
                title: 'Success!',
                description: 'Your profile has been updated.',
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update your profile.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const getSubscriptionBadgeVariant = (subscription?: string) => {
        switch (subscription) {
            case 'gold': return {className: "bg-yellow-400/20 text-yellow-300 border-yellow-400/50"};
            case 'silver': return {className: "bg-slate-400/20 text-slate-300 border-slate-400/50"};
            default: return {variant: 'outline' as const};
        }
    }

    if (loading && !profile) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    // Check if there are changes to be saved
    const canSaveChanges = initialProfile?.username !== profile?.username || (!goalIsSet && profile?.goal !== 'Not Set' && profile?.goal !== initialProfile?.goal);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tighter text-accent">Your Profile</h1>
                <p className="text-muted-foreground mt-2">Manage your account and fitness stats.</p>
            </header>
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your details here.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} alt="User Avatar" data-ai-hint="warrior avatar" />
                            <AvatarFallback>{profile?.username?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                     <div className="space-y-2">
                        <Label>Subscription Plan</Label>
                        <div className="flex items-center gap-4">
                             <Badge {...getSubscriptionBadgeVariant(profile?.subscription)}>
                                <Gem className="mr-2 h-4 w-4"/>
                                {profile?.subscription ? profile.subscription.charAt(0).toUpperCase() + profile.subscription.slice(1) : 'Bronze'} Plan
                            </Badge>
                             <Button variant="link" asChild className="p-0 h-auto">
                                <Link href="/dashboard/subscription">Upgrade Plan</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={profile?.username || ''} onChange={handleProfileChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={profile?.email || ''} disabled />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="level">Level</Label>
                            <Input id="level" type="number" value={profile?.level || 1} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="class">Class</Label>
                            <Input id="class" value={userClass} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goal">Fitness Goal</Label>
                        {goalIsSet ? (
                            <Input id="goal" value={profile?.goal || ''} disabled />
                        ) : (
                            <Select onValueChange={handleGoalChange} value={profile?.goal === 'Not Set' ? '' : profile?.goal || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your primary goal..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Build Muscle">Build Muscle</SelectItem>
                                    <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                                    <SelectItem value="Improve Endurance">Improve Endurance</SelectItem>
                                    <SelectItem value="Increase Strength">Increase Strength</SelectItem>
                                    <SelectItem value="General Fitness">General Fitness</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                        {goalIsSet && <p className="text-xs text-muted-foreground">Your fitness goal is locked. It cannot be changed.</p>}
                    </div>

                    {canSaveChanges && (
                        <Button className="bg-accent hover:bg-accent/90" onClick={handleSaveChanges} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
