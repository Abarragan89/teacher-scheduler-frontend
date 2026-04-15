'use client';
import React, { useCallback, useRef } from 'react';
import { useSlate } from 'slate-react';
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    CheckSquare,
    Indent,
    Outdent,
    Save,
    BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FONT_SIZE_OPTIONS, DEFAULT_FONT_SIZE } from './constants';
import {
    isMarkActive,
    toggleMark,
    getMarkValue,
    setMark,
    isBlockActive,
    toggleBlock,
    isAlignActive,
    setAlign,
    indentListItem,
    outdentListItem,
} from './utils';
import { TextAlign, BlockType } from './types';

// ─── Icon button ───────────────────────────────────────────────────────────

interface ToolbarButtonProps {
    active?: boolean;
    disabled?: boolean;
    onMouseDown: (e: React.MouseEvent) => void;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({ active, disabled, onMouseDown, title, children }: ToolbarButtonProps) {
    return (
        <button
            title={title}
            disabled={disabled}
            onMouseDown={onMouseDown}
            className={`
                p-1.5 rounded hover:bg-accent transition-colors
                ${active ? 'bg-accent text-primary' : ''}
                ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
            `}
        >
            {children}
        </button>
    );
}

// ─── Divider ───────────────────────────────────────────────────────────────

function Divider() {
    return <span className="w-px h-5 bg-border mx-1 shrink-0" />;
}

// ─── Main toolbar ──────────────────────────────────────────────────────────

interface NotesToolbarProps {
    isDirty: boolean;
    isSaving: boolean;
    onSave: () => void;
}

export default function NotesToolbar({ isDirty, isSaving, onSave }: NotesToolbarProps) {
    const editor = useSlate();
    const colorInputRef = useRef<HTMLInputElement>(null);

    const prevent = useCallback((e: React.MouseEvent) => e.preventDefault(), []);

    const currentFontSize = (getMarkValue(editor, 'fontSize') as string) ?? DEFAULT_FONT_SIZE;
    const currentColor = (getMarkValue(editor, 'color') as string) ?? '#000000';

    return (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-background sticky top-0 z-10 rounded-t-md">
            {/* Alignment */}
            {(['left', 'center', 'right', 'justify'] as TextAlign[]).map((align) => {
                const Icon = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify }[align];
                return (
                    <ToolbarButton
                        key={align}
                        title={`Align ${align}`}
                        active={isAlignActive(editor, align)}
                        onMouseDown={(e) => { prevent(e); setAlign(editor, align); }}
                    >
                        <Icon className="h-4 w-4" />
                    </ToolbarButton>
                );
            })}

            <Divider />

            {/* Bold / Italic / Underline */}
            {(['bold', 'italic', 'underline'] as const).map((mark) => {
                const Icon = { bold: Bold, italic: Italic, underline: Underline }[mark];
                return (
                    <ToolbarButton
                        key={mark}
                        title={mark.charAt(0).toUpperCase() + mark.slice(1)}
                        active={isMarkActive(editor, mark)}
                        onMouseDown={(e) => { prevent(e); toggleMark(editor, mark); }}
                    >
                        <Icon className="h-4 w-4" />
                    </ToolbarButton>
                );
            })}

            <Divider />

            {/* Font size */}
            <Select
                value={currentFontSize}
                onValueChange={(val) => setMark(editor, 'fontSize', val)}
            >
                <SelectTrigger className="h-7 w-24 text-xs px-2">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {FONT_SIZE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Divider />

            {/* Color picker */}
            <ToolbarButton
                title="Text color"
                onMouseDown={(e) => { prevent(e); colorInputRef.current?.click(); }}
            >
                <span className="relative flex items-center justify-center">
                    <span className="text-xs font-bold leading-none" style={{ color: currentColor }}>A</span>
                    <span
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded"
                        style={{ backgroundColor: currentColor }}
                    />
                </span>
                <input
                    ref={colorInputRef}
                    type="color"
                    value={currentColor}
                    onChange={(e) => setMark(editor, 'color', e.target.value)}
                    className="sr-only"
                    tabIndex={-1}
                />
            </ToolbarButton>

            <Divider />

            {/* List types */}
            {([
                { type: 'bulleted-list', Icon: List, title: 'Bullet list' },
                { type: 'numbered-list', Icon: ListOrdered, title: 'Numbered list' },
                { type: 'oxford-list', Icon: BookOpen, title: 'Oxford outline' },
                { type: 'check-list-item', Icon: CheckSquare, title: 'Checklist' },
            ] as { type: BlockType; Icon: React.ElementType; title: string }[]).map(({ type, Icon, title }) => (
                <ToolbarButton
                    key={type}
                    title={title}
                    active={isBlockActive(editor, type)}
                    onMouseDown={(e) => { prevent(e); toggleBlock(editor, type); }}
                >
                    <Icon className="h-4 w-4" />
                </ToolbarButton>
            ))}

            <Divider />

            {/* Indent / Outdent */}
            <ToolbarButton title="Indent" onMouseDown={(e) => { prevent(e); indentListItem(editor); }}>
                <Indent className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Outdent" onMouseDown={(e) => { prevent(e); outdentListItem(editor); }}>
                <Outdent className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            {/* Save button */}
            <Button
                size="sm"
                variant="outline"
                className="ml-auto h-7 gap-1 text-xs"
                disabled={!isDirty || isSaving}
                onClick={onSave}
            >
                <Save className="h-3.5 w-3.5" />
                {isSaving ? 'Saving…' : 'Save'}
            </Button>
        </div>
    );
}
