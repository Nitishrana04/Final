
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Trophy, Loader2, Gift } from "lucide-react";
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user';
import { Button } from '../ui/button';
import Link from 'next/link';


type BadgeState = {
    beginner: boolean;
    pro: boolean;
    master: boolean;
}

export function Rewards() {
    const { profile, loading } = useUser();
    const [badges, setBadges] = useState<BadgeState>({
        beginner: false,
        pro: false,
        master: false,
    });
    
    // This would eventually come from a different data source, maybe daily progress tracking
    const [pointsToday, setPointsToday] = useState(0); 

    useEffect(() => {
        if (profile) {
            setBadges({
                beginner: (profile.points || 0) >= 0, // Everyone starts as a beginner
                pro: (profile.points || 0) >= 5000,
                master: (profile.points || 0) >= 20000,
            });
        }
    }, [profile]);


    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy /> Rewards & Gamification</CardTitle>
                    <CardDescription>Stay motivated, unlock achievements!</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[200px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </CardContent>
            </Card>
        )
    }

    const streakGoal = 7; // e.g., a 7-day streak goal
    const currentStreak = profile?.streak || 0;
    const totalPoints = profile?.points || 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy /> Rewards & Gamification</CardTitle>
                <CardDescription>Stay motivated, unlock achievements!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-medium">Daily Streak</h4>
                        <span className="text-sm font-bold text-accent">{currentStreak} Days</span>
                    </div>
                    <Progress value={(currentStreak / streakGoal) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Complete today's tasks to keep the streak!</p>
                </div>
                
                <div>
                    <h4 className="text-sm font-medium mb-2">Points</h4>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="text-muted-foreground">Earned Today</span>
                        <span className="font-bold flex items-center gap-1">+{pointsToday} <Star className="h-4 w-4 text-yellow-400" /></span>
                    </div>
                     <div className="flex justify-between items-center p-3 mt-2 bg-muted/50 rounded-md">
                        <span className="text-muted-foreground">Total Balance</span>
                        <span className="font-bold flex items-center gap-1">{totalPoints.toLocaleString()} <Star className="h-4 w-4 text-yellow-400" /></span>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-2">Badges Unlocked</h4>
                    <div className="flex gap-4">
                        <BadgeDisplay title="Beginner" unlocked={badges.beginner} color="text-yellow-600" />
                        <BadgeDisplay title="Pro" unlocked={badges.pro} color="text-slate-400" />
                        <BadgeDisplay title="Master" unlocked={badges.master} color="text-amber-300" />
                    </div>
                </div>

                <div className="border-t pt-4">
                    <Button asChild className="w-full">
                        <Link href="/dashboard/redeem">
                            <Gift className="mr-2 h-4 w-4" />
                            Redeem Your Points
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}


function BadgeDisplay({ title, unlocked, color }: { title: string, unlocked: boolean, color: string }) {
    return (
        <div className={cn(
            "flex flex-col items-center text-center gap-1 text-xs p-2 border rounded-md bg-muted/50 w-full transition-opacity",
            !unlocked && "opacity-40"
        )}>
            <Award className={cn("h-6 w-6", unlocked ? color : "text-muted-foreground")} />
            <span>{title}</span>
        </div>
    )
}
