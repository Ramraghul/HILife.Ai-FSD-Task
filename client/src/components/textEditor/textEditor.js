    import React, { useState, useRef } from 'react';
    import { Editor, EditorState, RichUtils, getDefaultKeyBinding, convertToRaw } from 'draft-js';
    import 'draft-js/dist/Draft.css';
    import './textEditor.css';
    import draftToHtml from 'draftjs-to-html';

    function TextEditor({ onChange }) {
        const [editorState, setEditorState] = useState(EditorState.createEmpty());
        const editorRef = useRef(null);

        const handleKeyCommand = (command) => {
            const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
                setEditorState(newState);
                return 'handled';
            }
            return 'not-handled';
        };

        const mapKeyToEditorCommand = (e) => {
            if (e.keyCode === 9) {
                const newEditorState = RichUtils.onTab(
                    e,
                    editorState,
                    4,
                );
                if (newEditorState !== editorState) {
                    setEditorState(newEditorState);
                }
                return;
            }
            return getDefaultKeyBinding(e);
        };

        const handleEditorChange = (newEditorState) => {
            setEditorState(newEditorState);
            const contentState = newEditorState.getCurrentContent();
            const rawContentState = convertToRaw(contentState);
            const htmlContent = draftToHtml(rawContentState);
            onChange(htmlContent);
        };

        const toggleBlockType = (blockType) => {
            setEditorState(RichUtils.toggleBlockType(editorState, blockType));
        };

        const toggleInlineStyle = (inlineStyle) => {
            setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
        };

        const focusEditor = () => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        };

        let className = 'RichEditor-editor';
        if (!editorState.getCurrentContent().hasText()) {
            const blockType = editorState.getCurrentContent().getBlockMap().first().getType();
            if (blockType !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
            <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={toggleInlineStyle}
                />
                <div className={className} onClick={focusEditor}>
                    <Editor
                        editorState={editorState}
                        handleKeyCommand={handleKeyCommand}
                        keyBindingFn={mapKeyToEditorCommand}
                        onChange={handleEditorChange}
                        placeholder="Start here..."
                        ref={editorRef}
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }

    const BlockStyleControls = ({ editorState, onToggle }) => {
        const selection = editorState.getSelection();
        const blockType = editorState
            .getCurrentContent()
            .getBlockForKey(selection.getStartKey())
            .getType();

        return (
            <div className="RichEditor-controls">
                {BLOCK_TYPES.map((type) => (
                    <StyleButton
                        key={type.label}
                        active={type.style === blockType}
                        label={type.label}
                        onToggle={onToggle}
                        style={type.style}
                    />
                ))}
            </div>
        );
    };

    const INLINE_STYLES = [
        { label: 'Bold', style: 'BOLD' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' },
        { label: 'Monospace', style: 'CODE' },
    ];

    const InlineStyleControls = ({ editorState, onToggle }) => {
        const currentStyle = editorState.getCurrentInlineStyle();

        return (
            <div className="RichEditor-controls">
                {INLINE_STYLES.map((type) => (
                    <StyleButton
                        key={type.label}
                        active={currentStyle.has(type.style)}
                        label={type.label}
                        onToggle={onToggle}
                        style={type.style}
                    />
                ))}
            </div>
        );
    };

    const StyleButton = ({ active, label, onToggle, style }) => {
        let className = 'RichEditor-styleButton';
        if (active) {
            className += ' RichEditor-activeButton';
        }

        const onButtonClick = (e) => {
            e.preventDefault();
            onToggle(style);
        };

        return (
            <span className={className} onMouseDown={onButtonClick}>
                {label}
            </span>
        );
    };

    const BLOCK_TYPES = [
        { label: 'H1', style: 'header-one' },
        { label: 'H2', style: 'header-two' },
        { label: 'H3', style: 'header-three' },
        { label: 'H4', style: 'header-four' },
        { label: 'H5', style: 'header-five' },
        { label: 'H6', style: 'header-six' },
        { label: 'Blockquote', style: 'blockquote' },
        { label: 'UL', style: 'unordered-list-item' },
        { label: 'OL', style: 'ordered-list-item' },
        { label: 'Code Block', style: 'code-block' },
    ];

    export default TextEditor;
