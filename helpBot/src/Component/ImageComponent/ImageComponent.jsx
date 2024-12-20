  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { FaSpinner, FaDownload, FaHome, FaImage, FaRobot, FaUser } from "react-icons/fa";
  import * as jwt_decode from 'jwt-decode';
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../../AuthContext/LogOut";
import { PiSignOutDuotone } from "react-icons/pi";

  function ImageComponent() {
    const [prompt, setPrompt] = useState("");
    const [generatedImages, setGeneratedImages] = useState([]);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [firstLetter, setFirstLetter] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const navigate = useNavigate();
      const toggleMenu = () => setMenuOpen(!menuOpen);
      const [menuOpen, setMenuOpen] = useState(false);
      const [hoveredItem, setHoveredItem] = useState(null);


    useEffect(() => {
      const validateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return false;
        }
        const decodedToken = jwt_decode.jwtDecode(token);
        if (decodedToken.exp < Date.now() / 1000) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          navigate('/login');
          return false;
        }
        return true;
      };
  
      validateToken();
    }, [navigate]);



    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwt_decode.jwtDecode(token);
        const userEmail = decoded.email;
        setEmail(userEmail || "");
        setFirstLetter(userEmail ? userEmail.charAt(0).toUpperCase() : "");
      }
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!prompt.trim()) return;
      setError("");
      setIsGenerating(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/generate-image`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (data.image) {
          setGeneratedImages(prevImages => [data.image, ...prevImages]);
        } else {
          setError("Failed to generate image.");
        }
      } catch (err) {
        setError("Error connecting to the backend.");
      } finally {
        setIsGenerating(false);
      }
    };

    const handleDownload = (imageData) => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageData}`;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-black/50 backdrop-blur-xl border-b md:border-r border-gray-800">
          <div className="p-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {firstLetter}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    ZaraX AI
                  </h2>
                  <span className="text-sm text-gray-400">{email}</span>
                </div>
              </div>
              <div className="md:hidden">
                <Link to="/">
                  <button
                    className="p-2 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-fuchsia-600 rounded transition-colors flex items-center text-white bg-gradient-to-r from-cyan-500 to-purple-600"
                    onClick={logoutUser}
                    onMouseEnter={() => setHoveredItem("logout")}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {hoveredItem === "logout" && <PiSignOutDuotone className="mr-2" />}
                    <span>Logout</span>
                  </button>
                </Link>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a description to generate an image"
                rows="4"
                className="w-full p-4 bg-black/30 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button 
                type="submit" 
                className={`w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 ${!prompt.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <FaSpinner className="text-xl" />
                    </motion.div>
                    <span>Generating...</span>
                  </>
                ) : (
                  'Generate Image'
                )}
              </button>
            </form>
          </div>
          <div className="hidden md:block p-4 mt-auto md:fixed md:bottom-0 md:left-0 md:w-64 bg-black/50 backdrop-blur-xl border-t border-gray-800">
            <Link to="/">
              <button
                className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-cyan-400 hover:to-fuchsia-600 rounded transition-colors flex items-center text-white bg-gradient-to-r from-cyan-500 to-purple-600"
                onClick={logoutUser}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {hoveredItem === "logout" && <PiSignOutDuotone className="mr-2" />}
                <span>Logout</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          <div className="w-full relative">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="relative px-4 sm:px-6 py-6 sm:py-6 mx-auto max-w-7xl">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2 pb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-text">
                  ZaraX Image Generator
                </h1>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto px-4">
                  Create stunning images with our advanced AI technology
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/50 text-red-200 rounded-lg mb-4 backdrop-blur-xl border border-red-800"
                >
                  {error}
                </motion.div>
              )}

              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-8"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: 360
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="text-4xl text-purple-500 mb-4"
                  >
                    <FaSpinner />
                  </motion.div>

                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg text-purple-400 font-medium"
                  >
                    Creating your masterpiece...
                  </motion.p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedImages.map((imageData, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-gray-800 w-full"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Generated Image {index + 1}:</h2>
                      <button
                        onClick={() => handleDownload(imageData)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-lg hover:opacity-90 transition-all text-sm"
                      >
                        <FaDownload />
                        Save
                      </button>
                    </div>
                    <div className="aspect-square relative overflow-hidden rounded-lg">
                      <img 
                        src={`data:image/png;base64,${imageData}`} 
                        alt={`Generated ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default ImageComponent;