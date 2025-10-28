import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

// Configure markdown-it
const md = new MarkdownIt({
  html: false,         // don’t allow raw HTML from model
  linkify: true,
  breaks: true
})
  .disable(['table'])  // optional: enable later if you like tables
  .use((md) => {
    // Open external links in new tab
    const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const aIndex = tokens[idx].attrIndex('target')
      if (aIndex < 0) tokens[idx].attrPush(['target', '_blank'])
      else tokens[idx].attrs![aIndex][1] = '_blank'
      tokens[idx].attrPush(['rel', 'noopener noreferrer'])
      return defaultRender(tokens, idx, options, env, self)
    }
  })

export function renderMarkdownSafe(text: string): string {
  const html = md.render(text || '')
  // Sanitize to prevent XSS
  return DOMPurify.sanitize(html)
}
