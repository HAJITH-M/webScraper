  import React, { useEffect, useState } from 'react';
  import { AiOutlineMenu, AiOutlineHome, AiOutlineCamera, AiOutlineFile, AiOutlineGlobal, AiOutlineRobot } from 'react-icons/ai';
  import * as jwt_decode from 'jwt-decode'; // Changed import syntax
import { useNavigate } from 'react-router-dom';

  const CircleMenuComponent = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const navigate = useNavigate();
   
    useEffect(() => {
      const handleClickOutside = (event) => {
        const menu = document.getElementById('circle-menu');
        if (menu && !menu.contains(event.target) && isOpen) {
          setIsOpen(false);
          setIsClicked(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const menuItems = [
      { icon: <AiOutlineHome className="cursor-pointer" />, label: 'ZaraX Hub', path: '/' },
      { icon: <AiOutlineCamera className="cursor-pointer" />, label: 'Image Wizard', path: '/imagegeneration' },
      { icon: <AiOutlineFile className="cursor-pointer" />, label: 'File Master', path: '/fileupload' },
      { icon: <AiOutlineGlobal className="cursor-pointer" />, label: 'Web Scraper', path: '/WebScrapper' },
      { icon: <AiOutlineRobot className="cursor-pointer" />, label: 'Chat Assistant', path: '/chatbot' }
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
          id="circle-menu"
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
  <div
    key={index}
    className="w-14 h-14 bg-gradient-to-br from-white to-gray-100 shadow-lg hover:shadow-xl flex items-center justify-center text-purple-500 hover:text-pink-500 rounded-full transform hover:scale-110 transition-all duration-300 group relative"
    style={{ 
      transitionDelay: `${index * 0.1}s`
    }}
  >
    <div onClick={() => navigate(item.path)} className="text-2xl cursor-pointer">
      {item.icon}
    </div>
    <span className="absolute right-16 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg whitespace-nowrap transform group-hover:translate-x-1">
      {item.label}
    </span>
  </div>
))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  export default CircleMenuComponent;