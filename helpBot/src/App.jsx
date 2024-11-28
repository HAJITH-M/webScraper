import React from 'react';
import WebScrapper from "./Component/WebScrapper"

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import FileExtractor from './Component/FileExtractor';

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<WebScrapper />} />
        <Route path="/fileupload" element={<FileExtractor />} />  
      </Routes>
    </Router>
    </>
    
    
  )
}

export default App

