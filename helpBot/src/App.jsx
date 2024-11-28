

// const App = () => {
//   return (
//     // <WebScraper/>
//     // <FileExtractor/>
//   )
// }

// export default App

// src/App.jsx
import React, { useState } from "react";
import FileUpload from "./Component/FileExtractor";
// import FileUpload from "./components/FileUpload";

const App = () => {
  const [fileText, setFileText] = useState("");

  const handleFileProcessed = (text) => {
    setFileText(text);
  };

  return (
    <div>
      <h1>Chatbot with Document Upload</h1>
      <FileUpload onFileProcessed={handleFileProcessed} />
      <div>
        <h2>Extracted Text</h2>
        <pre>{fileText}</pre>
      </div>
    </div>
  );
};

export default App;
