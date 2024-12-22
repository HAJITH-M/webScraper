import React, { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Toast } from '@capacitor/toast';
import { SplashScreen } from '@capacitor/splash-screen';

import WebScrapper from "./Component/WebScrapper";
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
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
import toast from 'react-hot-toast';


const App = () => {
 

  useEffect(() => {

      // Hide the splash screen after the app is ready
      const hideSplash = async () => {
        await SplashScreen.hide();
      };
  
      hideSplash();
      // Rest of your existing useEffect code...



    let lastTimeBackPress = 0;
    
    const handleBackButton = async () => {
      if (window.location.pathname === '/') {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastTimeBackPress < 2000) {
          await CapacitorApp.exitApp();
        } else {
          lastTimeBackPress = currentTime;
          // Show toast instead of alert
          await Toast.show({
            text: 'Press back again to exit',
            duration: 'short',
            position: 'bottom'
          });
        }
      } else {
        window.history.back();
      }
    };
  
    const backButtonListener = CapacitorApp.addListener('backButton', handleBackButton);
  
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<><HomeComponent /> <CircleMenuComponent /> </>} />
        <Route path="/WebScrapper" element={<PrivateRoute><><WebScrapper /> <CircleMenuComponent /> </></PrivateRoute>} />
        <Route path="/fileupload" element={<PrivateRoute><><FileExtractor /> <CircleMenuComponent /></> </PrivateRoute>} />
        <Route path="/imagegeneration" element={<PrivateRoute><><ImageComponent /> <CircleMenuComponent /></> </PrivateRoute>} />
        <Route path="/chatbot" element={<PrivateRoute><><ChatBot /> <CircleMenuComponent /></> </PrivateRoute>} />
        <Route path="/logout" element={<PrivateRoute><LogOut /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        {/* error page */}
        <Route path="*" element={<ErrorComponent />} />
      </Routes>
    </Router>
  );
};

export default App;