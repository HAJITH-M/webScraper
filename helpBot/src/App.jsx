import React from 'react';
import WebScrapper from "./Component/WebScrapper"
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import FileExtractor from './Component/FileExtractor';
import PrivateRoute from './AuthContext/PrivateRoute';
import Login from './AuthContext/Login';
import Register from './AuthContext/Register';
import LogOut from './AuthContext/LogOut';
import ImageComponent from './Component/ImageComponent/ImageComponent';
import ChatBot from './Component/ChatBot/ChatBot';
import HomeComponent from './Component/HomeComponent/HomeComponent';
import CircleMenuComponent from './Component/CircleMenuComponent/CircleMenuComponent';
import ErrorComponent from './Component/ErrorComponent/ErrorComponent';


const App = () => {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<><HomeComponent /> <CircleMenuComponent/> </>} />
        <Route path="/WebScrapper" element={<PrivateRoute><><WebScrapper /> <CircleMenuComponent/> </></PrivateRoute>} />
        <Route path="/fileupload" element={<PrivateRoute><><FileExtractor /> <CircleMenuComponent/></> </PrivateRoute>} />  
        <Route path="/imagegeneration" element={<PrivateRoute><><ImageComponent /> <CircleMenuComponent/></> </PrivateRoute>} />  
        <Route path="/chatbot" element={<PrivateRoute><><ChatBot /> <CircleMenuComponent/></> </PrivateRoute>} />  
        <Route path="/logout" element={<PrivateRoute><LogOut /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* error page */}
        <Route path="*" element={<ErrorComponent/>} />
      </Routes>
    </Router>
    </>
    
    
  )
}

export default App