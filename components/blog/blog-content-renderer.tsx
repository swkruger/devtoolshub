import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { cn } from '@/lib/utils'

interface BlogContentRendererProps {
  content: string
  isMarkdown?: boolean
  className?: string
  maxLength?: number
  showReadMore?: boolean
}

// Configure marked for consistent output
marked.setOptions({
  gfm: true,
  breaks: true
})

// Enhanced DOMPurify configuration for blog content
const BLOG_CONTENT_CONFIG = {
  USE_PROFILES: { html: true },
  ALLOWED_TAGS: [
    // Basic text formatting
    'p', 'br', 'hr', 'div', 'span',
    // Headers
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    // Text styling
    'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'small',
    // Code
    'code', 'pre', 'kbd', 'samp', 'var',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Links and media
    'a', 'img', 'figure', 'figcaption',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'caption', 'colgroup', 'col',
    // Blockquotes
    'blockquote', 'cite',
    // Other
    'abbr', 'acronym', 'address', 'article', 'aside', 'details', 'summary', 'time'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'title', 'width', 'height', 'class', 'id', 'style',
    'target', 'rel', 'datetime', 'cite', 'data-*'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'select', 'textarea'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onresize', 'onabort', 'onbeforeunload', 'onerror', 'onhashchange', 'onmessage', 'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpopstate', 'onstorage', 'oncontextmenu', 'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onwheel']
}

export function BlogContentRenderer({ 
  content, 
  isMarkdown = false, 
  className = "",
  maxLength,
  showReadMore = false 
}: BlogContentRendererProps) {
  if (!content) {
    return <div className="text-gray-500 dark:text-gray-400 italic">No content available</div>
  }

  try {
    // Convert markdown to HTML if needed
    const html = isMarkdown ? marked.parse(content) as string : content
    
    // Sanitize the HTML
    const sanitized = DOMPurify.sanitize(html, BLOG_CONTENT_CONFIG) as string
    
    // Truncate content if maxLength is specified
    let processedContent = sanitized
    if (maxLength && typeof window !== 'undefined') {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = sanitized
      const textContent = tempDiv.textContent || tempDiv.innerText || ''
      
      if (textContent.length > maxLength) {
        // Find the last complete word within maxLength
        const truncated = textContent.substring(0, maxLength).replace(/\s+\S*$/, '')
        processedContent = `<p>${truncated}${showReadMore ? '...' : ''}</p>`
      }
    }

    return (
      <div 
        className={cn(
          "blog-content",
          className
        )}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    )
  } catch (error) {
    console.error('Error rendering blog content:', error)
    // Fallback to plain text
    const plainText = content.replace(/<[^>]*>/g, '').substring(0, maxLength || 200)
    return (
      <div className={cn("text-gray-700 dark:text-gray-300", className)}>
        {plainText}{maxLength && content.length > maxLength ? '...' : ''}
      </div>
    )
  }
}

// Specialized component for blog previews (shorter content)
export function BlogPreviewRenderer({ content, isMarkdown = false, className = "" }: BlogContentRendererProps) {
  return (
    <BlogContentRenderer
      content={content}
      isMarkdown={isMarkdown}
      className={cn("blog-content-preview", className)}
      maxLength={150}
      showReadMore={true}
    />
  )
}

// Specialized component for featured blog previews (medium content)
export function FeaturedBlogPreviewRenderer({ content, isMarkdown = false, className = "" }: BlogContentRendererProps) {
  return (
    <BlogContentRenderer
      content={content}
      isMarkdown={isMarkdown}
      className={cn("blog-content-featured", className)}
      maxLength={300}
      showReadMore={true}
    />
  )
}
