
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dumbbell, Utensils, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { WeightEntryDialog } from './weight-entry-dialog';


type Exercise = {
    name: string;
    sets: number;
    reps: number | null;
    duration: string | null;
    completed: boolean;
    points: number;
}

type DietLog = {
    morning: string;
    lunch: string;
    dinner: string;
    snacks: string;
};


export function DailyOverview() {
    const { toast } = useToast();
    const { updateProgress, loading, hasCompletedQuestToday, logDiet, hasLoggedDietToday, plan } = useUser();

    const [workoutPlan, setWorkoutPlan] = useState<Exercise[]>([]);
    const [dietPlan, setDietPlan] = useState<any>(null); // Simplified for now
    
    const [isCompleting, setIsCompleting] = useState(false);
    const [isLoggingDiet, setIsLoggingDiet] = useState(false);
    const [dietLog, setDietLog] = useState<DietLog>({
        morning: '',
        lunch: '',
        dinner: '',
        snacks: ''
    });
    const [isWeightDialogOpen, setIsWeightDialogOpen] = useState(false);

    useEffect(() => {
        if (plan?.workoutPlan) {
            // A simple parser for the workout plan string. This should be made more robust.
            const parsedExercises: Exercise[] = plan.workoutPlan.split('\n')
                .filter(line => line.startsWith('- '))
                .map(line => {
                     const name = line.replace(/- /g, '').split('(')[0]?.trim() || 'Unknown Exercise';
                     const pointsMatch = name.match(/\[(\d+)pts\]/);
                     const points = pointsMatch ? parseInt(pointsMatch[1]) : 10; // Default to 10 points
                     const cleanName = name.replace(/\[\d+pts\]/,'').trim();

                    return {
                        name: cleanName,
                        sets: parseInt(line.match(/(\d+)x/)?.[1] || '3'),
                        reps: parseInt(line.match(/x(\d+)/)?.[1] || '0') || null,
                        duration: line.match(/\d+s/)?.[0] || null,
                        completed: false,
                        points: points,
                    }
                });
            setWorkoutPlan(parsedExercises);
        } else {
            setWorkoutPlan([]);
        }

        if (plan?.dietPlan) {
            setDietPlan(plan.dietPlan);
        } else {
            setDietPlan(null);
        }
    }, [plan]);


    const allExercisesCompleted = workoutPlan.length > 0 && workoutPlan.every(ex => ex.completed);

    const handleToggleCompletion = (exerciseName: string) => {
        setWorkoutPlan(prevPlan => 
            prevPlan.map(ex => 
                ex.name === exerciseName ? { ...ex, completed: !ex.completed } : ex
            )
        );
    };
    
    const handleCompleteQuest = async () => {
        if (!allExercisesCompleted) return;
        setIsCompleting(true);
        
        const completedExercises = workoutPlan.filter(ex => ex.completed);
        const pointsEarned = completedExercises.reduce((total, ex) => total + ex.points, 0);
        const exercisesToLog = completedExercises.map(({ name, sets, reps, duration }) => ({ name, sets, reps, duration }));
    
        try {
            await updateProgress(pointsEarned, exercisesToLog);
            toast({
                title: "Daily Quest Complete!",
                description: `You've earned ${pointsEarned} points. Now, let's track your weight.`,
            });
            setIsWeightDialogOpen(true); // Open weight dialog on success
        } catch (error) {
            console.error("Failed to update progress:", error);
            let errorMessage = 'Could not save your progress. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        } finally {
            setIsCompleting(false);
        }
    };

    const handleDietLogChange = (meal: keyof DietLog, value: string) => {
        setDietLog(prev => ({...prev, [meal]: value}));
    }

    const handleLogDiet = async () => {
        setIsLoggingDiet(true);
        try {
            await logDiet(dietLog);
            toast({
                title: "Diet Log Saved!",
                description: "Your diet for today has been successfully logged.",
            });
        } catch (error) {
             console.error("Failed to log diet:", error);
            let errorMessage = 'Could not save your diet log. Please try again.';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                variant: 'destructive',
                title: 'Error',
                description: errorMessage,
            });
        } finally {
            setIsLoggingDiet(false);
        }
    }


    return (
        <>
        <Card>
            <CardHeader>
                <CardTitle>Today's Plan</CardTitle>
                <CardDescription>Your daily workout and diet objectives.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                <Tabs defaultValue="workout" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="workout"><Dumbbell className="mr-2 h-4 w-4" />Workout</TabsTrigger>
                        <TabsTrigger value="diet"><Utensils className="mr-2 h-4 w-4" />Diet</TabsTrigger>
                    </TabsList>
                    <TabsContent value="workout" className="mt-4">
                        {hasCompletedQuestToday ? (
                             <div className="text-center text-green-500 py-8">
                                <p className='font-bold text-lg'>Daily Quest Completed!</p>
                                <p>Come back tomorrow for a new challenge.</p>
                            </div>
                        ) : workoutPlan.length > 0 ? (
                            <>
                                <ul className="space-y-3">
                                    {workoutPlan.map(ex => (
                                        <li key={ex.name} className={cn("p-3 rounded-md flex items-center gap-4 transition-colors", ex.completed ? 'bg-muted/50' : '')}>
                                            <Checkbox id={`ov-ex-${ex.name}`} checked={ex.completed} onCheckedChange={() => handleToggleCompletion(ex.name)} />
                                            <label htmlFor={`ov-ex-${ex.name}`} className="flex-1 grid grid-cols-4 items-center gap-2 cursor-pointer">
                                                <span className="font-medium col-span-2">{ex.name}</span>
                                                <span className="text-sm text-muted-foreground">{ex.sets} sets</span>
                                                <span className="text-sm text-muted-foreground">{ex.reps ? `${ex.reps} reps` : ex.duration}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                {allExercisesCompleted && (
                                    <div className="flex justify-end pt-4 mt-4 border-t">
                                        <Button onClick={handleCompleteQuest} disabled={isCompleting || loading || hasCompletedQuestToday}>
                                           {isCompleting ? <Loader2 className="animate-spin" /> : "Complete Daily Quest"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No workout assigned for today.</p>
                                <p className="text-xs">An admin can assign you a plan from the dashboard.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="diet" className="mt-4 space-y-4">
                       {hasLoggedDietToday ? (
                             <div className="text-center text-green-500 py-8">
                                <p className='font-bold text-lg'>Diet Logged for Today!</p>
                                <p>You can view your history on the tracking page.</p>
                            </div>
                        ) : dietPlan ? (
                            <>
                               <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    <h4 className="font-semibold">Assigned Diet Plan</h4>
                                    <p className="text-sm whitespace-pre-wrap">{dietPlan}</p>
                                </div>
                                <h4 className="font-semibold pt-4 border-t">Log Your Meals</h4>
                                <Accordion type="multiple" className="w-full" defaultValue={['morning']}>
                                    <DietAccordionItem meal="morning" title="Morning" value={dietLog.morning} onChange={handleDietLogChange} />
                                    <DietAccordionItem meal="lunch" title="Lunch" value={dietLog.lunch} onChange={handleDietLogChange} />
                                    <DietAccordionItem meal="dinner" title="Dinner" value={dietLog.dinner} onChange={handleDietLogChange} />
                                    <DietAccordionItem meal="snacks" title="Snacks" value={dietLog.snacks} onChange={handleDietLogChange} />
                                </Accordion>
                                <div className="flex justify-end pt-4 mt-4 border-t">
                                    <Button onClick={handleLogDiet} disabled={isLoggingDiet || loading || hasLoggedDietToday}>
                                        {isLoggingDiet ? <Loader2 className="animate-spin" /> : "Log Full Day's Diet"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                             <div className="text-center text-muted-foreground py-8">
                                <p>No diet plan assigned for today.</p>
                                <p className="text-xs">An admin can assign you a plan from the dashboard.</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                )}
            </CardContent>
        </Card>
        <WeightEntryDialog
            isOpen={isWeightDialogOpen}
            setIsOpen={setIsWeightDialogOpen}
        />
        </>
    );
}

interface DietAccordionProps {
    meal: keyof DietLog;
    title: string;
    value: string;
    onChange: (meal: keyof DietLog, value: string) => void;
}

function DietAccordionItem({ meal, title, value, onChange }: DietAccordionProps) {
    return (
        <AccordionItem value={meal}>
            <AccordionTrigger>{title}</AccordionTrigger>
            <AccordionContent className="space-y-4">
                 <Textarea 
                    placeholder={`What did you actually have for ${title.toLowerCase()}?`} 
                    value={value}
                    onChange={(e) => onChange(meal, e.target.value)}
                />
            </AccordionContent>
        </AccordionItem>
    )
}
