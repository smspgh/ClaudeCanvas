import { useRef, useState, useEffect, useCallback } from 'react';
import type { RichTextEditorComponent, DataModel } from '@claude-canvas/core';
import { getByPointer } from '@claude-canvas/core';

type ToolbarItem = 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'list' | 'link' | 'image' | 'code';

const DEFAULT_TOOLBAR: ToolbarItem[] = ['bold', 'italic', 'underline', 'heading', 'list', 'link', 'code'];

export interface CcRichTextEditorProps {
  component: RichTextEditorComponent;
  dataModel: DataModel;
  onInput?: (path: string, value: unknown) => void;
}

export function CcRichTextEditor({ component, dataModel, onInput }: CcRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const value = (() => {
    const v = getByPointer(dataModel, component.valuePath);
    return typeof v === 'string' ? v : '';
  })();

  const toolbar = component.toolbar || DEFAULT_TOOLBAR;
  const minHeight = component.minHeight || 150;

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strike');
    if (document.queryCommandState('insertUnorderedList')) formats.add('list');
    setActiveFormats(formats);
  }, []);

  const emitChange = useCallback(() => {
    if (editorRef.current && onInput) {
      onInput(component.valuePath, editorRef.current.innerHTML);
    }
  }, [component.valuePath, onInput]);

  const execCommand = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    updateActiveFormats();
    emitChange();
  }, [updateActiveFormats, emitChange]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  useEffect(() => {
    const handler = () => updateActiveFormats();
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [updateActiveFormats]);

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleStrike = () => execCommand('strikeThrough');

  const handleHeading = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const parent = container.nodeType === Node.TEXT_NODE ? container.parentElement : container as Element;

      if (parent?.closest('h1')) {
        execCommand('formatBlock', 'h2');
      } else if (parent?.closest('h2')) {
        execCommand('formatBlock', 'h3');
      } else if (parent?.closest('h3')) {
        execCommand('formatBlock', 'p');
      } else {
        execCommand('formatBlock', 'h1');
      }
    }
  };

  const handleList = () => execCommand('insertUnorderedList');

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const handleImage = () => {
    const url = prompt('Enter image URL:');
    if (url) execCommand('insertImage', url);
  };

  const handleCode = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const selectedText = selection.toString();
      if (selectedText) {
        const code = document.createElement('code');
        code.textContent = selectedText;
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(code);
        emitChange();
      }
    }
  };

  const labels: Record<ToolbarItem, string> = {
    bold: 'B', italic: 'I', underline: 'U', strike: 'S',
    heading: 'H', list: '☰', link: '🔗', image: '🖼', code: '</>'
  };

  const handlers: Record<ToolbarItem, () => void> = {
    bold: handleBold, italic: handleItalic, underline: handleUnderline, strike: handleStrike,
    heading: handleHeading, list: handleList, link: handleLink, image: handleImage, code: handleCode
  };

  const formatItems = toolbar.filter(t => ['bold', 'italic', 'underline', 'strike'].includes(t));
  const blockItems = toolbar.filter(t => ['heading', 'list'].includes(t));
  const insertItems = toolbar.filter(t => ['link', 'image', 'code'].includes(t));

  const renderButton = (item: ToolbarItem) => (
    <button
      key={item}
      className={`cc-rte-btn ${activeFormats.has(item) ? 'active' : ''}`}
      onClick={handlers[item]}
      title={item.charAt(0).toUpperCase() + item.slice(1)}
    >
      {labels[item]}
    </button>
  );

  return (
    <div className={`cc-rich-text-editor ${component.disabled ? 'disabled' : ''}`}>
      <div className="cc-rte-toolbar">
        {formatItems.map(renderButton)}
        {formatItems.length > 0 && blockItems.length > 0 && <div className="cc-rte-divider" />}
        {blockItems.map(renderButton)}
        {blockItems.length > 0 && insertItems.length > 0 && <div className="cc-rte-divider" />}
        {insertItems.map(renderButton)}
      </div>
      <div
        ref={editorRef}
        className="cc-rte-content"
        contentEditable={!component.disabled}
        data-placeholder={component.placeholder || 'Start typing...'}
        style={{ minHeight }}
        onInput={() => { updateActiveFormats(); emitChange(); }}
      />
    </div>
  );
}
