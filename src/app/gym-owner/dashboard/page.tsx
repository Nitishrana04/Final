
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, TrendingUp, Coins, MoreHorizontal, Flame, Bell, Send, Building, Lock, Sparkles, AlertTriangle } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import type { UserProfile } from '@/hooks/use-user';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeneratePlanDialog } from '@/components/admin/generate-plan-dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function GymOwnerDashboardPage() {
  const { user, gym, profile } = useUser();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkNotificationMessage, setBulkNotificationMessage] = useState('');
  const { toast } = useToast();
  const [isGeneratePlanDialogOpen, setIsGeneratePlanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const isPrimeMember = profile?.subscription === 'gym-prime';

  useEffect(() => {
    const fetchMembers = async () => {
      if (!user || !gym) return;

      setIsLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('gymId', '==', user.uid));
        
        getDocs(q).then(querySnapshot => {
            const memberList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            setMembers(memberList);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
              path: usersRef.path,
              operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setMembers([]);
        }).finally(() => {
            setIsLoading(false);
        });

      } catch (error) {
        console.error('Error constructing query:', error);
        setIsLoading(false);
      }
    };

    if (user && gym) {
      fetchMembers();
    } else if (user && !gym) {
      // Handles the case where user is loaded but gym isn't yet, or doesn't exist
      setIsLoading(false);
    }
  }, [user, gym]);
  
  const handleOpenDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsGeneratePlanDialogOpen(true);
  }
  
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

  const onSendBulkNotification = () => {
    if (!bulkNotificationMessage.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Bulk notification message cannot be empty.",
        });
        return;
    }
    // TODO: Implement actual bulk notification logic for the gym
    console.log(`Sending bulk notification to all members of ${gym?.name}: "${bulkNotificationMessage}"`);
    toast({
        title: "Bulk Notification Sent",
        description: `Message successfully sent to all members of your gym.`,
    });
    setBulkNotificationMessage('');
  }

  const notificationTemplates = {
    'gym_challenge': `A new gym-wide challenge has started! Check the leaderboard and prove your strength, Hunter!`,
    'maintenance_alert': `Heads up, the gym will have scheduled maintenance on [Date] at [Time].`,
    'motivation_boost': `Keep pushing your limits! Every workout makes you stronger than you were yesterday. Let's get it!`
  };

  const totalMembers = members.length;
  const totalPoints = members.reduce((sum, member) => sum + member.points, 0);
  const averageLevel = totalMembers > 0 ? (members.reduce((sum, member) => sum + member.level, 0) / totalMembers).toFixed(1) : "0";
  const sortedMembersForLeaderboard = [...members].sort((a, b) => (b.streak || 0) - (a.streak || 0));

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (!gym) {
    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold">No Gym Found</h1>
            <p className="text-muted-foreground">We couldn't find a gym associated with your account.</p>
            <Button asChild className="mt-4">
                <Link href="/gym-owner/create-gym">Register Your Gym</Link>
            </Button>
        </div>
    )
  }


  return (
    <>
    <div className="space-y-8">
        <header>
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 grid place-content-center h-16 w-16 rounded-lg bg-card border">
                     <Building className="h-8 w-8 text-accent"/>
                </div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter">{gym?.name || 'Gym Dashboard'}</h1>
                    <p className="text-muted-foreground mt-1">{gym?.address || 'Oversee and manage your gym members and activities.'}</p>
                </div>
            </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard title="Total Members" value={totalMembers.toString()} icon={Users} />
            <AdminStatCard title="Average Member Level" value={averageLevel} icon={TrendingUp} description="Average level of all members" />
            <AdminStatCard title="Total Points in Gym" value={totalPoints.toLocaleString()} icon={Coins} description="Sum of all member points" />
        </div>

        {!isPrimeMember && (
            <Alert variant="destructive" className="border-yellow-400/50 text-yellow-400 [&>svg]:text-yellow-400">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Upgrade to Gym Prime</AlertTitle>
                <AlertDescription>
                    Unlock AI-powered plan generation for your members to provide personalized coaching. Manual plan assignment is still available.
                     <Button variant="link" asChild className="p-0 h-auto ml-1 text-yellow-400">
                        <Link href="/gym-owner/subscription">Upgrade Now</Link>
                    </Button>
                </AlertDescription>
            </Alert>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>Oversee member activity and communicate with your community.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="list">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="list"><Users className="mr-2 h-4 w-4" />Member List</TabsTrigger>
                        <TabsTrigger value="leaderboard"><Flame className="mr-2 h-4 w-4" />Leaderboard</TabsTrigger>
                        <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="list" className="mt-4">
                        {members.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Level</TableHead>
                                        <TableHead className="hidden md:table-cell">Last Active</TableHead>
                                        <TableHead className="text-right">Points</TableHead>
                                        <TableHead><span className="sr-only">Actions</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map(member => (
                                        <TableRow key={member.uid}>
                                            <TableCell>
                                            <div className="font-medium">{member.username}</div>
                                            <div className="text-sm text-muted-foreground md:hidden">{member.email}</div>
                                            </TableCell>
                                            <TableCell>{member.level}</TableCell>
                                            <TableCell className="hidden md:table-cell">{getRelativeTime(member.lastCompletedQuest)}</TableCell>
                                            <TableCell className="text-right font-semibold text-yellow-400">{member.points.toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleOpenDialog(member)}>
                                                        {!isPrimeMember && <Sparkles size={12} className="mr-2" />}
                                                        Assign Plan
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/gym-owner/members/${member.uid}`}>View Progress</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>Send Notification</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No members have joined your gym yet.</p>
                        )}
                    </TabsContent>

                    <TabsContent value="leaderboard" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Gym Leaderboard</CardTitle>
                                <CardDescription>Top performing members in your gym by current streak.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                <ul className="space-y-3">
                                    {sortedMembersForLeaderboard.slice(0, 5).map((member, index) => (
                                        <li key={member.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                        <div className="flex items-center gap-3">
                                                <span className="font-bold text-lg text-muted-foreground w-4">{index + 1}</span>
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={`https://picsum.photos/seed/${member.uid}/40/40`} data-ai-hint="warrior avatar" />
                                                    <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <span className="font-medium text-sm">{member.username}</span>
                                                    <p className="text-xs text-muted-foreground">Level {member.level}</p>
                                                </div>
                                        </div>
                                            <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                                                {member.streak || 0} <Flame size={14} />
                                            </div>
                                        </li>
                                    ))}
                                    {members.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No members on a streak yet!</p>}
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-4">
                        <Card>
                             <CardHeader>
                                <CardTitle>Bulk Notification</CardTitle>
                                <CardDescription>Send a message to all members of your gym.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="bulk-message" className="sr-only">Bulk Message</Label>
                                    <Textarea 
                                        id="bulk-message"
                                        placeholder="Type your announcement or motivational message here..."
                                        value={bulkNotificationMessage}
                                        onChange={(e) => setBulkNotificationMessage(e.target.value)}
                                        rows={4}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="w-1/2">
                                        <Label htmlFor="template-select">Use a template</Label>
                                        <Select onValueChange={(value) => value && setBulkNotificationMessage(notificationTemplates[value as keyof typeof notificationTemplates])}>
                                            <SelectTrigger id="template-select">
                                                <SelectValue placeholder="Select a template..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="gym_challenge">New Gym Challenge</SelectItem>
                                                <SelectItem value="maintenance_alert">Maintenance Alert</SelectItem>
                                                <SelectItem value="motivation_boost">Motivation Boost</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={onSendBulkNotification}><Send className="mr-2 h-4 w-4"/>Send to All Members</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
     <GeneratePlanDialog
        isOpen={isGeneratePlanDialogOpen}
        setIsOpen={setIsGeneratePlanDialogOpen}
        user={selectedUser}
        isPrime={isPrimeMember}
       />
    </>
  );
}

    
