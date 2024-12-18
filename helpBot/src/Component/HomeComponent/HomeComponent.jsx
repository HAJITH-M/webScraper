  import React, { useState, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';

  const HomeComponent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }, []);

    const handlesubmit = () => {
      navigate(localStorage.getItem('userEmail') ? '/webscrapper' : '/login');
    }

    if (loading) {
      return (
        <div className="min-h-screen w-full bg-black text-white overflow-x-hidden ">
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
                    {[1, 2, 3, 4].map((_, index) => (
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
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="h-48 bg-gray-700 rounded-xl"></div>
                ))}
              </div>

              <div className="text-center mt-16 sm:mt-24 px-4 animate-pulse">
                <div className="h-10 bg-gray-700 rounded mb-4 mx-auto w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-700 rounded mb-6 mx-auto w-1/2 animate-pulse"></div>
                <div className="h-12 bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
        <div className="w-full relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative px-4 sm:px-6 py-6 sm:py-12 mx-auto max-w-7xl">
            <div className="text-center mb-8 sm:mb-16">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 pb-3 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-text">
                Welcome to HelpBot
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                Experience the next generation of AI assistance with our advanced chatbot solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-16 items-center px-4">
              <div className="space-y-6 sm:space-y-8">
                <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                  Your AI Assistant
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {['File Scrapping', 'Web Scrapping', 'Image Generation', 'Chatbot'].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 text-gray-300">
                      <div className="h-1 w-1 rounded-full bg-purple-500"></div>
                      <span className="text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handlesubmit} 
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all text-sm sm:text-base"
                >
                  Get Started
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              <div className="relative mt-8 md:mt-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-20"></div>
                <div className="relative bg-black/50 backdrop-blur-xl p-4 sm:p-8 rounded-2xl border border-gray-800">
                  <div className="flex space-x-2 mb-4 sm:mb-6">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-900/50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-300">Hello! How can I assist you today?</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="p-2 bg-blue-900/50 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-300">I need help with my project.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4">
              {[
                
                {
                  title: "Web Intelligence",
                  description: "Harness web data with advanced collection.",
                  icon: "🌐",
                  path: "/webscrapper"
                },
                {
                  title: "AI Image Creation",
                  description: "Generate professional-grade visuals using AI.",
                  icon: "🎨",
                  path: "/imagegeneration"
                },
                {
                  title: "Intelligent Assistant",
                  description: "Experience sophisticated AI-driven conversations.",
                  icon: "💬",
                  path: "/chatbot"
                },
                {
                  title: "File Analysis",
                  description: "Extract and analyze data from various file formats.",
                  icon: "📄",
                  path: "/fileupload"
                }
              ].map((item, index) => (
                <Link to={item.path}>
                  <div 
                  key={index} 
                  className="group p-4 sm:p-6 bg-black/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-purple-500 transition-all"
                >
                  <span className="text-2xl sm:text-3xl block mb-3 sm:mb-4">{item.icon}</span>
                  <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400">{item.description}</p>
                </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-16 sm:mt-24 px-4">
              <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6">
                Elevate Your Business with AI
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join industry leaders who are revolutionizing their workflows with our AI solutions.
              </p>
              <button 
                onClick={handlesubmit}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all text-sm sm:text-base"
              >
                Start Your Digital Transformation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default HomeComponent;