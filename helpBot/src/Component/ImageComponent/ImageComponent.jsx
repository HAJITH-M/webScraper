  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { FaSpinner, FaDownload } from "react-icons/fa";

  function ImageComponent() {
    const [prompt, setPrompt] = useState("");
    const [imageData, setImageData] = useState(null);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
      const userEmail = localStorage.getItem("userEmail");
      setEmail(userEmail || "");
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setImageData(null);
      setIsGenerating(true);

      try {
        const response = await fetch("http://127.0.0.1:5000/generate-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });

        const data = await response.json();

        if (data.image) {
          setImageData(data.image);
        } else {
          setError("Failed to generate image.");
        }
      } catch (err) {
        setError("Error connecting to the backend.");
      } finally {
        setIsGenerating(false);
      }
    };

    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${imageData}`;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">Image Generator</h1>
            {email && (
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl">
                {email.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mb-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a description to generate an image"
              rows="4"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 mb-4"
            />
            <button 
              type="submit" 
              className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FaSpinner className="text-xl" />
                  </motion.div>
                  Generating...
                </>
              ) : (
                'Generate Image'
              )}
            </button>
          </form>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-100 text-red-700 rounded-lg mb-4"
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
                className="text-4xl text-indigo-600 mb-4"
              >
                <FaSpinner />
              </motion.div>
              <p className="text-lg text-indigo-600 font-medium">Creating your masterpiece...</p>
            </motion.div>
          )}

          {imageData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white/95 rounded-lg shadow-lg border border-gray-200"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Generated Image:</h2>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaDownload />
                  Save Image
                </button>
              </div>
              <img 
                src={`data:image/png;base64,${imageData}`} 
                alt="Generated" 
                className="w-[400px] h-[400px] rounded-lg shadow-md"
              />
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  export default ImageComponent;