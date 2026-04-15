import { Descendant } from './types';

export const EMPTY_NOTES_VALUE: Descendant[] = [
    { type: 'paragraph', children: [{ text: '' }] },
];

export const FONT_SIZE_OPTIONS = [
    { label: 'Small', value: '12px' },
    { label: 'Normal', value: '16px' },
    { label: 'Large', value: '20px' },
    { label: 'XL', value: '24px' },
    { label: 'XXL', value: '32px' },
] as const;

export const DEFAULT_FONT_SIZE = '16px';

export type FontSizeValue = (typeof FONT_SIZE_OPTIONS)[number]['value'];
