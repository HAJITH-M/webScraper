  import { useState, useEffect } from "react";
  import axios from "axios";
  import toast from "react-hot-toast";
  import { Link, useNavigate } from "react-router-dom";
  import { Canvas } from "@react-three/fiber";
  import { OrbitControls, Stars } from "@react-three/drei";
  import { motion } from "framer-motion";
  import { backEndUrl } from "../utils/BackendUrl";

  const AnimatedSphere = () => {
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
    );
  };

  const Login = () => {
    const router = useNavigate()
    const [formData, setFormData] = useState({
      email: "",
      password: "",
    });

    

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        router('/');
      }
    }, []);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value,
      });
    };

    const validateForm = () => {
      const newErrors = {};
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
      return newErrors;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const validationErrors = validateForm();
  
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
      } else {
        try {
          const backEndUrls = await backEndUrl();
          const response = await axios.post(`${backEndUrls}/api/login`, formData);
          console.log(response.data);
          if (response.data.token) {
            localStorage.setItem('token', response.data.token); 
            localStorage.setItem('userEmail', formData.email); 
            toast.success("Login successful");
            router("/webscrapper", { replace: true });          
            window.location.reload();
            setFormData({ email: "", password: "" });
            setErrors({});
          }
        } catch (error) {
          console.error("Error during login:", error);
          toast.error("Invalid Email or Password");
          if (error.response && error.response.data && error.response.data.error) {
            setErrors({ general: error.response.data.error });
          } else {
            setErrors({ general: "Login failed. Please try again later." });
          }
        }
      }
    };
  
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-black p-3 flex items-center justify-center overflow-x-hidden relative">
        <div className="absolute inset-0 w-full h-full">
          <Canvas>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Stars count={5000} factor={5} fade speed={1} />
            <OrbitControls enableZoom={false} autoRotate />
            <AnimatedSphere />
          </Canvas>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="relative w-full max-w-md z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 rounded-2xl transform rotate-2 blur-lg opacity-60 animate-pulse"></div>
          <div className="relative bg-black/90 rounded-xl p-6 shadow-2xl border border-cyan-500 backdrop-blur-sm hover:border-purple-500 transition-all duration-300">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6 text-center"
            >
              Sign In
            </motion.h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 text-white bg-black/90 border border-cyan-500 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                  placeholder="Email address"
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input 
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 text-white bg-black/90 border border-cyan-500 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                  placeholder="Password"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 text-white font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:from-cyan-400 hover:to-fuchsia-600 transition-all duration-300"
              >
                Sign in
              </button>

              <div className="text-center">
                <p className="text-cyan-400 mb-4">or sign in with</p>
                <button className="w-full flex items-center justify-center px-6 py-3 bg-black/90 text-white border border-cyan-500 rounded-lg hover:border-purple-500 transition-all duration-300">
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 40 40">
                    <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.045 27.2142 24.3525 30 20 30C14.4775 30 10 25.5225 10 20C10 14.4775 14.4775 9.99999 20 9.99999C22.5492 9.99999 24.8683 10.9617 26.6342 12.5325L31.3483 7.81833C28.3717 5.04416 24.39 3.33333 20 3.33333C10.7958 3.33333 3.33335 10.7958 3.33335 20C3.33335 29.2042 10.7958 36.6667 20 36.6667C29.2042 36.6667 36.6667 29.2042 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#FFC107" />
                    <path d="M5.25497 12.2425L10.7308 16.2583C12.2125 12.59 15.8008 9.99999 20 9.99999C22.5491 9.99999 24.8683 10.9617 26.6341 12.5325L31.3483 7.81833C28.3716 5.04416 24.39 3.33333 20 3.33333C13.5983 3.33333 8.04663 6.94749 5.25497 12.2425Z" fill="#FF3D00" />
                    <path d="M20 36.6667C24.305 36.6667 28.2167 35.0192 31.1742 32.34L26.0159 27.975C24.3425 29.2425 22.2625 30 20 30C15.665 30 11.9842 27.2359 10.5975 23.3784L5.16254 27.5659C7.92087 32.9634 13.5225 36.6667 20 36.6667Z" fill="#4CAF50" />
                    <path d="M36.3425 16.7358H35V16.6667H20V23.3333H29.4192C28.7592 25.1975 27.56 26.805 26.0133 27.9758C26.0142 27.975 26.015 27.975 26.0158 27.9742L31.1742 32.3392C30.8092 32.6708 36.6667 28.3333 36.6667 20C36.6667 18.8825 36.5517 17.7917 36.3425 16.7358Z" fill="#1976D2" />
                  </svg>
                  Sign in with Google
                </button>
              </div>

              <div className="text-center mt-4">
                <Link to="/signup" className="text-purple-600 hover:text-purple-700 transition-colors duration-300">
                  Don't have an account yet? Sign up
                </Link>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    );
  };

  export default Login;