/* eslint-disable no-unreachable */ /* eslint-disable unicorn/prefer-text-content */
<template>
  <div ref="wrapper" class="editor-wrapper">
    <pre
      id="editor"
      ref="editor"
      class="editor line-numbers"
      spellcheck="false"
      contenteditable="true"
      @keydown="onKeyDown"
      @keyup="onKeyUp"
      @paste="onPaste"
    ><code><span class="new-line"></span><br></code></pre>
  </div>
</template>

<script>
import prism from 'prismjs'

export default {
  props: {
    focus: {
      type: Boolean,
      default: false,
    },
    tabSize: {
      type: Number,
      default: 2,
    },
    text: {
      type: String,
      default: '',
    },
    newPaddingChars: {
      type: Array,
      default: () => ['{', '>', ':'],
    },
    selfClosingChars: {
      type: Object,
      default: () => {
        return {
          open: ['{', '(', '['],
          close: ['}', ')', ']'],
        }
      },
    },
  },

  data() {
    return {
      isFirefox: false,
      isChanged: false,
      scrollPadding: 36,
      currentText: '',
    }
  },

  watch: {
    currentText() {
      this.$emit('input', this.currentText)
    },
  },

  mounted() {
    this.isFirefox = navigator.userAgent.toLowerCase().includes('firefox')
    this.$refs.editor.innerHTML = this.highlightText(this.text)
    if (this.focus) this.$refs.editor.focus()
    this.currentText = this.text
  },

  methods: {
    highlightText(text) {
      this.currentText = text
      let h = prism.highlight(text, prism.languages.markup, 'markup')
      if (this.isFirefox) {
        h = h.replace(/\n\r?/g, '<br><span class="new-line"></span>')
      } else {
        h = h.replace(/\n\r?/g, '\n<span class="new-line"></span>')
      }
      return '<code><span class="new-line"></span>' + h + '<br>' + '</code>'
    },

    editorText() {
      if (this.isFirefox) {
        return this.$refs.editor.innerText.replace(/\n$/, '')
      } else {
        return this.$refs.editor.textContent
      }
    },

    highlightEditor() {
      const editor = this.$refs.editor
      const cursor = this.getCursor(editor)
      editor.innerHTML = this.highlightText(this.editorText())
      this.setCursor(editor, cursor)
    },

    scrollToCursor(scrollPadding) {
      const wrapperHeight = parseFloat(getComputedStyle(this.$refs.wrapper).height)
      const editorHeight = parseFloat(getComputedStyle(this.$refs.editor).height)

      if (wrapperHeight - scrollPadding < editorHeight) {
        const s = window.getSelection()
        if (s.anchorNode === this.$refs.editor) {
          return
        }

        let rect

        // some specific cases exists
        if (s.anchorNode.nodeType === Node.TEXT_NODE) {
          rect = s.getRangeAt(0).getClientRects()[0]
        } else {
          const i =
            s.anchorOffset < s.anchorNode.childNodes.length ? s.anchorOffset : s.anchorNode.childNodes.length - 1
          rect = s.anchorNode.childNodes[i].getClientRects()[0]
        }

        const cursorBottom = rect.bottom
        const cursorTop = rect.top
        if (cursorBottom >= wrapperHeight - scrollPadding) {
          // cursor under wrapper
          this.$refs.wrapper.scrollBy(0, cursorBottom - wrapperHeight + scrollPadding)
        } else if (cursorTop < scrollPadding) {
          // cursor above wrapper
          this.$refs.wrapper.scrollBy(0, cursorTop - scrollPadding)
        }
      }
    },
    getCursor(editor) {
      function nodeLength(node) {
        if (node.nodeName === 'BR') return 1
        // eslint-disable-next-line unicorn/prefer-text-content
        return node.nodeType === Node.TEXT_NODE ? node.textContent.length : node.innerText.length
      }

      function prevSiblingsLength(current) {
        let offset = 0
        current = current.previousSibling
        while (current) {
          // eslint-disable-next-line unicorn/prefer-text-content
          offset += nodeLength(current)

          current = current.previousSibling
        }
        return offset
      }

      const s = window.getSelection()
      const r = s.getRangeAt(0)
      let current = r.startContainer
      let offset = r.startOffset

      // start of the editor
      if (r.startContainer === editor && r.startOffset === 0) {
        return 0
      }
      // an empty line with <br> tag, the  offset is count of child nodes
      // calculate real offset
      if (r.startContainer.nodeType !== Node.TEXT_NODE) {
        offset = 0
        let child = r.startContainer.firstChild
        for (let i = 0; i < r.startOffset; i++) {
          // eslint-disable-next-line unicorn/prefer-text-content
          offset += nodeLength(child)

          child = child.nextSibling
        }
      }
      // empty line
      if (r.startContainer === editor) return offset

      // bubble up
      while (current.parentNode !== editor) {
        offset += prevSiblingsLength(current)
        current = current.parentNode
      }

      // <- right to left
      offset += prevSiblingsLength(current)
      return offset
    },
    setCursor(editor, offset) {
      function setSelection(startNode, startOffset) {
        if (startOffset < 0) {
          const r = document.createRange()
          r.selectNodeContents(startNode)
          r.collapse()
          startOffset = r.startOffset
        }
        window.getSelection().setBaseAndExtent(startNode, startOffset, startNode, startOffset)
      }

      function findOffset(node, offset) {
        if (node.nodeType === Node.TEXT_NODE) {
          const length = node.textContent.length
          if (length < offset) {
            return {
              found: false,
              length,
            }
          } else {
            // found
            return {
              found: true,
              node,
              nodeOffset: offset,
              length,
            }
          }
        } else if (node.nodeName === 'BR') {
          // <br>
          const length = 1
          if (length < offset) {
            return {
              found: false,
              length,
            }
          } else {
            // found
            let nodeOffset = 1
            // count siblings
            let sibling = node.previousSibling
            while (sibling) {
              nodeOffset++
              sibling = sibling.previousSibling
            }

            return {
              found: true,
              node: node.parentNode,
              nodeOffset,
              length,
            }
          }
        } else {
          // recursion
          let child = node.firstChild
          let childsLength = 0
          while (child) {
            const result = findOffset(child, offset)
            if (result.found) {
              return result
            }
            offset -= result.length
            childsLength += result.length
            child = child.nextSibling
          }

          return {
            found: false,
            length: childsLength,
          }
        }
      }

      if (offset === 0) {
        setSelection(editor, 0)
        return
      }
      let current = editor.firstChild
      while (current) {
        const { found, node, nodeOffset, length } = findOffset(current, offset)
        if (found) {
          setSelection(node, nodeOffset)
          return
        }
        offset -= length
        current = current.nextSibling
      }
      // not found
      // set cursor to editor's end
      setSelection(editor, -1)
    },
    isSelection() {
      return window.getSelection().type === 'Range'
    },

    onKeyDown(event) {
      function findPadding(text, cursor) {
        let i = cursor
        let j = i
        while (i > 0 && text[i - 1] !== '\n') {
          i--
          if (text[i] !== ' ') {
            j = i
          }
        }
        return j - i
      }

      function getLineOffset(text, cursor) {
        let i = cursor
        let j = 0
        while (i > 0 && text[i - 1] !== '\n') {
          i--
          j++
        }
        return j
      }

      function getPaddingFromCursor(text, cursor) {
        let i = cursor - 1
        let j = 0
        while (i >= 0 && text[i] !== '\n') {
          if (text[i] !== ' ') return 0
          i--
          j++
        }
        return j
      }

      this.isChanged = true
      const editor = this.$refs.editor
      const cursor = this.getCursor(editor)
      const fontSize = parseFloat(getComputedStyle(editor).fontSize)
      if (event.key === 'Enter') {
        // Enter
        if (this.isSelection()) {
          document.execCommand('delete', false)
        }
        event.preventDefault()

        const innerText = this.editorText()
        let padding = findPadding(innerText, cursor)
        if (this.newPaddingChars.includes(innerText[cursor - 1])) {
          padding += this.tabSize
        }

        editor.innerHTML = this.highlightText(
          innerText.substring(0, cursor) + '\n' + ' '.repeat(padding) + innerText.substring(cursor)
        )
        editor.style.height = `${(+editor.firstChild.offsetHeight + fontSize * 2).toFixed(2)}px`
        this.setCursor(editor, cursor + 1 + padding)
        // scrollToCursor
        this.isChanged = false
      } else if (event.key === 'Backspace') {
        // Backspace
        let deleteCount = 1
        if (this.isSelection()) {
          document.execCommand('delete', false)
          deleteCount = 0
        }
        event.preventDefault()
        const s = window.getSelection()
        if (s.anchorNode !== editor) {
          const innerText = this.editorText()

          const paddingToDelete = getPaddingFromCursor(innerText, cursor)
          if (paddingToDelete) {
            deleteCount = paddingToDelete % this.tabSize || this.tabSize
          }

          editor.innerHTML = this.highlightText(
            innerText.substring(0, cursor - deleteCount) + innerText.substring(cursor)
          )
          const fontSize = parseFloat(getComputedStyle(editor).fontSize)
          editor.style.height = `${(+editor.firstChild.offsetHeight + fontSize * 2).toFixed(2)}px`

          this.setCursor(editor, cursor - deleteCount)
        }
        this.isChanged = false
      } else if (event.key === 'Delete') {
        // Delete
        let deleteCount = 1
        if (this.isSelection()) {
          document.execCommand('delete', false)
          deleteCount = 0
        }
        event.preventDefault()

        const innerText = this.editorText()
        editor.innerHTML = this.highlightText(
          innerText.substring(0, cursor) + innerText.substring(cursor + deleteCount)
        )
        const fontSize = parseFloat(getComputedStyle(editor).fontSize)
        editor.style.height = `${(+editor.firstChild.offsetHeight + fontSize * 2).toFixed(2)}px`

        this.setCursor(editor, cursor)
        this.isChanged = false
      } else if (event.key === 'Tab') {
        const innerText = this.editorText()
        const lineOffset = getLineOffset(innerText, cursor)
        const spacesToTab = this.tabSize - (lineOffset % this.tabSize)

        event.preventDefault()
        editor.innerHTML = this.highlightText(
          innerText.substring(0, cursor) + ' '.repeat(spacesToTab) + innerText.substring(cursor)
        )
        this.setCursor(editor, cursor + spacesToTab)
        this.isChanged = false
      } else if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'End', 'Home', 'PageUp', 'PageDown'].includes(event.key)
      ) {
        // Navigation keys
        this.isChanged = false
      } else if (['Alt', 'Shift', 'Control', 'Meta', 'CapsLock', 'Fn', 'Scroll', 'ScrollLock'].includes(event.key)) {
        // Meta keys
        this.isChanged = false
      } else if (this.selfClosingChars.open.includes(event.key)) {
        const i = this.selfClosingChars.open.findIndex((v) => v === event.key)
        event.preventDefault()

        document.execCommand('insertText', false, this.selfClosingChars.open[i] + this.selfClosingChars.close[i])

        this.setCursor(editor, cursor + 1)
      }

      const scrollPadding = fontSize * 4
      this.scrollToCursor(scrollPadding)
    },

    onKeyUp(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) this.isChanged = false
      if (['Alt', 'Shift', 'Control', 'Meta', 'CapsLock', 'Fn', 'Scroll', 'ScrollLock'].includes(event.key)) {
        this.isChanged = false
      }
      if (event.ctrlKey && event.key === 'x') this.isChanged = true

      if (this.isChanged) this.highlightEditor()
      this.isChanged = false
    },

    onPaste(event) {
      event.preventDefault()
      const editor = this.$refs.editor
      if (this.isSelection()) {
        document.execCommand('delete', false)
      }
      const cursor = this.getCursor(editor)
      const innerText = this.editorText()
      const text = event.clipboardData.getData('text/plain')

      editor.innerHTML = this.highlightText(innerText.substring(0, cursor) + text + innerText.substring(cursor))
      const fontSize = parseFloat(getComputedStyle(editor).fontSize)
      editor.style.height = `${(+editor.firstChild.offsetHeight + fontSize * 2).toFixed(2)}px`

      this.setCursor(this.$refs.editor, cursor + text.length)
    },
  },
}
</script>

<style lang="scss" scope>
.editor-wrapper {
  overflow: auto;
  font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
}

.editor *::-moz-selection,
.editor *::selection {
  text-shadow: none;
  // color: var(--prism-editor-selection-text-color);
  background: var(--prism-editor-selection-bg-color);
}

.editor {
  color: var(--prism-editor-text-color);
  background: var(--prism-editor-background-color);
  font-size: 1em;
  text-align: left;
  /* white-space: pre-wrap; */
  word-spacing: normal;
  word-break: normal;
  word-wrap: normal;
  line-height: 1.5;

  -webkit-hyphens: none;
  -moz-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;

  overflow: none;
  white-space: pre-wrap;

  outline: none;
  min-width: 100%;
  min-height: 100%;
}

.editor > code {
  min-width: 100%;
  min-height: 100%;
}

.token.comment {
  color: var(--prism-token-comment-color);
}

.token.prolog {
  color: var(--prism-token-prolog-color);
}

.token.doctype {
  color: var(--prism-token-doctype-color);
}

.token.cdata {
  color: var(--prism-token-cdata-color);
}

.token.punctuation {
  color: var(--prism-token-punctuation-color);
}

.token.namespace {
  color: var(--prism-token-namespace-color);
}

.token.property {
  color: var(--prism-token-tag-color);
}

.token.tag {
  color: var(--prism-token-tag-color);
}

.token.constant {
  color: var(--prism-token-tag-color);
}

.token.symbol {
  color: var(--prism-token-tag-color);
}

.token.deleted {
  color: var(--prism-token-tag-color);
}

.token.boolean {
  color: var(--prism-token-boolean-color);
}

.token.number {
  color: var(--prism-token-number-color);
}

.token.selector {
  color: var(--prism-token-selector-color);
}

.token.attr-name {
  color: var(--prism-token-attr-name-color);
}

.token.string {
  color: var(--prism-token-string-color);
}

.token.char {
  color: var(--prism-token-char-color);
}

.token.builtin {
  color: var(--prism-token-builtin-color);
}

.token.inserted {
  color: var(--prism-token-inserted-color);
}

.token.regex {
  color: var(--prism-token-regex-color);
}

.token.operator {
  color: var(--prism-token-operator-color);
}

.token.url {
  color: var(--prism-token-url-color);
}

.token.entity {
  color: var(--prism-token-entity-color);
}

.token.variable {
  color: var(--prism-token-variable-color);
}

.token.atrule {
  color: var(--prism-token-atrule-color);
}

.token.attr-value {
  color: var(--prism-token-attr-value-color);
}

.token.function {
  color: var(--prism-token-function-color);
}

.token.class-name {
  color: var(--prism-token-class-name-color);
}

.token.keyword {
  color: var(--prism-token-keyword-color);
}

.token.important {
  color: var(--prism-token-important-color);
}

.token.important,
.token.bold {
  font-weight: bold;
}
.token.italic {
  font-style: italic;
}

.token.entity {
  cursor: help;
}

.line-numbers {
  position: relative;
  padding-left: 3.5rem;
  counter-reset: linenumber;
}

.new-line {
  counter-increment: linenumber;
}
.new-line::before {
  color: var(--prism-editor-linenumber-color);
  width: 2rem;
  text-align: right;
  position: absolute;
  left: 1rem;
  content: counter(linenumber);
  padding-right: 0.5rem;
  // border-right: 1px gray solid;
}

.editor > code::before {
  width: 3.2rem;
  background-color: var(--prism-editor-linenumber-bg-color);
  content: ' ';
  display: block;
  height: 100%;
  position: absolute;
  left: 0;
}

.last-line {
  height: 0;
  width: 0;
  user-select: none;
}
</style>
