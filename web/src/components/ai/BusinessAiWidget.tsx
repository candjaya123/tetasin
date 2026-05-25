'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles
} from "lucide-react";
import { createClient } from '@/lib/supabase/client';

export function BusinessAiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'ai' | 'user', content: string}[]>([
    { role: 'ai', content: 'Halo! Saya CFO Virtual Anda. Ada yang bisa saya bantu analisa hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/ai/business/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ prompt: userMsg })
      });

      if (!response.ok) throw new Error('Gagal mendapatkan respon AI');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Maaf, saya sedang mengalami gangguan koneksi. Silakan coba lagi nanti.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[380px] h-[520px] shadow-2xl border-border/40 flex flex-col overflow-hidden bg-card/95 backdrop-blur-2xl rounded-3xl">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/20 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-semibold block">CFO Virtual AI</span>
                <span className="text-[10px] text-primary-foreground/60">Online &bull; Siap membantu</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 rounded-xl"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            className="flex-grow overflow-y-auto p-4 space-y-4 bg-muted/30"
            ref={scrollRef}
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-muted border border-border/40' : 'bg-primary/10'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-4 h-4 text-muted-foreground" />
                      : <Sparkles className="w-4 h-4 text-primary" />
                    }
                  </div>
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-md'
                      : 'bg-card text-foreground shadow-sm border border-border/20 rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 items-center bg-card p-3 rounded-2xl shadow-sm border border-border/20 rounded-tl-md">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">AI sedang berpikir...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/30 bg-card">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya soal keuangan..."
                className="bg-muted/50 border-none rounded-xl focus-visible:ring-primary text-sm"
              />
              <Button
                type="submit"
                size="icon-sm"
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 rounded-xl transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          size="icon-lg"
          className="w-14 h-14 rounded-2xl shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
        </Button>
      )}
    </div>
  );
}
