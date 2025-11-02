
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Droplets, Dumbbell, Utensils } from "lucide-react";

const reminders = [
    { icon: Dumbbell, text: "Leg day in 2 hours", time: "6:00 PM" },
    { icon: Utensils, text: "Log your dinner", time: "8:00 PM" },
    { icon: Droplets, text: "Drink a glass of water", time: "Now" },
];

export function Reminders() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell /> Reminders & Notifications</CardTitle>
                <CardDescription>Your upcoming tasks and alerts.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {reminders.map((item, index) => (
                        <li key={index} className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                <item.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{item.text}</p>
                                <p className="text-xs text-muted-foreground">{item.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
