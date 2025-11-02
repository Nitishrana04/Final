
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUser } from '@/hooks/use-user';
import { Loader2, Calendar, Clock } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

type WorkoutLog = {
    id: string; // YYYY-MM-DD
    completedAt: Date;
    exercises: { name: string; sets: number; reps: number | null; duration: string | null; }[];
    pointsEarned: number;
}


export default function TrackingPage() {
    const { user, loading: userLoading } = useUser();
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const historyCollection = collection(db, `users/${user.uid}/workoutHistory`);
                const q = query(historyCollection);
                const querySnapshot = await getDocs(q);
                
                const history = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        completedAt: data.completedAt.toDate(),
                        exercises: data.exercises,
                        pointsEarned: data.pointsEarned,
                    }
                });
                setWorkoutHistory(history.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()));

            } catch (error) {
                console.error("Error fetching workout history:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (user) {
            fetchHistory();
        } else if (!userLoading) {
            setIsLoading(false);
        }

    }, [user, userLoading]);

    if (isLoading || userLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-bold tracking-tighter text-accent">Workout Log</h1>
                <p className="text-muted-foreground mt-2">A history of all your completed Daily Quests.</p>
            </header>
            
            {workoutHistory.length === 0 ? (
                 <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <p>You haven't completed any quests yet.</p>
                        <p>Go to your dashboard to complete today's workout!</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Completion History</CardTitle>
                        <CardDescription>Review your past workout performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Exercises</TableHead>
                                    <TableHead className="text-right">Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {workoutHistory.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2"><Calendar size={14} /> {log.completedAt.toLocaleDateString()}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 ml-0.5"><Clock size={12}/> {log.completedAt.toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell>
                                            <ul className="list-disc list-inside text-sm">
                                                {log.exercises.map(ex => <li key={ex.name}>{ex.name}</li>)}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-yellow-400">+{log.pointsEarned}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
