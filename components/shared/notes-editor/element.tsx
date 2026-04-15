import React, { CSSProperties } from 'react';
import { RenderElementProps, useSlateStatic, ReactEditor } from 'slate-react';
import { Transforms } from 'slate';
import { CheckListItemElement as CheckListItemType, ListItemElement as ListItemType, TextAlign } from './types';

// Oxford outline prefix: depth 0 → 'I.', 1 → 'A.', 2 → '1.', 3 → 'a.'
function getOxfordPrefix(indent: number, index: number): string {
    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    const alphaLower = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
    switch (indent % 4) {
        case 0: return `${roman[index] ?? 'I'}.`;
        case 1: return `${alpha[index] ?? 'A'}.`;
        case 2: return `${index + 1}.`;
        case 3: return `${alphaLower[index] ?? 'a'}.`;
        default: return `${index + 1}.`;
    }
}

function CheckListItem({ attributes, children, element }: RenderElementProps) {
    const editor = useSlateStatic();
    const el = element as CheckListItemType;
    const textAlign = (el as { align?: TextAlign }).align ?? 'left';

    return (
        <div
            {...attributes}
            style={{ textAlign }}
            className="flex items-start gap-2 my-0.5"
        >
            <span contentEditable={false} className="mt-0.5 shrink-0">
                <input
                    type="checkbox"
                    checked={el.checked ?? false}
                    onChange={(e) => {
                        const path = ReactEditor.findPath(editor, element);
                        Transforms.setNodes(editor, { checked: e.target.checked }, { at: path });
                    }}
                    className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
            </span>
            <span
                className={el.checked ? 'line-through text-muted-foreground' : ''}
                style={{ flex: 1 }}
            >
                {children}
            </span>
        </div>
    );
}

function OxfordListItem({ attributes, children, element, index }: RenderElementProps & { index: number }) {
    const el = element as ListItemType;
    const indent = el.indent ?? 0;
    const prefix = getOxfordPrefix(indent, index);
    return (
        <li
            {...attributes}
            style={{ marginLeft: indent * 24, listStyle: 'none' }}
            className="flex gap-2 my-0.5"
        >
            <span contentEditable={false} className="shrink-0 w-8 text-right font-medium">
                {prefix}
            </span>
            <span style={{ flex: 1 }}>{children}</span>
        </li>
    );
}

export default function Element(props: RenderElementProps) {
    const { attributes, children, element } = props;
    const align = ('align' in element ? element.align : undefined) as TextAlign | undefined;
    const style: CSSProperties = { textAlign: align };

    switch (element.type) {
        case 'bulleted-list':
            return (
                <ul {...attributes} style={style} className="list-disc list-inside my-1 pl-2">
                    {children}
                </ul>
            );
        case 'numbered-list':
            return (
                <ol {...attributes} style={style} className="list-decimal list-inside my-1 pl-2">
                    {children}
                </ol>
            );
        case 'oxford-list':
            return (
                <ul {...attributes} style={style} className="my-1 pl-0">
                    {React.Children.map(children, (child, i) =>
                        React.isValidElement(child)
                            ? React.cloneElement(child as React.ReactElement<{ index: number }>, { index: i })
                            : child
                    )}
                </ul>
            );
        case 'list-item': {
            const el = element as ListItemType;
            const isOxford = el.indent !== undefined;
            if (isOxford) {
                const index = (props as RenderElementProps & { index?: number }).index ?? 0;
                return <OxfordListItem {...props} index={index} />;
            }
            return (
                <li {...attributes} style={style}>
                    {children}
                </li>
            );
        }
        case 'check-list-item':
            return <CheckListItem {...props} />;
        default:
            return (
                <p {...attributes} style={style} className="my-0.5">
                    {children}
                </p>
            );
    }
}
