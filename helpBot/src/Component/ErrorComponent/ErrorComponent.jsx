  import React from 'react';
  import { BiError } from 'react-icons/bi';
  import { useNavigate } from 'react-router-dom';
  import { HelmetProvider, Helmet } from "react-helmet-async";


  const ErrorComponent = ({ message }) => {
    const navigate = useNavigate();

    return (
      <HelmetProvider>
      <Helmet>
        <title>SignUp - ZaraX AI</title>
        <meta name="description" content="Create your account for WebScraper" />
    </Helmet>

      <div className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-black/50 backdrop-blur-sm border border-red-500 rounded-xl">
          <div className="flex flex-col items-center justify-center space-y-4">
            <BiError className="text-red-500 text-6xl animate-bounce" />
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-400 text-center">
              {message || 'An error occurred. Please try again.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg hover:opacity-90 transition-all"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
      </HelmetProvider>
    );
  };

  export default ErrorComponent;
