
'use client';

import { UserProgress } from "@/components/admin/user-progress";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/error-emitter";
import { FirestorePermissionError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  goal: string;
  level: number;
  points: number;
  lastCompletedQuest?: Timestamp;
  lastLoggedDiet?: Timestamp;
  role: 'user' | 'admin' | 'gym-owner';
  status: 'Active' | 'Inactive'; // For compatibility with existing components
  subscription: 'bronze' | 'silver' | 'gold';
};

export type WorkoutLog = {
  id: string;
  completedAt: Timestamp;
  exercises: { name: string; sets: string; reps: string; duration: string | null }[];
};

export type DietLog = {
    id: string;
    loggedAt: Timestamp;
    morning: string;
    lunch: string;
    dinner: string;
    snacks: string;
};

export type RedemptionLog = {
    id: string;
    redeemedAt: Timestamp;
    pointsRedeemed: number;
};


export default function UserProgressPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  const [dietHistory, setDietHistory] = useState<DietLog[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);

      try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: userDoc.id,
            username: userData.username,
            email: userData.email,
            goal: userData.goal,
            level: userData.level,
            points: userData.points,
            lastCompletedQuest: userData.lastCompletedQuest,
            lastLoggedDiet: userData.lastLoggedDiet,
            role: userData.role,
            status: 'Active',
            subscription: userData.subscription || 'bronze',
          });
        } else {
          throw new Error("User not found");
        }

        const workoutCollection = collection(db, `users/${userId}/workoutHistory`);
        const workoutQuery = query(workoutCollection, orderBy("completedAt", "desc"));
        
        const dietCollection = collection(db, `users/${userId}/dietHistory`);
        const dietQuery = query(dietCollection, orderBy("loggedAt", "desc"));

        const redemptionCollection = collection(db, `users/${userId}/redemptions`);
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

      } catch (error) {
        console.error("Error fetching user progress data:", error);
        toast({
            variant: "destructive",
            title: "Failed to load user data",
            description: "Could not fetch some user details. Check permissions."
        })
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, toast]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p>Could not find the requested user data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                </Link>
            </Button>
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter">User Progress</h1>
                <p className="text-muted-foreground mt-1">Viewing report for {user.username}.</p>
            </div>
        </header>
        <UserProgress user={user} workout={workoutHistory} diet={dietHistory} redemptions={redemptionHistory} />
    </div>
    );
}
