'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { toast } from 'sonner';
import { Descendant } from './types';
import { EMPTY_NOTES_VALUE } from './constants';
import { indentListItem, outdentListItem } from './utils';
import Element from './element';
import Leaf from './leaf';
import NotesToolbar from './toolbar';

export interface NotesEditorProps {
    /** Persisted notes loaded from the database (Slate Descendant[] as JSONB). */
    initialNotes: object[] | null | undefined;
    /** Called with the current editor value when a save is triggered. */
    onSave: (notes: object[]) => Promise<void>;
    /** Optional additional class names on the outer wrapper. */
    className?: string;
    /** Placeholder text shown in the empty editor. */
    placeholder?: string;
}

const AUTO_SAVE_DELAY_MS = 5000;

export default function NotesEditor({
    initialNotes,
    onSave,
    className,
    placeholder = 'Start writing your notes…',
}: NotesEditorProps) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), []);

    const initialValue = useMemo<Descendant[]>(() => {
        if (initialNotes && Array.isArray(initialNotes) && initialNotes.length > 0) {
            return initialNotes as Descendant[];
        }
        return EMPTY_NOTES_VALUE;
    }, [initialNotes]);

    const [value, setValue] = useState<Descendant[]>(initialValue);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestValue = useRef<Descendant[]>(value);

    // Keep ref in sync so timer callback always has latest value
    useEffect(() => {
        latestValue.current = value;
    }, [value]);

    const clearAutoSaveTimer = useCallback(() => {
        if (autoSaveTimer.current) {
            clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = null;
        }
    }, []);

    const save = useCallback(async (notes: Descendant[]) => {
        if (isSaving) return;
        setIsSaving(true);
        clearAutoSaveTimer();
        try {
            await onSave(notes as object[]);
            setIsDirty(false);
        } catch {
            toast.error('Failed to save notes. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [isSaving, onSave, clearAutoSaveTimer]);

    const handleChange = useCallback((newValue: Descendant[]) => {
        setValue(newValue);
        setIsDirty(true);

        // Reset 5s auto-save timer on every change
        clearAutoSaveTimer();
        autoSaveTimer.current = setTimeout(() => {
            save(latestValue.current);
        }, AUTO_SAVE_DELAY_MS);
    }, [clearAutoSaveTimer, save]);

    const handleBlur = useCallback(() => {
        if (isDirty) {
            clearAutoSaveTimer();
            save(latestValue.current);
        }
    }, [isDirty, clearAutoSaveTimer, save]);

    const handleManualSave = useCallback(() => {
        if (isDirty && !isSaving) {
            save(latestValue.current);
        }
    }, [isDirty, isSaving, save]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => clearAutoSaveTimer();
    }, [clearAutoSaveTimer]);

    const renderElement = useCallback((props: Parameters<typeof Element>[0]) => <Element {...props} />, []);
    const renderLeaf = useCallback((props: Parameters<typeof Leaf>[0]) => <Leaf {...props} />, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                outdentListItem(editor);
            } else {
                indentListItem(editor);
            }
        }
    }, [editor]);

    return (
        <div className={`border rounded-md overflow-hidden ${className}`}>
            <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
                <NotesToolbar
                    isDirty={isDirty}
                    isSaving={isSaving}
                    onSave={handleManualSave}
                />
                <div className="min-h-96">
                    <Editable
                        className="h-full p-3 focus:outline-none text-sm"
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder={placeholder}
                        renderPlaceholder={({ children, attributes }) => (
                            <span {...attributes} style={{ ...attributes.style, top: '12px', left: '12px' }}>
                                {children}
                            </span>
                        )}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        spellCheck
                    />
                </div>
            </Slate>
        </div>
    );
}
