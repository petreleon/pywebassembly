// src/components/CodeEditor.tsx
"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
    initialValue?: string;
    onChange?: (value: string | undefined) => void;
    language?: string;
    theme?: "vs-dark" | "light";
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
    initialValue = "# Write your Python code here\nprint('Hello World')",
    onChange,
    language = "python",
    theme = "vs-dark",
    readOnly = false,
}) => {
    const handleEditorDidMount: OnMount = (editor, monaco) => {
        // here is the editor instance
        // you can store it in `useRef` for more access if needed
    };

    return (
        <div className="h-full w-full min-h-[400px] border border-gray-700 rounded-md overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage={language}
                defaultValue={initialValue}
                theme={theme}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    readOnly: readOnly,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};
