  import React, { useState, useEffect } from 'react';
  import { Link, useNavigate } from 'react-router-dom';

  const HomeComponent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
        navigate('/')
      }, 1000);
      return () => clearTimeout(timer);
    }, []);

    const handlesubmit = () => {
      navigate(localStorage.getItem('token') ? '/webscrapper' : '/login');
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
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="absolute inset-0">
              <div className="absolute h-[300px] w-[300px] -left-20 top-20 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute h-[300px] w-[300px] -right-20 top-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute h-[300px] w-[300px] left-1/2 bottom-20 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          </div>
          <div className="relative px-4 sm:px-6 py-6 sm:py-12 mx-auto max-w-7xl">
            <div className="flex justify-end mb-4">
              {!localStorage.getItem('token') ? (
                <div className="space-x-4">
                  <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:opacity-90 transition-all">Login</Link>
                  <Link to="/signup" className="px-4 py-2 border border-purple-500 rounded-lg hover:bg-purple-500/20 transition-all">Sign Up</Link>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    localStorage.removeItem('token')
                    window.location.reload()
                  }} 
                  className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  Logout
                </button>
              )}
            </div>

            <div className="text-center mb-8 sm:mb-16">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 pb-3 sm:mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-text animate-fade-in drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:drop-shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300">
                Welcome to <span className="animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-[0_0_10px_rgba(25,25,255,0.2)]">ZaraX</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto px-4">
                Discover the future of AI support with our cutting-edge chatbot solution.
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
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all text-sm sm:text-base hover:scale-105"
                >
                  Get Started
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <a href="#features" className="flex items-center space-x-2 justify-center mt-8 transition-colors group">
                  <span className="text-sm font-semibold text-white hover:text-blue-400 transition-colors duration-300 animate-neon bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">View More</span>
                  <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform animate-bounce text-white hover:text-blue-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                  </svg>
                </a>
              </div>

              <div className="relative mt-8 md:mt-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative bg-black/50 backdrop-blur-xl p-4 sm:p-8 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all duration-300">
                  <div className="flex space-x-2 mb-4 sm:mb-6">
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-red-500"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-purple-900/50 rounded-lg animate-fade-in">
                        <p className="text-xs sm:text-sm text-gray-300">Hello! How can I assist you today?</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="p-2 bg-blue-900/50 rounded-lg animate-fade-in animation-delay-500">
                        <p className="text-xs sm:text-sm text-gray-300">I need help with my project.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-16 sm:mt-24 px-4">
              <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4 sm:mb-6">
                Our Powerful Features
              </h2>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Discover our comprehensive suite of AI-powered tools designed to transform your business operations
              </p>
            </div>

            <div id='features' className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 px-4" >
              {[
                {
                  title: "Web Scraper",
                  description: "Harness web data with advanced collection.",
                  icon: "🌐",
                  path: "/webscrapper"
                },
                {
                  title: "Image Wizard",
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
                  title: "File Master",
                  description: "Extract and analyze data from various file formats.",
                  icon: "📄",
                  path: "/fileupload"
                }
              ].map((item, index) => (
                <Link key={index} to={localStorage.getItem('token') ? item.path : '/login'}>
                  <div 
                    className="group p-4 sm:p-6 bg-black/50 backdrop-blur-sm border border-gray-800 rounded-xl hover:border-purple-500 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <span className="text-2xl sm:text-3xl block mb-3 sm:mb-4 animate-bounce">{item.icon}</span>
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
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all text-sm sm:text-base hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
              >
                {localStorage.getItem('token') ? 'Access Dashboard' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default HomeComponent;