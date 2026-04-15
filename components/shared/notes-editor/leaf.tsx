import React, { CSSProperties } from 'react';
import { RenderLeafProps } from 'slate-react';

export default function Leaf({ attributes, children, leaf }: RenderLeafProps) {
    const style: CSSProperties = {};

    if (leaf.fontSize) {
        style.fontSize = leaf.fontSize;
    }
    if (leaf.color) {
        style.color = leaf.color;
    }

    let el = <span style={style}>{children}</span>;

    if (leaf.bold) {
        el = <strong>{el}</strong>;
    }
    if (leaf.italic) {
        el = <em>{el}</em>;
    }
    if (leaf.underline) {
        el = <u>{el}</u>;
    }

    return <span {...attributes}>{el}</span>;
}
