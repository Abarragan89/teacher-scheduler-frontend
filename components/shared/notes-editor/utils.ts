import { Editor, Transforms, Element as SlateElement } from 'slate';
import { TextAlign, BlockType, ListType } from './types';

// ─── Mark helpers ──────────────────────────────────────────────────────────

export function isMarkActive(editor: Editor, format: string): boolean {
    const marks = Editor.marks(editor);
    return marks ? (marks as Record<string, unknown>)[format] === true : false;
}

export function toggleMark(editor: Editor, format: string): void {
    const active = isMarkActive(editor, format);
    if (active) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
}

export function getMarkValue(editor: Editor, format: string): unknown {
    const marks = Editor.marks(editor);
    return marks ? (marks as Record<string, unknown>)[format] : undefined;
}

export function setMark(editor: Editor, format: string, value: unknown): void {
    Editor.addMark(editor, format, value);
}

// ─── Block helpers ─────────────────────────────────────────────────────────

export function isBlockActive(editor: Editor, type: BlockType): boolean {
    const [match] = Editor.nodes(editor, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === type,
    });
    return !!match;
}

export function isListType(type: string): type is ListType {
    return type === 'bulleted-list' || type === 'numbered-list' || type === 'oxford-list';
}

export function toggleBlock(editor: Editor, type: BlockType): void {
    const isActive = isBlockActive(editor, type);
    const isList = isListType(type);

    // Unwrap any existing list wrapper first
    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            isListType(n.type),
        split: true,
    });

    if (isActive) {
        // Revert to paragraph
        Transforms.setNodes(editor, { type: 'paragraph' } as Partial<SlateElement>);
    } else if (isList) {
        // Wrap in list, set children as list-items
        Transforms.setNodes(editor, { type: 'list-item', indent: 0 } as Partial<SlateElement>);
        const block = { type, children: [] } as SlateElement;
        Transforms.wrapNodes(editor, block);
    } else {
        // check-list-item or other block
        Transforms.setNodes(editor, { type, checked: false } as Partial<SlateElement>);
    }
}

// ─── Alignment helpers ─────────────────────────────────────────────────────

export function isAlignActive(editor: Editor, align: TextAlign): boolean {
    const [match] = Editor.nodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            'align' in n &&
            (n as { align?: TextAlign }).align === align,
    });
    return !!match;
}

export function setAlign(editor: Editor, align: TextAlign): void {
    Transforms.setNodes(editor, { align } as Partial<SlateElement>, {
        match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n),
    });
}

// ─── Indent helpers (for oxford list) ─────────────────────────────────────

export function indentListItem(editor: Editor): void {
    const entries = Array.from(
        Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
        })
    );
    for (const [node, path] of entries) {
        const el = node as { indent?: number };
        Transforms.setNodes(editor, { indent: Math.min((el.indent ?? 0) + 1, 3) } as Partial<SlateElement>, { at: path });
    }
}

export function outdentListItem(editor: Editor): void {
    const entries = Array.from(
        Editor.nodes(editor, {
            match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
        })
    );
    for (const [node, path] of entries) {
        const el = node as { indent?: number };
        Transforms.setNodes(editor, { indent: Math.max((el.indent ?? 0) - 1, 0) } as Partial<SlateElement>, { at: path });
    }
}
