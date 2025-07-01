'use client';
import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

export default function TiptapEditor({ value = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,                       // must stay first to register lists etc.
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="border rounded p-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'B', cmd: 'toggleBold', isActive: 'bold' },
          { label: 'I', cmd: 'toggleItalic', isActive: 'italic' },
          { label: 'U', cmd: 'toggleUnderline', isActive: 'underline' },
        ].map(btn => (
          <button
            key={btn.label}
            type="button"
            onClick={() => editor.chain().focus()[btn.cmd]().run()}
            className={`px-2 py-1 rounded ${
              editor.isActive(btn.isActive) ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('bulletList') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >• List</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('orderedList') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >1. List</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('blockquote') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >❝ Quote</button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive('codeBlock') ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >{'</>'} Code</button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className="px-2 py-1 rounded bg-gray-200"
        >🔗 Link</button>
        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="px-2 py-1 rounded bg-gray-200"
        >🖼️ Image</button>
      </div>
      <EditorContent editor={editor} className="min-h-[150px] border rounded p-2" />
    </div>
  );
}
