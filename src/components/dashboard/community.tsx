
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Flame, Shield, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

type LeaderboardUser = {
    uid: string;
    username: string;
    streak: number;
    avatar?: string; // Placeholder for avatar functionality
}

export function Community() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, orderBy('streak', 'desc'), limit(3));
                const querySnapshot = await getDocs(q);
                const topUsers: LeaderboardUser[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    topUsers.push({
                        uid: doc.id,
                        username: data.username,
                        streak: data.streak,
                    });
                });
                setLeaderboard(topUsers);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users /> Community</CardTitle>
                <CardDescription>Join challenges and see how you rank.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2"><Shield /> Today's Challenge</h4>
                            <p className="text-sm text-muted-foreground">Complete 10,000 steps today.</p>
                        </div>
                        <Button variant="outline">Join Now</Button>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Leaderboard (Top 3)</h4>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {leaderboard.map((user, index) => (
                                <li key={user.username} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <div className="flex items-center gap-3">
                                        <span className="font-bold text-lg text-muted-foreground w-4">{index + 1}</span>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} data-ai-hint="warrior avatar" />
                                            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium text-sm">{user.username}</span>
                                </div>
                                    <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                                        {user.streak} <Flame size={14} />
                                    </div>
                                </li>
                            ))}
                             {leaderboard.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No hunters on a streak yet!</p>}
                        </ul>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
