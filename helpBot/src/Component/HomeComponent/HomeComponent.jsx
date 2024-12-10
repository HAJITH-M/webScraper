  import React from 'react';
  import { motion } from 'framer-motion';
  import { useNavigate } from 'react-router-dom';

  const HomeComponent = () => {
    const navigate = useNavigate();

    const handlesubmit = () => {
      const user = localStorage.getItem('userEmail');
      if (user) {
        navigate('/webscrapper');
      } else {
        navigate('/login');
      }
    }

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 md:p-2 flex items-center justify-center overflow-x-hidden">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="w-full  md:px-5"
        >
          <div className="bg-white/95 md:rounded-2xl py-8 shadow-2xl border border-gray-200 backdrop-blur-md hover:border-fuchsia-400 transition-all duration-300 hover:shadow-fuchsia-200">
            <motion.h1 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 mb-8 p-3 hover:scale-105 transition-transform duration-300 text-center"
            >
              Welcome to HelpBot
            </motion.h1>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 px-8 gap-10 items-center"
            >
              <div className="py-14 px-4">
                <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mb-4">Your AI Assistant</h2>

                <p className="text-gray-700 text-lg sm:text-xl leading-relaxed mb-6">
                  Experience the next generation of AI assistance with our advanced chatbot solution. Powered by cutting-edge technology to serve you better.
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Natural Language Processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Multi-language Support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">Real-time Response</span>
                  </div>
                </div>

                <button 
                  onClick={handlesubmit} 
                  className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 text-white rounded-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 font-bold text-xl hover:scale-105"
                >
                  Get Started
                  <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                </button>
              </div>

              <div className="p-6 px-4">
                <div className="bg-gradient-to-br from-white/90 via-white/80 to-white/90 p-8 sm:p-10 rounded-2xl border-2 border-gray-200 hover:border-fuchsia-400 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 backdrop-blur-md">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="w-5 h-5 rounded-full bg-rose-500 animate-pulse hover:animate-bounce"></div>
                    <div className="w-5 h-5 rounded-full bg-amber-500 animate-pulse hover:animate-bounce delay-75"></div>
                    <div className="w-5 h-5 rounded-full bg-emerald-500 animate-pulse hover:animate-bounce delay-150"></div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-700">Hello! How can I assist you today?</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-fuchsia-50 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-700">I need help with my project.</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-fuchsia-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-700">I'd be happy to help! What kind of project are you working on?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div> 
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-16 md:mt-28 grid px-10 pb-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10"
            >
              {[
                {
                  title: "24/7 Support",
                  description: "Get instant help anytime with our always-available AI assistant.",
                  icon: "🌟"
                },
                {
                  title: "Smart Learning",
                  description: "Our AI continuously learns and adapts to provide better responses.",
                  icon: "🧠"
                },
                {
                  title: "Secure Chat",
                  description: "Your conversations are protected with enterprise-grade security.",
                  icon: "🔒"
                }
              ].map((item, index) => (
                <motion.div 
                  key={index} 
                  whileHover={{ scale: 1.05, rotate: 1 }}
                  className="bg-white/90 p-6 px-8 cursor-pointer rounded-xl border border-gray-200 hover:border-fuchsia-400 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl h-full group"
                >
                  <div className="flex items-center mb-5">
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-rose-400 rounded-lg ml-4 animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mb-4">{item.title}</h3>
                  <p className="text-lg text-gray-700 group-hover:text-gray-900 transition-colors duration-300 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
<motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mx-10 mb-10 border border-gray-200"
            >
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mb-6">
                Experience the Future of AI Assistance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Advanced Language Processing",
                    description: "Powered by cutting-edge natural language processing for human-like understanding and responses.",
                    icon: "🔮"
                  },
                  {
                    title: "Multi-domain Expertise",
                    description: "From coding to creative writing, our AI excels across various domains and topics.",
                    icon: "📚"
                  },
                  {
                    title: "Real-time Collaboration",
                    description: "Work seamlessly with our AI assistant on complex projects and tasks.",
                    icon: "🤝"
                  },
                  {
                    title: "Customizable Experience",
                    description: "Tailor the AI's responses and behavior to match your specific needs and preferences.",
                    icon: "⚙️"
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-100 to-fuchsia-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center px-10 pb-16"
            >
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-fuchsia-600 mb-6">
                Ready to Transform Your Work?
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who are already leveraging our AI assistant to enhance their productivity and creativity.
              </p>
              <button className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                Get Started Now
              </button>
            </motion.div>

            
          </div>
        </motion.div>
      </div>
    );
  };

  export default HomeComponent;