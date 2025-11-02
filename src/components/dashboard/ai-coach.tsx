
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Send, Loader2, Gem, Lock } from "lucide-react";
import { ScrollArea } from '../ui/scroll-area';
import { chat } from '@/ai/flows/coach';
import { useUser } from '@/hooks/use-user';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';

type Message = {
    sender: 'user' | 'ai';
    text: string;
}

export function AiCoach() {
    const { profile } = useUser();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello, Hunter! How can I help you train today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoldMember, setIsGoldMember] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        setIsGoldMember(profile?.subscription === 'gold');
    }, [profile]);


    const handleSend = async () => {
        if (!input.trim() || isLoading || !isGoldMember) return;

        const userMessage: Message = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const historyForAI = newMessages.slice(0, -1).map(m => ({...m}));
            const response = await chat({ history: historyForAI, question: input });
            const aiMessage: Message = { sender: 'ai', text: response.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorMessage: Message = { sender: 'ai', text: "I seem to be having trouble connecting. Please try again in a moment." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                     {!isGoldMember && <Lock className="text-yellow-400" />}
                    <Bot /> AI Coach
                </CardTitle>
                <CardDescription>Get unlimited fitness and diet advice. (Gold Plan Exclusive)</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[400px]">
                <ScrollArea className="flex-1 mb-4 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'ai' && <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0"><Bot size={16} /></div>}
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-end gap-2">
                                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0"><Bot size={16} /></div>
                                <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {!isGoldMember ? (
                     <Alert variant="destructive" className="border-yellow-400/50 text-yellow-400 [&>svg]:text-yellow-400 mt-4">
                        <Gem className="h-4 w-4" />
                        <AlertTitle>Upgrade to Gold</AlertTitle>
                        <AlertDescription>
                            Unlimited access to the AI Coach is a Gold Plan feature.
                            <Button variant="link" asChild className="p-0 h-auto ml-1 text-yellow-400">
                                <Link href="/dashboard/subscription">Upgrade Now</Link>
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="flex gap-2">
                        <Input 
                            placeholder="e.g., High-protein snack?" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={isLoading || !isGoldMember}
                        />
                        <Button onClick={handleSend} disabled={isLoading || !isGoldMember}><Send size={16}/></Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
