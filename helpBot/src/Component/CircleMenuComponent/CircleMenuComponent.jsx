  import React, { useEffect, useState } from 'react';
  import { AiOutlineMenu, AiOutlineHome, AiOutlineCamera, AiOutlineFile, AiOutlineGlobal, AiOutlineRobot } from 'react-icons/ai';
  import * as jwt_decode from 'jwt-decode'; // Changed import syntax
import { useNavigate } from 'react-router-dom';

  const CircleMenuComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const navigate = useNavigate();
   
    
      
    

    const menuItems = [
      { icon: <AiOutlineHome />, label: 'ZaraX Hub', onClick: () => window.location.href = '/' },
      { icon: <AiOutlineCamera />, label: 'Image Wizard', onClick: () => window.location.href = '/imagegeneration' },
      { icon: <AiOutlineFile />, label: 'File Master', onClick: () => window.location.href = '/fileupload' },
      { icon: <AiOutlineGlobal />, label: 'Web Scraper', onClick: () => window.location.href = '/WebScrapper' },
      { icon: <AiOutlineRobot />, label: 'Chat Assistant', onClick: () => window.location.href = '/chatbot' }
    ];

    const handleMouseEnter = () => {
      if (!isClicked) {
        setIsOpen(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isClicked) {
        setIsOpen(false);
      }
    };

    const handleClick = () => {
      setIsClicked(!isClicked);
      setIsOpen(!isOpen);
    };

    return (
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2">
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button 
            className="w-3 h-40 bg-gradient-to-b from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 rounded-l-lg transition-all duration-500 shadow-lg"
            onClick={handleClick}
          >
            <div className="h-full w-full flex items-center justify-center">
              <div className="w-1 h-20 bg-white/30 rounded-full"></div>
            </div>
          </button>

          <div className={`absolute top-0 right-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="flex flex-col gap-3">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-14 h-14 bg-gradient-to-br from-white to-gray-100 shadow-lg hover:shadow-xl flex items-center justify-center text-purple-500 hover:text-pink-500 rounded-full transform hover:scale-110 transition-all duration-300 group relative cursor-pointer"
                  style={{ 
                    transitionDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="absolute right-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg whitespace-nowrap transform group-hover:translate-x-1">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  export default CircleMenuComponent;