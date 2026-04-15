'use client';
import React from 'react';
import { toast } from 'sonner';
import NotesEditor from '@/components/shared/notes-editor';
import { clientDays } from '@/lib/api/services/days/client';

interface DailyNotesViewProps {
    dayId: string;
    initialNotes: object[] | null | undefined;
}

export default function DailyNotesView({ dayId, initialNotes }: DailyNotesViewProps) {
    async function handleSave(notes: object[]) {
        await clientDays.updateDayNotes(dayId, notes);
        toast.success('Notes saved');
    }

    return (
        <NotesEditor
            initialNotes={initialNotes}
            onSave={handleSave}
            className="w-full"
            placeholder="Write your notes for today…"
        />
    );
}
