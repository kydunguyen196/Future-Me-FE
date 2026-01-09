import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Button } from './button';
import { Popover } from './popover';
//@ts-ignore:LinkIcon is not used
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Palette } from 'lucide-react';

interface TextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  className = ''
}) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[100px] p-3 text-left',
        placeholder: placeholder,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`border border-gray-200 rounded-md ${className}`}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-2 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        {/* Color Picker */}
        <Popover
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <Palette className="h-4 w-4" />
              <div 
                className="w-4 h-4 border border-gray-300 rounded"
                style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
              />
            </Button>
          }
          content={
            <div className="p-5 w-96 bg-white shadow-xl">
              <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Text Color
              </div>
              
              {/* Color Palette */}
              <div className="space-y-4">
                {/* Standard Colors */}
                <div>
                  <div className="text-xs text-gray-500 mb-3 font-medium">Standard Colors</div>
                  <div className="grid grid-cols-8 gap-2.5">
                    {[
                      { color: '#000000', name: 'Black' },
                      { color: '#FFFFFF', name: 'White' },
                      { color: '#374151', name: 'Gray Dark' },
                      { color: '#6B7280', name: 'Gray' },
                      { color: '#9CA3AF', name: 'Gray Light' },
                      { color: '#D1D5DB', name: 'Gray Lighter' },
                      { color: '#F3F4F6', name: 'Gray Lightest' },
                      { color: '#1F2937', name: 'Charcoal' },
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        type="button"
                        title={name}
                        className={`w-9 h-9 rounded-lg border-2 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md ${
                          color === '#FFFFFF' ? 'border-gray-300' : 'border-gray-200'
                        } ${
                          editor.getAttributes('textStyle').color === color 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                          setColorPickerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Theme Colors */}
                <div>
                  <div className="text-xs text-gray-500 mb-3 font-medium">Theme Colors</div>
                  <div className="grid grid-cols-8 gap-2.5">
                    {[
                      { color: '#EF4444', name: 'Red' },
                      { color: '#DC2626', name: 'Red Dark' },
                      { color: '#F97316', name: 'Orange' }, 
                      { color: '#EA580C', name: 'Orange Dark' },
                      { color: '#EAB308', name: 'Yellow' },
                      { color: '#CA8A04', name: 'Yellow Dark' },
                      { color: '#22C55E', name: 'Green' },
                      { color: '#16A34A', name: 'Green Dark' },
                      { color: '#06B6D4', name: 'Cyan' },
                      { color: '#0891B2', name: 'Cyan Dark' },
                      { color: '#3B82F6', name: 'Blue' },
                      { color: '#2563EB', name: 'Blue Dark' },
                      { color: '#6366F1', name: 'Indigo' },
                      { color: '#4F46E5', name: 'Indigo Dark' },
                      { color: '#8B5CF6', name: 'Purple' },
                      { color: '#7C3AED', name: 'Purple Dark' },
                      { color: '#EC4899', name: 'Pink' },
                      { color: '#DB2777', name: 'Pink Dark' },
                      { color: '#F59E0B', name: 'Amber' },
                      { color: '#D97706', name: 'Amber Dark' },
                      { color: '#10B981', name: 'Emerald' },
                      { color: '#059669', name: 'Emerald Dark' },
                      { color: '#8B5A2B', name: 'Brown' },
                      { color: '#92400E', name: 'Brown Dark' },
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        type="button"
                        title={name}
                        className={`w-9 h-9 rounded-lg border-2 border-gray-200 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md ${
                          editor.getAttributes('textStyle').color === color 
                            ? 'ring-2 ring-blue-500 ring-offset-2' 
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          editor.chain().focus().setColor(color).run();
                          setColorPickerOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Custom Color & Actions */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">Custom Color:</label>
                      <div className="relative">
                        <input
                          type="color"
                          className="w-12 h-10 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors shadow-sm"
                          onChange={(e) => {
                            editor.chain().focus().setColor(e.target.value).run();
                          }}
                        />
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-sm px-4 py-2 h-10 bg-gray-50 hover:bg-gray-100 border-gray-200 shadow-sm"
                      onClick={() => {
                        editor.chain().focus().unsetColor().run();
                        setColorPickerOpen(false);
                      }}
                    >
                      <span className="mr-2">↺</span>
                      Reset Color
                    </Button>
                  </div>
                </div>

                {/* Current Color Display */}
                {editor.getAttributes('textStyle').color && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 font-medium">Current Color:</span>
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: editor.getAttributes('textStyle').color }}
                      />
                      <span className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {editor.getAttributes('textStyle').color}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          }
          open={colorPickerOpen}
          onOpenChange={setColorPickerOpen}
          placement="bottom"
        />
      </div>
      
      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="min-h-[100px]"
        style={{ textAlign: 'left' }}
      />
    </div>
  );
};

export default TextEditor; 