
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Loader2, Building, Users, TrendingUp, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminStatCard } from '@/components/admin/admin-stat-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type UserProfile = {
  uid: string;
  username: string;
  email: string;
  level: number;
  points: number;
  lastCompletedQuest?: Timestamp;
  streak: number;
};

type GymProfile = {
  id: string;
  name: string;
  ownerId: string;
  address?: string;
  ownerName?: string;
};

export default function GymDetailsPage({ params }: { params: { gymId: string } }) {
  const gymId = params.gymId;
  const [gym, setGym] = useState<GymProfile | null>(null);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!gymId) return;
      setLoading(true);

      try {
        // Fetch gym details
        const gymDocRef = doc(db, 'gyms', gymId);
        const gymDoc = await getDoc(gymDocRef);

        if (!gymDoc.exists()) {
          throw new Error('Gym not found');
        }
        const gymData = gymDoc.data();
        
        // Fetch owner's name
        const ownerDocRef = doc(db, 'users', gymData.ownerId);
        const ownerDoc = await getDoc(ownerDocRef);
        const ownerName = ownerDoc.exists() ? ownerDoc.data().username : 'N/A';

        setGym({
            id: gymDoc.id,
            name: gymData.name,
            ownerId: gymData.ownerId,
            address: gymData.address,
            ownerName: ownerName,
        });

        // Fetch gym members
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('gymId', '==', gymId));
        const querySnapshot = await getDocs(q);
        const memberList = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
        setMembers(memberList);

      } catch (error: any) {
        console.error('Error fetching gym details:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load gym data',
          description: error.message || 'An unexpected error occurred.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [gymId, toast]);
  
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
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Gym Not Found</h1>
        <p>Could not find data for the requested gym.</p>
        <Button asChild className="mt-4">
            <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      </div>
    );
  }

  const totalMembers = members.length;
  const totalPointsInGym = members.reduce((sum, m) => sum + m.points, 0);
  const averageLevel = totalMembers > 0 ? (members.reduce((sum, m) => sum + m.level, 0) / totalMembers).toFixed(1) : "0";

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
                <h1 className="text-4xl font-bold tracking-tighter">{gym.name}</h1>
                <p className="text-muted-foreground mt-1">Owned by {gym.ownerName} | {gym.address}</p>
            </div>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AdminStatCard title="Total Members" value={totalMembers.toString()} icon={Users} />
            <AdminStatCard title="Average Member Level" value={averageLevel} icon={TrendingUp} />
            <AdminStatCard title="Total Points in Gym" value={totalPointsInGym.toLocaleString()} icon={Coins} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Member List</CardTitle>
                <CardDescription>All users who are members of {gym.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member) => (
                        <TableRow key={member.uid}>
                            <TableCell>
                                <div className="font-medium">{member.username}</div>
                                <div className="text-sm text-muted-foreground">{member.email}</div>
                            </TableCell>
                            <TableCell>{member.level}</TableCell>
                            <TableCell>{getRelativeTime(member.lastCompletedQuest)}</TableCell>
                            <TableCell className="text-right font-semibold text-yellow-400">{member.points.toLocaleString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {members.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">This gym has no members yet.</p>
                )}
            </CardContent>
        </Card>

    </div>
  );
}
