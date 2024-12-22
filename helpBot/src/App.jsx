import React, { useEffect, useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {

    const initializeApp = async () => {



      setTimeout(async () => {
        setIsLoading(false);
        await SplashScreen.hide();
      }, 3000);
    };

    initializeApp();


    let lastTimeBackPress = 0;
    
    const handleBackButton = async () => {
      if (window.location.pathname === '/') {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastTimeBackPress < 2000) {
          await CapacitorApp.exitApp();
        } else {
          lastTimeBackPress = currentTime;

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


  if (isLoading) {

    return (
      <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
        <div className="w-full relative">
          <div className="relative px-4 sm:px-6 py-6 sm:py-12 mx-auto max-w-7xl">
            <div className="text-center mb-8 sm:mb-16 animate-pulse">
              <div className="h-16 bg-gray-700 rounded-lg mb-6"></div>
              <div className="h-4 bg-gray-700 rounded max-w-3xl mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center px-4">
              <div className="space-y-6 sm:space-y-8 animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item, index) => (
                    <div key={index} className="h-4 bg-gray-700 rounded w-1/2"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-700 rounded w-1/3"></div>
              </div>
              <div className="relative mt-8 md:mt-0 animate-pulse">
                <div className="bg-gray-700 rounded-2xl h-64"></div>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4 animate-pulse">
              {[1, 2, 3, 4].map((item, index) => (
                <div key={index} className="h-48 bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <Route path="*" element={<ErrorComponent />} />
      </Routes>
    </Router>
  );
};

export default App;