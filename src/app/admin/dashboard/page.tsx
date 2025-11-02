
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Users, UserCheck, Send, LogOut, Loader2, Gamepad2, Bell, Flame, Coins, Hourglass, CheckCircle, XCircle, Gem, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { GeneratePlanDialog } from '@/components/admin/generate-plan-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';


type User = {
  uid: string;
  username: string;
  email: string;
  goal: string;
  level: number;
  points: number;
  lastCompletedQuest?: Timestamp;
  role: 'user' | 'admin' | 'gym-owner';
  streak: number;
  subscription: 'bronze' | 'silver' | 'gold';
  gymId?: string;
};

type Gym = {
    id: string;
    name: string;
    ownerId: string;
    ownerName?: string;
    memberCount?: number;
}

type RedemptionRequest = {
    id: string;
    userId: string;
    username: string;
    pointsRedeemed: number;
    upiId: string;
    requestedAt: Timestamp;
    status: 'pending' | 'approved' | 'rejected';
}


export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [redemptionRequests, setRedemptionRequests] = useState<RedemptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotifyDialogOpen, setIsNotifyDialogOpen] = useState(false);
  const [isGeneratePlanDialogOpen, setIsGeneratePlanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [bulkNotificationMessage, setBulkNotificationMessage] = useState('');
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
        setUsers(usersList);

        const userMap = new Map(usersList.map(u => [u.uid, u.username]));

        const gymsCollection = collection(db, 'gyms');
        const gymsSnapshot = await getDocs(gymsCollection);
        const gymsList = gymsSnapshot.docs.map(doc => {
            const gymData = doc.data();
            const members = usersList.filter(u => u.gymId === doc.id && u.role !== 'gym-owner');
            return {
                id: doc.id,
                name: gymData.name,
                ownerId: gymData.ownerId,
                ownerName: userMap.get(gymData.ownerId) || 'N/A',
                memberCount: members.length
            };
        });
        setGyms(gymsList);

        const requestsCollection = collection(db, 'redemptionRequests');
        const requestsQuery = query(requestsCollection, where('status', '==', 'pending'), orderBy('requestedAt', 'desc'));
        
        getDocs(requestsQuery).then(requestsSnapshot => {
            const requestsList = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RedemptionRequest));
            setRedemptionRequests(requestsList);
        }).catch(serverError => {
            const permissionError = new FirestorePermissionError({
                path: requestsCollection.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setRedemptionRequests([]);
        });
      
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
            variant: "destructive",
            title: "Failed to load dashboard",
            description: "Could not fetch required data. Please check console for errors and Firestore rules."
        });
        
        if (error instanceof Error && error.message.includes('permission-denied')) {
             const permissionError = new FirestorePermissionError({
                path: 'users or gyms',
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const handleOpenDialog = (user: User, dialog: 'notify' | 'generate') => {
    setSelectedUser(user);
    if (dialog === 'notify') {
        setIsNotifyDialogOpen(true);
    } else {
        setIsGeneratePlanDialogOpen(true);
    }
  }

  const onSendNotification = () => {
    if (!notificationMessage.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Notification message cannot be empty.",
        });
        return;
    }
    // TODO: Implement actual notification sending logic
    console.log(`Sending notification to ${selectedUser?.username}: "${notificationMessage}"`);
    toast({
        title: "Notification Sent",
        description: `Message successfully sent to ${selectedUser?.username}.`,
    });
    setNotificationMessage('');
    setIsNotifyDialogOpen(false);
    setSelectedUser(null);
  }
  
  const onSendBulkNotification = () => {
    if (!bulkNotificationMessage.trim()) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Bulk notification message cannot be empty.",
        });
        return;
    }
    // TODO: Implement actual bulk notification logic
    console.log(`Sending bulk notification to all users: "${bulkNotificationMessage}"`);
    toast({
        title: "Bulk Notification Sent",
        description: `Message successfully sent to all users.`,
    });
    setBulkNotificationMessage('');
  }

  const handleRedemptionRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const requestDocRef = doc(db, 'redemptionRequests', requestId);
    const dataToUpdate = { status: newStatus };

    updateDoc(requestDocRef, dataToUpdate)
      .then(() => {
        toast({
          title: `Request ${newStatus}`,
          description: `The redemption request has been successfully ${newStatus}.`,
        });
        fetchDashboardData(); // Refresh data
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: requestDocRef.path,
          operation: 'update',
          requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
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
  
  const getSubscriptionBadgeVariant = (subscription?: string) => {
    switch (subscription) {
        case 'gold': return "bg-yellow-400/20 text-yellow-300 border-yellow-400/50";
        case 'silver': return "bg-slate-400/20 text-slate-300 border-slate-400/50";
        default: return "bg-amber-700/20 text-amber-500 border-amber-700/50";
    }
}

  const regularUsers = users.filter(u => u.role === 'user');
  const gymOwners = users.filter(u => u.role === 'gym-owner');
  
  const totalRegularUsers = regularUsers.length;
  const totalGyms = gyms.length;
  const activeUsers = totalRegularUsers; // Placeholder logic
  const totalSystemPoints = regularUsers.reduce((acc, user) => acc + (user.points || 0), 0);

  const notificationTemplates = {
    'streak_congrats': `Congratulations on your streak! Keep up the great work, Hunter!`,
    'workout_reminder': `Don't forget to complete your workout today. The path to power is paved with consistency.`,
    'new_challenge': `A new global challenge has begun! Check the Community board and prove your strength.`
  };

  const sortedUsersForLeaderboard = [...regularUsers].sort((a, b) => (b.streak || 0) - (a.streak || 0));


  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-4xl font-bold tracking-tighter">Super Admin Dashboard</h1>
                <p className="text-muted-foreground mt-2">Oversee the entire Level Up Fitness ecosystem.</p>
            </div>
            <Button asChild variant="outline">
                <Link href="/login">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Link>
            </Button>
        </header>
        
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard title="Total Gyms" value={totalGyms.toString()} icon={Building} />
          <AdminStatCard title="Total Users" value={totalRegularUsers.toString()} icon={Users} description="Excludes gym owners" />
          <AdminStatCard title="Active Users (24h)" value={activeUsers.toString()} icon={UserCheck} description={`${totalRegularUsers > 0 ? Math.round((activeUsers/totalRegularUsers) * 100) : 0}% of all users`} />
          <AdminStatCard title="Total Points in System" value={totalSystemPoints.toLocaleString()} icon={Coins} description="Sum of all regular user points" />
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Hourglass size={20} />Pending Redemptions</CardTitle>
                <CardDescription>Review and approve or reject user point redemption requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                {isLoading ? (
                    <div className="flex justify-center items-center h-24"><Loader2 className="h-6 w-6 animate-spin" /></div>
                ) : redemptionRequests.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>UPI ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {redemptionRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.username}</TableCell>
                                    <TableCell className="font-semibold text-yellow-400">{req.pointsRedeemed.toLocaleString()}</TableCell>
                                    <TableCell>{req.upiId}</TableCell>
                                    <TableCell>{req.requestedAt.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="sm" className="text-green-400 border-green-400/50 hover:bg-green-400/10 hover:text-green-300" onClick={() => handleRedemptionRequest(req.id, 'approved')}><CheckCircle size={14} className="mr-1" /> Approve</Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleRedemptionRequest(req.id, 'rejected')}><XCircle size={14} className="mr-1" /> Reject</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">No pending redemption requests.</p>
                )}
              </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Gym Management</CardTitle>
                        <CardDescription>
                        Oversee all registered gyms on the platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full overflow-x-auto">
                        {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                        ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Gym Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead className="text-right">Members</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {gyms.map((gym) => (
                                <TableRow key={gym.id}>
                                    <TableCell className="font-medium">{gym.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{gym.ownerName}</TableCell>
                                    <TableCell className="text-right font-semibold">{gym.memberCount}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/gyms/${gym.id}`}>View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        )}
                      </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>
                        View and manage all registered users in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full overflow-x-auto">
                        {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                        ) : (
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                            <TableHead className="hidden md:table-cell">Last Active</TableHead>
                            <TableHead className="text-right">Points</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {regularUsers.map((user) => (
                            <TableRow key={user.uid}>
                                <TableCell>
                                <div className="font-medium">{user.username} (Lvl. {user.level})</div>
                                <div className="text-sm text-muted-foreground md:hidden">{user.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(getSubscriptionBadgeVariant(user.subscription))}>
                                        <Gem className="mr-1.5 h-3 w-3" />
                                        {user.subscription ? user.subscription.charAt(0).toUpperCase() + user.subscription.slice(1) : 'Bronze'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                <Badge variant={'default'} className={'bg-green-600/20 text-green-400 border-green-600/40'}>
                                    Active
                                </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{getRelativeTime(user.lastCompletedQuest)}</TableCell>
                                <TableCell className="text-right font-semibold text-yellow-400">{user.points?.toLocaleString() || 0}</TableCell>
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
                                    <DropdownMenuItem onClick={() => handleOpenDialog(user, 'generate')}>Generate Plan</DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={`/admin/users/${user.uid}`}>View Progress</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleOpenDialog(user, 'notify')}>Send Notification</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Suspend User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                        )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Advanced Features</CardTitle>
                        <CardDescription>Manage gamification and system-wide notifications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="gamification">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="gamification"><Gamepad2 className="mr-2 h-4 w-4" />Gamification</TabsTrigger>
                                <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
                            </TabsList>
                            <TabsContent value="gamification" className="mt-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Leaderboard</CardTitle>
                                        <CardDescription>Top performing users by current streak.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {sortedUsersForLeaderboard.slice(0, 5).map((user, index) => (
                                                    <li key={user.uid} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                                    <div className="flex items-center gap-3">
                                                            <span className="font-bold text-lg text-muted-foreground w-4">{index + 1}</span>
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/40/40`} data-ai-hint="warrior avatar" />
                                                                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <span className="font-medium text-sm">{user.username}</span>
                                                                <p className="text-xs text-muted-foreground">Level {user.level}</p>
                                                            </div>
                                                    </div>
                                                        <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                                                            {user.streak} <Flame size={14} />
                                                        </div>
                                                    </li>
                                                ))}
                                                {users.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No hunters on a streak yet!</p>}
                                            </ul>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Reward Settings</CardTitle>
                                        <CardDescription>Control points awarded for user actions.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="workout-points">Workout Completion Points</Label>
                                                <Input id="workout-points" type="number" defaultValue="50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="diet-points">Diet Logging Points</Label>
                                                <Input id="diet-points" type="number" defaultValue="30" />
                                            </div>
                                        </div>
                                        <Button>Save Settings</Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="notifications" className="mt-4 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Bulk Notification</CardTitle>
                                        <CardDescription>Send a message to all active users at once.</CardDescription>
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
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="w-full sm:w-1/2">
                                                <Label htmlFor="template-select">Use a template</Label>
                                                <Select onValueChange={(value) => value && setBulkNotificationMessage(notificationTemplates[value as keyof typeof notificationTemplates])}>
                                                    <SelectTrigger id="template-select">
                                                        <SelectValue placeholder="Select a template..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="streak_congrats">Streak Congratulations</SelectItem>
                                                        <SelectItem value="workout_reminder">Workout Reminder</SelectItem>
                                                        <SelectItem value="new_challenge">New Challenge</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={onSendBulkNotification} className="w-full sm:w-auto"><Send className="mr-2 h-4 w-4"/>Send to All Users</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>

      </div>

      <Dialog open={isNotifyDialogOpen} onOpenChange={setIsNotifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>Send Notification to {selectedUser?.username}</DialogTitle>
            <DialogDescription>
                Compose your message below. The user will receive it as a system alert.
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="message" className="text-right">
                        Message
                    </Label>
                    <Textarea
                        id="message"
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        className="col-span-3"
                        placeholder="Type your notification here."
                    />
                </div>
            </div>
            <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotifyDialogOpen(false)}>Cancel</Button>
            <Button onClick={onSendNotification}>
                <Send className="mr-2 h-4 w-4"/>
                Send Notification
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <GeneratePlanDialog
        isOpen={isGeneratePlanDialogOpen}
        setIsOpen={setIsGeneratePlanDialogOpen}
        user={selectedUser}
       />
    </>
  );
}
