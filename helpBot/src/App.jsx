import React from 'react';
import WebScrapper from "./Component/WebScrapper"

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import FileExtractor from './Component/FileExtractor';
import PrivateRoute from './AuthContext/PrivateRoute';
import Login from './AuthContext/Login';
import Register from './AuthContext/Register';
import LogOut from './AuthContext/LogOut';
import ImageComponent from './Component/ImageComponent/ImageComponent';

const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/WebScrapper" element={<PrivateRoute><WebScrapper /></PrivateRoute>} />
        <Route path="/fileupload" element={<PrivateRoute><FileExtractor /></PrivateRoute>} />  
        <Route path="/image" element={<PrivateRoute><ImageComponent /></PrivateRoute>} />  

        <Route path="/logout" element={<PrivateRoute><LogOut /></PrivateRoute>} />

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </Router>
    </>
    
    
  )
}

export default App

