
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, increment, writeBatch, serverTimestamp, Timestamp, updateDoc, collection, addDoc, onSnapshot, Unsubscribe, query, where, getDocs } from 'firebase/firestore';

// Types
export type Plan = {
  date: Timestamp;
  workoutPlan: string | null;
  dietPlan: string | null;
};

type WorkoutExercise = {
    name: string;
    sets: number;
    reps: number | null;
    duration: string | null;
};

export type UserProfile = {
    uid: string;
    username: string;
    email: string;
    level: number;
    points: number;
    streak: number;
    goal: string;
    subscription: 'bronze' | 'silver' | 'gold' | 'gym-free' | 'gym-prime';
    lastCompletedQuest?: Timestamp;
    lastLoggedDiet?: Timestamp;
    role: 'user' | 'admin' | 'gym-owner';
    gymId?: string | null;
};

export type GymProfile = {
    id: string;
    name: string;
    ownerId: string;
    address?: string;
    city?: string;
    country?: string;
}

type DietLog = {
    morning: string;
    lunch: string;
    dinner: string;
    snacks: string;
};

export type UserContextType = {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    gym: GymProfile | null;
    plan: Plan | null;
    loading: boolean;
    updateProgress: (pointsEarned: number, exercises: WorkoutExercise[]) => Promise<void>;
    logDiet: (dietLog: DietLog) => Promise<void>;
    logWeight: (weight: number) => Promise<void>;
    redeemPoints: (pointsToRedeem: number, upiId: string) => Promise<void>;
    updateSubscription: (newPlan: 'bronze' | 'silver' | 'gold' | 'gym-free' | 'gym-prime') => Promise<void>;
    getClassFromLevel: (level: number) => string;
    hasCompletedQuestToday: boolean;
    hasLoggedDietToday: boolean;
    refetch: (firebaseUser: FirebaseUser) => Promise<void>;
};


// Helper Functions
function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const getClassFromLevel = (level: number): string => {
    if (level < 10) return "Rookie";
    if (level < 20) return "Hunter";
    if (level < 30) return "Knight";
    if (level < 40) return "Elite Knight";
    if (level < 50) return "Ranger";
    if (level < 60) return "Assassin";
    if (level < 70) return "Mage";
    if (level < 80) return "Archmage";
    if (level < 90) return "Monarch";
    return "Ruler";
};

const POINTS_PER_LEVEL = 100;

// Context
const UserContext = createContext<UserContextType | null>(null);

