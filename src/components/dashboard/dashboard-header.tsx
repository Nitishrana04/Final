
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Coins, Loader2, Building } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function DashboardHeader() {
    const { user, profile, gym, loading } = useUser();

    if (loading) {
        return (
             <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-accent">
                         <AvatarFallback><Loader2 className="animate-spin" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tighter">Welcome!</h1>
                        <p className="text-muted-foreground">Loading your data...</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2 p-3 bg-card border rounded-lg self-stretch sm:self-auto">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    <span className="text-xl font-bold"><Loader2 className="animate-spin h-5 w-5"/></span>
                    <span className="text-sm text-muted-foreground">Points</span>
                </div>
            </header>
        )
    }

    return (
        <header className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-accent">
                    <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} alt="User Avatar" data-ai-hint="warrior avatar" />
                    <AvatarFallback>{profile?.username?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter">Welcome, {profile?.username || 'Hunter'}!</h1>
                    <div className="text-muted-foreground mt-1">Your goal: <Badge variant="outline" className="ml-1 border-accent text-accent">{profile?.goal || 'Not Set'}</Badge></div>
                    {gym && (
                        <div className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
                            <Building size={14} /> Member of: <span className="font-semibold text-foreground">{gym.name}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border rounded-lg self-stretch sm:self-auto">
                <Coins className="h-6 w-6 text-yellow-400" />
                <span className="text-xl font-bold">{profile?.points?.toLocaleString() || 0}</span>
                <span className="text-sm text-muted-foreground">Points</span>
            </div>
        </header>
    );
}
