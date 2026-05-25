'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquarePlus, Clock, User } from "lucide-react";

interface NoteSection {
  text: string;
  timestamp?: string;
  author?: string;
}

interface DivisionNotes {
  kasir?: NoteSection;
  stok?: NoteSection;
  dapur?: NoteSection;
  gudang?: NoteSection;
}

const DIVISIONS = [
  { key: 'kasir', label: 'Kasir', color: 'border-l-emerald-400 bg-emerald-50' },
  { key: 'stok', label: 'Stok', color: 'border-l-blue-400 bg-blue-50' },
  { key: 'dapur', label: 'Dapur', color: 'border-l-orange-400 bg-orange-50' },
  { key: 'gudang', label: 'Gudang', color: 'border-l-purple-400 bg-purple-50' },
] as const;

interface DivisionNotesPanelProps {
  divisionNotes: DivisionNotes;
  onAddNote: (division: string, note: string) => void;
}

export function DivisionNotesPanel({ divisionNotes, onAddNote }: DivisionNotesPanelProps) {
  const [activeDivision, setActiveDivision] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const handleSubmit = (division: string) => {
    if (!noteText.trim()) return;
    onAddNote(division, noteText.trim());
    setNoteText('');
    setActiveDivision(null);
  };

  const formatTime = (ts?: string) => {
    if (!ts) return '';
    return new Date(ts).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {DIVISIONS.map(({ key, label, color }) => {
        const data = divisionNotes[key as keyof DivisionNotes];
        const hasNote = data?.text;

        return (
          <div
            key={key}
            className={`rounded-xl border border-slate-100 border-l-4 p-3 ${color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-slate-700">{label}</h4>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setActiveDivision(activeDivision === key ? null : key)}
              >
                <MessageSquarePlus className="size-3.5 text-slate-400" />
              </Button>
            </div>

            {hasNote ? (
              <div className="space-y-1.5">
                <p className="text-sm text-slate-600">{data!.text}</p>
                {data!.timestamp && (
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock className="size-3" />
                    <span>{formatTime(data!.timestamp)}</span>
                    {data!.author && (
                      <>
                        <User className="size-3" />
                        <span>{data!.author}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada catatan</p>
            )}

            {activeDivision === key && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder={`Tambah catatan ${label}...`}
                  className="h-16 text-xs"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setActiveDivision(null);
                      setNoteText('');
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleSubmit(key)}
                    disabled={!noteText.trim()}
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
