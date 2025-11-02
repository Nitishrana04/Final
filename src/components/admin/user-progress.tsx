
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dumbbell, Utensils, UserCheck, Coins, Gift, Calendar, Clock, Gem } from "lucide-react";
import type { UserProfile, WorkoutLog, DietLog, RedemptionLog } from "@/app/admin/users/[userId]/page";
import { Timestamp } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface UserProgressProps {
  user: UserProfile;
  workout: WorkoutLog[];
  diet: DietLog[];
  redemptions: RedemptionLog[];
}

export function UserProgress({ user, workout, diet, redemptions }: UserProgressProps) {

  const latestDiet = diet.length > 0 ? diet[0] : null;

  const getRelativeTime = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const past = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 1) return `${days} days ago`;
    if (days === 1) return `1 day ago`;
    if (hours > 1) return `${hours} hours ago`;
    if (hours === 1) return `1 hour ago`;
    if (minutes > 1) return `${minutes} minutes ago`;
    if (minutes === 1) return `1 minute ago`;
    return 'Just now';
  };
  
  const getSubscriptionBadgeVariant = (subscription?: string) => {
    switch (subscription) {
        case 'gold': return "bg-yellow-400/20 text-yellow-300 border-yellow-400/50";
        case 'silver': return "bg-slate-400/20 text-slate-300 border-slate-400/50";
        default: return "bg-amber-700/20 text-amber-500 border-amber-700/50";
    }
}

  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} alt={user.username} data-ai-hint="warrior avatar" />
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-2xl">{user.username} (Lvl. {user.level})</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <h3 className="font-semibold">Subscription Plan</h3>
                     <Badge variant="outline" className={cn("mt-1", getSubscriptionBadgeVariant(user.subscription))}>
                        <Gem className="mr-1.5 h-3 w-3" />
                        {user.subscription ? user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1) : 'Bronze'}
                    </Badge>
                </div>
                <div>
                    <h3 className="font-semibold">Status</h3>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className={user.status === 'Active' ? 'bg-green-600/20 text-green-400 border-green-600/40' : ''}>
                        {user.status}
                    </Badge>
                </div>
                <div>
                    <h3 className="font-semibold">Goal</h3>
                    <p className="text-muted-foreground">{user.goal}</p>
                </div>
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><Coins size={16} /> Points Balance</h3>
                    <p className="font-bold text-lg text-yellow-400">{user.points?.toLocaleString() || 0}</p>
                </div>
                <div>
                    <h3 className="font-semibold flex items-center gap-2"><UserCheck size={16} /> Last Active</h3>
                     <div className="text-sm text-muted-foreground mt-2 space-y-1">
                        <p className="flex items-center gap-2"><Dumbbell size={14} /> Workout: {getRelativeTime(user.lastCompletedQuest)}</p>
                        <p className="flex items-center gap-2"><Utensils size={14} /> Diet: {getRelativeTime(user.lastLoggedDiet)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Dumbbell /> Workout History</CardTitle>
                    <CardDescription>Full history of all completed workouts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                  {workout.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Exercises</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {workout.map(w => (
                            <TableRow key={w.id}>
                                <TableCell>
                                    <div className="font-medium flex items-center gap-2"><Calendar size={14} /> {w.completedAt?.toDate().toLocaleDateString()}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2 ml-0.5"><Clock size={12}/> {w.completedAt?.toDate().toLocaleTimeString()}</div>
                                </TableCell>
                                <TableCell>
                                    <ul className="list-disc list-inside text-sm">
                                        {w.exercises.map(exercise => (
                                            <li key={exercise.name}>{exercise.name} ({exercise.sets}x{exercise.reps || exercise.duration})</li>
                                        ))}
                                    </ul>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center">No workout history found.</p>
                  )}
                  </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Utensils /> Last Logged Diet</CardTitle>
                    {latestDiet && <CardDescription>Logged on {latestDiet.loggedAt?.toDate().toLocaleDateString()}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-2">
                    {latestDiet ? (
                      <>
                        <MealLogCard title="Morning" entry={latestDiet.morning} />
                        <MealLogCard title="Lunch" entry={latestDiet.lunch} />
                        <MealLogCard title="Dinner" entry={latestDiet.dinner} />
                        <MealLogCard title="Snacks" entry={latestDiet.snacks} />
                      </>
                    ) : (
                       <p className="text-muted-foreground text-center">No diet history found.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Gift /> Redemption History</CardTitle>
                    <CardDescription>History of all points redemptions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-x-auto">
                  {redemptions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Points Redeemed</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {redemptions.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.redeemedAt?.toDate().toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-semibold text-destructive">-{log.pointsRedeemed.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center">No redemption history found.</p>
                  )}
                  </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

function MealLogCard({ title, entry }: { title: string, entry: string }) {
    if (!entry) return null;
    return (
        <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-1 text-sm">{title}</h4>
            <p className="text-sm text-muted-foreground">{entry}</p>
        </div>
    )
}
