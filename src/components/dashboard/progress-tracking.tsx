
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from "lucide-react";
import { useUser } from '@/hooks/use-user';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

type WeightDataPoint = {
    name: string; // "MM/DD"
    weight: number;
}

const initialCalorieData: { name: string; required: number; consumed: number }[] = [];

export function ProgressTracking() {
    const { user, loading: userLoading } = useUser();
    const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
    const [calorieData, setCalorieData] = useState(initialCalorieData);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            if (!userLoading) setIsLoading(false);
            return;
        }

        const weightHistoryRef = collection(db, `users/${user.uid}/weightHistory`);
        const q = query(weightHistoryRef, orderBy('date', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: WeightDataPoint[] = snapshot.docs.map(doc => {
                const docData = doc.data();
                const date = docData.date.toDate();
                return {
                    name: `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`,
                    weight: docData.weight,
                };
            });
            setWeightData(data);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching weight history:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, userLoading]);

    const renderChart = (data: any[], key: string, title: string, colors: { stroke: string; fill: string; }) => {
        if (isLoading) {
            return (
                <div className="h-full flex flex-col items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            )
        }
        if (data.length === 0) {
            return (
                <div className="h-full flex flex-col items-center justify-center">
                    <h4 className="text-sm font-semibold mb-2 text-center">{title}</h4>
                    <p className="text-xs text-muted-foreground">No data yet. Start tracking!</p>
                </div>
            )
        }
        return (
            <>
                <h4 className="text-sm font-semibold mb-2 text-center">{title}</h4>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id={colors.fill} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                        <Area type="monotone" dataKey={key} stroke={colors.stroke} fill={`url(#${colors.fill})`} />
                        {key === 'consumed' && (
                             <Area type="monotone" dataKey="required" name="Required" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="5 5" />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp /> Progress Tracking</CardTitle>
                <CardDescription>Your performance over the last weeks.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="h-[200px]">
                    {renderChart(weightData, 'weight', 'Weight Change (kg)', { stroke: 'hsl(var(--accent))', fill: 'colorWeight' })}
                </div>
                 <div className="h-[200px]">
                    {renderChart(calorieData, 'consumed', 'Calories (Consumed vs. Required)', { stroke: 'hsl(var(--primary))', fill: 'colorConsumed' })}
                </div>
            </CardContent>
        </Card>
    );
}
