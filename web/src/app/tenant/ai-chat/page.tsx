'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { aiChatService } from '@/lib/api/aiChatService';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Halo! Saya CFO Virtual Anda. Tanyakan apa saja tentang keuangan dan operasional bisnis Anda.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await aiChatService.businessChat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response || 'Maaf, saya tidak mengerti.' }]);
    } catch (error: any) {
      if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
        toast({ title: 'Kuota AI sedang tinggi. Mohon tunggu beberapa menit.', variant: 'destructive' });
      } else {
        toast({ title: 'Gagal mendapatkan respons dari AI', variant: 'destructive' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Virtual CFO
        </h1>
        <p className="text-sm text-slate-500 font-medium">Asisten keuangan dan operasional bisnis Anda.</p>
      </div>

      <Card className="flex-1 border-none shadow-sm flex flex-col overflow-hidden">
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-violet-100 text-violet-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-sm'
                    : 'bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-sm border border-slate-100 px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-50 bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Tanyakan sesuatu tentang keuangan bisnis Anda..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary font-medium"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
