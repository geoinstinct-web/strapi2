import { render, screen } from '@testing-library/react';

import { quoteBlocks } from '../Quote';

import { Wrapper } from './Wrapper';
import { Editor, Transforms, createEditor } from 'slate';

describe('Quote', () => {
  it('renders a quote block properly', () => {
    render(
      quoteBlocks.quote.renderElement({
        children: 'Some quote',
        element: {
          type: 'quote',
          children: [{ type: 'text', text: 'Some quote' }],
        },
        attributes: {
          'data-slate-node': 'element',
          ref: null,
        },
      }),
      {
        wrapper: Wrapper,
      }
    );

    const quote = screen.getByRole('blockquote');
    expect(quote).toBeInTheDocument();
    expect(quote).toHaveTextContent('Some quote');
  });

  it('handles enter key on a quote', () => {
    const baseEditor = createEditor();

    baseEditor.children = [
      {
        type: 'quote',
        children: [
          {
            type: 'text',
            text: 'Some quote',
          },
        ],
      },
    ];

    // Simulate enter key press at the end of the quote
    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, []),
      focus: Editor.end(baseEditor, []),
    });
    quoteBlocks.quote.handleEnterKey?.(baseEditor);

    // Should enter a line break within the quote
    expect(baseEditor.children).toEqual([
      {
        type: 'quote',
        children: [
          {
            type: 'text',
            text: 'Some quote\n',
          },
        ],
      },
    ]);

    // Simulate enter key press at the end of the quote again
    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, []),
      focus: Editor.end(baseEditor, []),
    });
    quoteBlocks.quote.handleEnterKey?.(baseEditor);

    // Should delete the line break and create a paragraph after the quote
    expect(baseEditor.children).toEqual([
      {
        type: 'quote',
        children: [
          {
            type: 'text',
            text: 'Some quote',
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: '',
          },
        ],
      },
    ]);
  });

  it('disables modifiers when creating a new node with enter key at the end of a quote', () => {
    const baseEditor = createEditor();
    baseEditor.children = [
      {
        type: 'quote',
        children: [
          {
            type: 'text',
            text: 'Some quote',
            bold: true,
            italic: true,
          },
        ],
      },
    ];

    Transforms.select(baseEditor, {
      anchor: Editor.end(baseEditor, []),
      focus: Editor.end(baseEditor, []),
    });

    // Bold and italic should be enabled
    expect(Editor.marks(baseEditor)).toEqual({ bold: true, italic: true, type: 'text' });

    // Simulate the enter key then user typing
    quoteBlocks.quote.handleEnterKey?.(baseEditor);

    // Once on the new line, bold and italic should be disabled
    expect(Editor.marks(baseEditor)).toEqual({ type: 'text' });
  });
});
