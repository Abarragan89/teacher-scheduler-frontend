import { BaseEditor, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type ListType = 'bulleted-list' | 'numbered-list' | 'oxford-list';
export type BlockType =
    | 'paragraph'
    | 'bulleted-list'
    | 'numbered-list'
    | 'oxford-list'
    | 'list-item'
    | 'check-list-item';

export type CustomText = {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: string;
    color?: string;
};

export type ParagraphElement = {
    type: 'paragraph';
    align?: TextAlign;
    children: CustomText[];
};

export type ListElement = {
    type: 'bulleted-list' | 'numbered-list' | 'oxford-list';
    children: ListItemElement[];
};

export type ListItemElement = {
    type: 'list-item';
    indent?: number;
    children: CustomText[];
};

export type CheckListItemElement = {
    type: 'check-list-item';
    checked?: boolean;
    align?: TextAlign;
    children: CustomText[];
};

export type CustomElement =
    | ParagraphElement
    | ListElement
    | ListItemElement
    | CheckListItemElement;

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: CustomElement;
        Text: CustomText;
    }
}

export type { Descendant };
