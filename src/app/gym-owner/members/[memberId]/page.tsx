
'use client';

import { UserProgress } from "@/components/admin/user-progress";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";
import { useUser } from '@/hooks/use-user';
import type { UserProfile, WorkoutLog, DietLog, RedemptionLog } from "@/app/admin/users/[userId]/page";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export default function MemberProgressPage({ params }: { params: { memberId: string } }) {
  const memberId = params.memberId;
  const { user: gymOwner, profile: gymOwnerProfile } = useUser();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [dietHistory, setDietHistory] = useState<DietLog[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!memberId || !gymOwner) return;
      setLoading(true);
      setError(null);

      try {
        // First, verify the gym owner has permission to view this member.
        const memberDocRef = doc(db, 'users', memberId);
        const memberDoc = await getDoc(memberDocRef);
        
        if (!memberDoc.exists()) {
          throw new Error("Member not found");
        }

        const memberData = memberDoc.data() as UserProfile;

    if ((memberData as any).gymId !== gymOwner.uid) {
            throw new Error("You do not have permission to view this member's progress.");
        }
        
        setMember({
            uid: memberDoc.id,
            username: memberData.username,
            email: memberData.email,
            goal: memberData.goal,
            level: memberData.level,
            points: memberData.points,
            lastCompletedQuest: memberData.lastCompletedQuest,
            lastLoggedDiet: memberData.lastLoggedDiet,
            role: memberData.role,
            status: 'Active', // Simplified for this view
            subscription: memberData.subscription || 'bronze',
        });

        // Now fetch subcollections
        const workoutCollection = collection(db, `users/${memberId}/workoutHistory`);
        const workoutQuery = query(workoutCollection, orderBy("completedAt", "desc"));
        
        const dietCollection = collection(db, `users/${memberId}/dietHistory`);
        const dietQuery = query(dietCollection, orderBy("loggedAt", "desc"));

        const redemptionCollection = collection(db, `users/${memberId}/redemptions`);
        const redemptionQuery = query(redemptionCollection, orderBy("redeemedAt", "desc"));

        const workoutPromise = getDocs(workoutQuery).then(workoutSnapshot => {
            const workouts = workoutSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WorkoutLog));
            setWorkoutHistory(workouts);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: workoutCollection.path, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });

        const dietPromise = getDocs(dietQuery).then(dietSnapshot => {
            const diets = dietSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DietLog));
            setDietHistory(diets);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({ path: dietCollection.path, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });
        
        const redemptionPromise = getDocs(redemptionQuery).then(redemptionSnapshot => {
            const redemptions = redemptionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedemptionLog));
            setRedemptionHistory(redemptions);
        }).catch(serverError => {
             const permissionError = new FirestorePermissionError({ path: redemptionCollection.path, operation: 'list' });
            errorEmitter.emit('permission-error', permissionError);
        });

        await Promise.all([workoutPromise, dietPromise, redemptionPromise]);

      } catch (err: any) {
        console.error("Error fetching member progress data:", err);
        setError(err.message || "Failed to load member data.");
        toast({
            variant: "destructive",
            title: "Failed to load member data",
            description: err.message || "Could not fetch some member details. Check permissions."
        })
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [memberId, gymOwner, toast]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto px-4 py-8 text-center">
         <Button asChild variant="outline" className="mb-4">
            <Link href="/gym-owner/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">Member not found</h1>
        <p>Could not find the requested member data.</p>
      </div>
    );
  }

  // We reuse the Admin's UserProgress component, but wrap it to provide the correct back-link
  return (
    <div className="space-y-8">
         <header className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/gym-owner/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Dashboard</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-4xl font-bold tracking-tighter">Member Progress</h1>
                <p className="text-muted-foreground mt-1">Viewing report for {member.username}.</p>
            </div>
      </header>
        <UserProgress user={member} workout={workoutHistory} diet={dietHistory} redemptions={redemptionHistory} />
    </div>
  )
}