// Provider
export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [plan, setPlan] = useState<Plan | null>(null);
    const [gym, setGym] = useState<GymProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async (firebaseUser: FirebaseUser) => {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data() as UserProfile;
                if (!userData.subscription) {
                    userData.subscription = userData.role === 'gym-owner' ? 'gym-free' : 'bronze';
                }
                setProfile(userData);

                if (userData.gymId) {
                     const gymDocRef = doc(db, 'gyms', userData.gymId);
                     const gymDoc = await getDoc(gymDocRef);
                     if(gymDoc.exists()){
                         setGym({ id: gymDoc.id, ...gymDoc.data() } as GymProfile);
                     }
                } else if (userData.role === 'gym-owner') {
                    const gymDocRef = doc(db, 'gyms', firebaseUser.uid);
                     const gymDoc = await getDoc(gymDocRef);
                     if(gymDoc.exists()){
                         setGym({ id: gymDoc.id, ...gymDoc.data() } as GymProfile);
                     }
                }

            }
        } catch (error) {
            console.error("Error refetching user profile:", error);
        }
    }, []);

    useEffect(() => {
        let unsubscribeProfile: Unsubscribe | undefined;
        let unsubscribePlan: Unsubscribe | undefined;
        let unsubscribeGym: Unsubscribe | undefined;

        const handleUserChange = (firebaseUser: FirebaseUser | null) => {
            // Clean up previous listeners
            unsubscribeProfile?.();
            unsubscribePlan?.();
            unsubscribeGym?.();

            if (firebaseUser) {
                setUser(firebaseUser);
                setLoading(true);

                // Subscribe to user profile
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                unsubscribeProfile = onSnapshot(userDocRef, (userDoc) => {
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as UserProfile;
                         if (!userData.subscription) {
                            userData.subscription = userData.role === 'gym-owner' ? 'gym-free' : 'bronze';
                        }
                        setProfile(userData);
                        
                        // After setting profile, determine which gym to listen to
                        const gymId = userData.role === 'gym-owner' ? userDoc.id : userData.gymId;
                        if (gymId) {
                            const gymDocRef = doc(db, 'gyms', gymId);
                            unsubscribeGym = onSnapshot(gymDocRef, (gymDoc) => {
                                if (gymDoc.exists()) {
                                    setGym({ id: gymDoc.id, ...gymDoc.data() } as GymProfile);
                                } else {
                                    setGym(null);
                                }
                            });
                        } else {
                            setGym(null);
                        }

                    } else {
                        // This might happen briefly after registration before doc is created
                        setProfile(null);
                        setGym(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to profile changes:", error);
                    setProfile(null);
                    setLoading(false);
                });

                // Subscribe to today's plan
                const todayStr = formatDate(new Date());
                const planDocRef = doc(db, `users/${firebaseUser.uid}/plans`, todayStr);
                unsubscribePlan = onSnapshot(planDocRef, (doc) => {
                    setPlan(doc.exists() ? doc.data() as Plan : null);
                }, (error) => {
                     console.error("Error listening to plan changes:", error);
                     setPlan(null);
                });
                
            } else {
                setUser(null);
                setProfile(null);
                setPlan(null);
                setGym(null);
                setLoading(false);
            }
        };

        const unsubscribeAuth = onAuthStateChanged(auth, handleUserChange);

        return () => {
            unsubscribeAuth();
            unsubscribeProfile?.();
            unsubscribePlan?.();
            unsubscribeGym?.();
        }
    }, []);


    const hasCompletedQuestToday = profile?.lastCompletedQuest ? isSameDay(profile.lastCompletedQuest.toDate(), new Date()) : false;
    const hasLoggedDietToday = profile?.lastLoggedDiet ? isSameDay(profile.lastLoggedDiet.toDate(), new Date()) : false;

    const updateProgress = async (pointsEarned: number, exercises: WorkoutExercise[]) => {
        if (!user || !profile) throw new Error("User not authenticated or profile not loaded.");
        if (hasCompletedQuestToday) throw new Error("You have already completed the daily quest today.");

        const batch = writeBatch(db);
        const userDocRef = doc(db, 'users', user.uid);
        
        const newPoints = profile.points + pointsEarned;
        const newLevel = Math.floor(newPoints / POINTS_PER_LEVEL) + 1;

        const updates: any = {
            points: increment(pointsEarned),
            streak: increment(1),
            lastCompletedQuest: serverTimestamp(),
        };

        if (newLevel > profile.level) updates.level = newLevel;

        batch.update(userDocRef, updates);

        const today = new Date();
        const historyId = formatDate(today);
        const historyDocRef = doc(db, `users/${user.uid}/workoutHistory`, historyId);

        batch.set(historyDocRef, {
            completedAt: serverTimestamp(),
            pointsEarned,
            exercises: exercises,
        });

        await batch.commit();
    };

    const logDiet = async (dietLog: DietLog) => {
        if (!user || !profile) throw new Error("User not authenticated or profile not loaded.");
        if (hasLoggedDietToday) throw new Error("You have already logged your diet today.");

        const batch = writeBatch(db);
        const userDocRef = doc(db, 'users', user.uid);

        batch.update(userDocRef, { lastLoggedDiet: serverTimestamp(), points: increment(10) });

        const historyId = formatDate(new Date());
        const dietHistoryDocRef = doc(db, `users/${user.uid}/dietHistory`, historyId);

        batch.set(dietHistoryDocRef, { loggedAt: serverTimestamp(), ...dietLog });

        await batch.commit();
    };

    const logWeight = async (weight: number) => {
        if (!user) throw new Error("User not authenticated.");

        const weightHistoryRef = collection(db, `users/${user.uid}/weightHistory`);
        await addDoc(weightHistoryRef, {
            date: serverTimestamp(),
            weight: weight,
        });
    };
    
    const redeemPoints = async (pointsToRedeem: number, upiId: string) => {
        if (!user || !profile) {
            throw new Error("User not authenticated or profile not loaded.");
        }
        if (profile.subscription !== 'gold') {
            throw new Error("Point redemption is a feature available for Gold Plan members.");
        }
        if (profile.points < pointsToRedeem) {
            throw new Error("Insufficient points.");
        }

        const batch = writeBatch(db);
        const userDocRef = doc(db, 'users', user.uid);
        
        batch.update(userDocRef, { points: increment(-pointsToRedeem) });

        // Add to user's personal redemption history
        const redemptionHistoryRef = doc(collection(db, `users/${user.uid}/redemptions`));
        batch.set(redemptionHistoryRef, {
            pointsRedeemed: pointsToRedeem,
            redeemedAt: serverTimestamp(),
        });

        // Add to global admin queue for approval
        const redemptionRequestRef = doc(collection(db, "redemptionRequests"));
        batch.set(redemptionRequestRef, {
            userId: user.uid,
            username: profile.username,
            pointsRedeemed: pointsToRedeem,
            upiId: upiId,
            requestedAt: serverTimestamp(),
            status: "pending",
        });

        await batch.commit();
    };

    const updateSubscription = async (newPlan: 'bronze' | 'silver' | 'gold' | 'gym-free' | 'gym-prime') => {
        if (!user) throw new Error("User not authenticated.");
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { subscription: newPlan });
    };


    const value = {
        user,
        profile,
        gym,
        plan,
        loading,
        updateProgress,
        logDiet,
        logWeight,
        redeemPoints,
        updateSubscription,
        getClassFromLevel,
        hasCompletedQuestToday,
        hasLoggedDietToday,
        refetch,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
