// CodeEditorArea.js
import React from "react";
import Editor from "@monaco-editor/react";

const CodeEditorArea = ({ language, code, handleEditorChange, title = "Code Editor" }) => {
  return (
    <div className="editor-container" style={containerStyle}>
      <div className="editor-header" style={headerStyle}>
        {title}
      </div>
      <Editor
        height="400px"
        defaultLanguage={language}
        value={code}
        onChange={handleEditorChange}
        theme="vs-dark"
        options={{
          fontSize: 14,
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: true,
        }}
      />
    </div>
  );
};

const containerStyle = {
  border: "1px solid #333",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
};

const headerStyle = {
  backgroundColor: "#1e1e1e",
  color: "#fff",
  padding: "10px",
  fontSize: "16px",
  fontWeight: "bold",
  borderBottom: "1px solid #333",
};

export default CodeEditorArea;
