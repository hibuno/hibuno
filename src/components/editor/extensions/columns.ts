import { Node, mergeAttributes } from '@tiptap/core';

export interface ColumnsOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columns: {
      setColumns: (count?: 2 | 3) => ReturnType;
      setTwoColumns: () => ReturnType;
    };
  }
}

export const Columns = Node.create<ColumnsOptions>({
  name: 'columns',

  group: 'block',

  content: 'column{2,3}',

  isolating: true,

  addAttributes() {
    return {
      count: {
        default: 2,
        parseHTML: (element) => element.getAttribute('data-count') || 2,
        renderHTML: (attributes) => {
          return {
            'data-count': attributes.count,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="columns"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
        class: 'columns-wrapper grid gap-4 my-4',
        style: `grid-template-columns: repeat(${HTMLAttributes['data-count'] || 2}, 1fr)`,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumns:
        (count = 2) =>
        ({ commands }) => {
          const columns = Array.from({ length: count }, () => ({
            type: 'column',
            content: [{ type: 'paragraph' }],
          }));

          return commands.insertContent({
            type: this.name,
            attrs: { count },
            content: columns,
          });
        },
      setTwoColumns:
        () =>
        ({ commands }) => {
          return commands.setColumns(2);
        },
    };
  },
});

export const Column = Node.create({
  name: 'column',

  content: 'block+',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        class: 'column p-4 border border-gray-200 rounded-lg bg-gray-50',
      }),
      0,
    ];
  },
});
