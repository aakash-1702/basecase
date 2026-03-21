"use client";
import React from "react";

import { useState } from "react";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  initialCode ? : string,
  problemId ? : string,
  onSuccess ? : () => void,

}

const CodeEditor = ({initialCode , problemId , onSuccess} : CodeEditorProps) => {
  const [language, setLanguage] = useState("cpp");
  const [codeData, setCodeData] = useState<string>(initialCode ?? "// Start coding here");
  const [running , setRunning] = useState(false);
  const [output , setOutput] = useState<string | null>(null);
  const [outputType , setOutputType] = useState<"success" | "error">("success");
  const handleDataChange = (value: any, event: any) => {
    setCodeData(value); // this value is the code inside the editor
  };
  return (
    <div>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="cpp">C++</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
      </select>
      <Editor
        height="450px"
        language={language}
        value={codeData}
        onChange={handleDataChange} // gives the data inside the model as first parameter
        loading={<div> Editor is Loading , ruk jaa</div>} // this is for the laoding time , as monaco editor takes 1-2 secons before actually loading
      />
    </div>
  );
};

export default CodeEditor;
