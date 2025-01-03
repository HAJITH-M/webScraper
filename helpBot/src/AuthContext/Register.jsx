import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { backEndUrl } from "../utils/BackendUrl";
import { HelmetProvider, Helmet } from "react-helmet-async";


const AnimatedSphere = () => {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasNumber: false,
    hasSpecial: false,
    hasLength: false
  });

  const [errors, setErrors] = useState({});
  const router = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router('/webscrapper');
    }

  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    if (name === 'password') {
      setPasswordCriteria({
        hasNumber: /\d/.test(value),
        hasSpecial: /[!@#$%^&*]/.test(value),
        hasLength: value.length >= 8
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    if (!formData.username) newErrors.username = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";


    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = "Password must contain at least one number, one special character, and be at least 8 characters long";
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
        const response = await axios.post(`${backEndUrls}/api/signup`, formData);
        
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem('userEmail', formData.email); 
          toast.success("Registered and Logged In Successfully");
          router("/", { replace: true });         
          window.location.reload();
          setFormData({ username: "", email: "", password: "" });
          setErrors({});
        }
      } catch (error) {
        console.error("Error during sign up:", error);
        toast.error("Registration failed. Please try again.");
        if (error.response) {
          console.error("Response error:", error.response);
          setErrors({
            general: error.response?.data?.error || "Sign up failed. Please try again later.",
          });
        } else {
          setErrors({
            general: "Network or server error. Please try again later.",
          });
        }
      }
    }
  };

  return (
    <HelmetProvider>
    <Helmet>
        <title>SignUp - ZaraX AI</title>
        <meta name="description" content="Create your account for WebScraper" />
    </Helmet>
      



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
      <div className="relative w-full max-w-md z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl transform rotate-2 blur-lg opacity-60 animate-pulse"></div>
        <div className="relative bg-black/90 rounded-xl p-6 shadow-2xl border border-cyan-500 backdrop-blur-sm hover:border-purple-500 transition-all duration-300">
          <h1 className="text-4xl pb-1 font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6 text-center">
            Sign Up
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 text-white bg-black/50 border border-cyan-500 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                placeholder="Enter your name"
              />

              {errors.username && <p className="text-red-500 text-sm mt-1 font-semibold bg-red-100/10 p-2 rounded">{errors.username}</p>}
            </div>
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
                className="w-full pl-12 pr-4 py-3 text-white bg-black/50 border border-cyan-500 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                placeholder="Enter your email"
              />

              {errors.email && <p className="text-red-500 text-sm mt-1 font-semibold bg-red-100/10 p-2 rounded">{errors.email}</p>}
            </div>
            <div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 text-white bg-black/90 border border-cyan-500 rounded-lg focus:border-purple-500 focus:ring-purple-500 transition-all duration-300"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-purple-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1 font-semibold bg-red-100/10 p-2 rounded">{errors.password}</p>}
                {formData.password && (
                  <div className="mt-2 text-sm">
                    <p className={passwordCriteria.hasNumber ? "text-green-500" : "text-gray-400"}>✓ Contains a number</p>
                    <p className={passwordCriteria.hasSpecial ? "text-green-500" : "text-gray-400"}>✓ Contains a special character</p>
                    <p className={passwordCriteria.hasLength ? "text-green-500" : "text-gray-400"}>✓ At least 8 characters long</p>
                  </div>
                )}
              </div>
            <button
              type="submit"
              className="w-full py-3 text-white font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg hover:from-cyan-400 hover:to-fuchsia-600 transform hover:-translate-y-1 transition-all duration-300"
            >
              Sign Up
            </button>
            <div className="text-center mt-4">
              <span className="text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-cyan-400 hover:text-purple-500 transition-colors duration-300"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  </HelmetProvider>
  );
};

export default Register;