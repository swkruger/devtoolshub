'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Separator } from '@/components/ui/separator'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Code2,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function TipTapEditor({ value, onChange, placeholder = "Start writing...", className }: TipTapEditorProps) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-x-auto my-4',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-blue-500 pl-4 my-4 italic bg-gray-50 dark:bg-gray-900 p-4 rounded',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-0 border-t-2 border-gray-200 dark:border-gray-600 my-6',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'blog-content focus:outline-none min-h-[300px] p-4',
      },
    },
    immediatelyRender: false,
  })

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkDialogOpen(false)
    }
  }

  const addImage = () => {
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run()
      setImageUrl('')
      setImageAlt('')
      setIsImageDialogOpen(false)
    }
  }



  const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor.chain().focus().setTextAlign(align).run()
  }

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run()
  }

  const MenuButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 w-8 p-0",
        isActive && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      )}
      title={title}
    >
      {children}
    </Button>
  )

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Inline Code"
          >
            <Code className="h-4 w-4" />
          </MenuButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => setHeading(1)}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setHeading(2)}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setHeading(3)}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => setTextAlign('left')}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setTextAlign('center')}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setTextAlign('right')}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => setTextAlign('justify')}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </MenuButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Media & Advanced */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => setIsLinkDialogOpen(true)}
            isActive={editor.isActive('link')}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => setIsImageDialogOpen(true)}
            title="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </MenuButton>

          

          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <Code2 className="h-4 w-4" />
          </MenuButton>

          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* History */}
        <div className="flex items-center gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>

      

       {/* Link Dialog */}
       {isLinkDialogOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div 
             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
             onClick={() => setIsLinkDialogOpen(false)}
           />
           <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
             <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
               <h2 className="text-lg font-semibold">Add Link</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsLinkDialogOpen(false)}
                 className="h-8 w-8 p-0"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                 <label className="text-sm font-medium">URL</label>
                 <Input
                   value={linkUrl}
                   onChange={(e) => setLinkUrl(e.target.value)}
                   placeholder="https://example.com"
                   onKeyDown={(e) => e.key === 'Enter' && addLink()}
                 />
               </div>
               <div className="flex gap-2">
                 <Button onClick={addLink}>Add Link</Button>
                 <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                   Cancel
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Image Dialog */}
       {isImageDialogOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center">
           <div 
             className="fixed inset-0 bg-black/50 backdrop-blur-sm"
             onClick={() => setIsImageDialogOpen(false)}
           />
           <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
             <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
               <h2 className="text-lg font-semibold">Add Image</h2>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsImageDialogOpen(false)}
                 className="h-8 w-8 p-0"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             <div className="p-6 space-y-4">
               <div>
                 <label className="text-sm font-medium">Image URL</label>
                 <Input
                   value={imageUrl}
                   onChange={(e) => setImageUrl(e.target.value)}
                   placeholder="https://example.com/image.jpg"
                 />
               </div>
               <div>
                 <label className="text-sm font-medium">Alt Text</label>
                 <Input
                   value={imageAlt}
                   onChange={(e) => setImageAlt(e.target.value)}
                   placeholder="Description of the image"
                 />
               </div>
               <div className="flex gap-2">
                 <Button onClick={addImage}>Add Image</Button>
                 <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                   Cancel
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }
