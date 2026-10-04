import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import Prism from 'prismjs';
import 'highlight.js/styles/github-dark.css';
import 'prismjs/themes/prism-tomorrow.css';
import './App.css';

export default function App() {
  const highlightedCodeRef = useRef(null);
  const [code, setCode] = useState('');
  const [review, setReview] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const highlightedCode = Prism.highlight(code || ' ', Prism.languages.javascript, 'javascript');

  function syncHighlightScroll(event) {
    if (highlightedCodeRef.current) {
      highlightedCodeRef.current.scrollTop = event.currentTarget.scrollTop;
      highlightedCodeRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  }

  async function handleReviewClick() {
    if (!code.trim()) {
      setError('Paste some code to review first.');
      setReview('');
      return;
    }

    setIsLoading(true);
    setError('');
    setReview('');

    try {
      const response = await fetch('/ai/get-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'The review request failed.');
      }

      setReview(result.review || 'The review completed without any text output.');
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the review API.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      
      {/* LEFT SIDE: CODE EDITOR */}
      <div style={styles.editorPanel}>
        <div style={styles.editorHeader}>
          <span style={styles.iconMark} aria-hidden="true">{'</>'}</span>
          <span style={styles.headerText}>Source Code</span>
        </div>
        
        {/* Enclosed in a wrapper to completely lock layout size bounds */}
        <div style={styles.textareaWrapper}>
          <pre
            ref={highlightedCodeRef}
            className="editor-highlight language-javascript"
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
          <textarea 
            placeholder="// Paste or write your code here..."
            style={styles.textarea} 
            spellCheck="false" 
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onScroll={syncHighlightScroll}
          />
        </div>
        
        <button style={{ ...styles.reviewButton, ...(isLoading ? styles.disabledButton : {}) }} onClick={handleReviewClick} disabled={isLoading}>
          <span style={styles.playMark} aria-hidden="true">&gt;</span>
          {isLoading ? 'Reviewing...' : 'Review Code'}
        </button>
      </div>

      {/* RIGHT SIDE: AI REVIEW OUTPUT */}
      <div style={styles.reviewPanel}>
        <div style={styles.editorHeader}>
          <span style={styles.insightMark} aria-hidden="true">*</span>
          <span style={styles.headerText}>AI Analysis & Feedback</span>
        </div>
        
        <div style={styles.outputContainer}>
          {error ? <div style={styles.errorText} role="alert">{error}</div> : null}
          {review ? <div className="markdown-body"><ReactMarkdown rehypePlugins={[rehypeHighlight]}>{review}</ReactMarkdown></div> : null}
          {!error && !review ? <div style={styles.placeholderText}>
            {isLoading ? 'Analyzing your code...' : 'Your code review will appear here.'}
          </div> : null}
        </div>
      </div>

    </div>
  );
}

// Fixed Layout Styling System
const styles = {
  container: {
    display: 'flex',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden', // Completely locks the whole page from ever scrolling
  },
  editorPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #334155',
    position: 'relative',
    backgroundColor: '#090d16',
    height: '100%',
    overflow: 'hidden', // Prevents left side panel from leaking out bounds
  },
  textareaWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  textarea: {
    flex: 1,
    backgroundColor: 'transparent',
    color: 'transparent',
    WebkitTextFillColor: 'transparent',
    caretColor: '#f8fafc',
    fontFamily: 'Courier New, Courier, monospace',
    fontSize: '15px',
    padding: '20px',
    border: 'none',
    outline: 'none',
    resize: 'none',
    lineHeight: '1.6',
    overflowY: 'auto', // 👈 NATIVE VERTICAL SCROLL: Only scrolls locally when text lines overflow the editor height
    whiteSpace: 'pre',
    overflowX: 'auto',
    position: 'relative',
    zIndex: 1,
    cursor: 'text',
  },
  reviewPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#1e1e1e',
    height: '100%',
    overflow: 'hidden', // Prevents right side panel from leaking out bounds
  },
  outputContainer: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto', // 👈 NATIVE SCROLL: Only scrolls locally when the AI feedback markdown length overflows
  },
  editorHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#111827',
    borderBottom: '1px solid #334155',
    flexShrink: 0, // Prevents headers from squishing down smaller when code gets long
  },
  iconMark: {
    color: '#9ca3af',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: '700',
  },
  playMark: {
    display: 'inline-grid',
    placeItems: 'center',
    width: '16px',
    marginRight: '8px',
    fontWeight: '700',
  },
  insightMark: {
    color: '#a855f7',
    fontSize: '20px',
    lineHeight: '16px',
    width: '16px',
    textAlign: 'center',
  },
  headerText: {
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#9ca3af',
  },
  reviewButton: {
    display: 'flex',
    alignItems: 'center',
    alignSelf: 'flex-end',
    margin: '12px 20px',
    backgroundColor: '#e0e7ff',
    color: '#1e1b4b',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
    transition: 'all 0.2s',
  },
  disabledButton: {
    opacity: 0.65,
    cursor: 'wait',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: '14px',
    lineHeight: '1.6',
    overflowWrap: 'anywhere',
  },
  placeholderText: {
    color: '#64748b',
    fontSize: '15px',
    textAlign: 'center',
    marginTop: '40px',
    lineHeight: '1.5',
  }
};

