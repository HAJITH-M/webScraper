import React, { useState, useEffect, useRef } from 'react';
import { backEndUrl } from '../../utils/BackendUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoCopy, IoAdd, IoChevronForward, IoLogOutOutline, IoLogOut } from 'react-icons/io5';
import { RiRobot2Line } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import * as jwt_decode from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../AuthContext/LogOut';
import { PiSignOutDuotone } from 'react-icons/pi';

const ChatBot = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [isLoadingSessions, setIsLoadingSessions] = useState(true);



    const sidebarRef = useRef(null);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const toggleMenu = () => setMenuOpen(!menuOpen);
  const [menuOpen, setMenuOpen] = useState(false);

    const email = token ? jwt_decode.jwtDecode(token).email : null;

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
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        if (email) {
            fetchPreviousSessions();
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [email]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const fetchPreviousSessions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
              setError("User not logged in.");
              return;
            }
            const backendUrl = await backEndUrl();
            const response = await fetch(`${backendUrl}/api/getSessions?email=${email}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const data = await response.json();
            setSessions(data.sessions);
        } catch (error) {
            console.error('Error fetching previous sessions:', error);
        }
        finally{
            setIsLoadingSessions(false);
        }
    };

    const fetchSessionMessages = async (id) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
              setError("User not logged in.");
              return;
            }
            const backendUrl = await backEndUrl();
            const response = await fetch(`${backendUrl}/api/getSessionMessages?email=${email}&sessionId=${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
    
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
    
            const data = await response.json();
            
            if (data.chatHistory && Array.isArray(data.chatHistory)) {
                const formattedMessages = data.chatHistory.map(msg => ([ 
                    { query: msg.query, sender: 'user' }, 
                    { response: msg.response, sender: 'bot' }
                ])).flat();
                
                setMessages(formattedMessages);
            } else {
                setMessages([]);
            }
    
            setSessionId(id);
        } catch (error) {
            console.error('Error fetching session messages:', error);
            setMessages([]);
        }
    };

    const startNewConversation = () => {
        setSessionId(null);
        setMessages([]);
    };

    const switchToSession = (id) => {
        fetchSessionMessages(id);
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const sendQuery = async () => {
        if (!query.trim()) return;

        const userMessage = { query, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
              setError("User not logged in.");
              return;
            }
            const backendUrl = await backEndUrl();
            if (!email) {
                throw new Error("Email is not found in localStorage!");
            }

            const response = await fetch(`${backendUrl}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ query, email, sessionId }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();

            if (!sessionId && data.sessionId) {
                setSessionId(data.sessionId);
            }

            const botMessage = { response: data.response, sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, botMessage]);
            
            fetchPreviousSessions();
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = { response: "Sorry, something went wrong. Please try again.", sender: 'bot' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const messagesContainer = document.querySelector(".messages");
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages]);

    // Update the renderMessage function's message container classes:

    const renderMessage = (msg, index) => {
        const handleMarkdownClick = (e) => {
            if (e.target.tagName !== 'A' && e.target.tagName !== 'CODE') {
                e.preventDefault();
                e.stopPropagation();
            }
        };
    
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={index}
                className={`flex items-start gap-3 p-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
                <div className={`flex flex-shrink-0 w-10 h-10 rounded-full items-center justify-center ${msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                    {msg.sender === 'user' ? <FaUser className="text-white text-lg" /> : <RiRobot2Line className="text-white text-lg" />}
                </div>
                <div className={`flex-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                        className={`inline-block rounded-2xl p-4 w-fit ${msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white' : 'bg-black/95 backdrop-blur-md border border-indigo-500 text-cyan-400'}`}
                        style={{ maxWidth: 'min(95vw, 800px)' }}
                    >
                        {msg.sender === 'bot' ? (
                            <div 
                                className="prose prose-sm md:prose-base max-w-none overflow-x-auto whitespace-pre-wrap break-words text-left prose-invert"
                                onClick={handleMarkdownClick}
                            >
                                <ReactMarkdown
                                    children={msg.response}
                                    components={{
                                        pre: ({ children }) => (
                                            <pre className="overflow-x-auto w-full max-w-[250px] xs:max-w-[300px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] bg-gray-900 border border-indigo-500">
                                                {children}
                                            </pre>
                                        ),
                                        code: ({ children }) => (
                                            <code className="break-all sm:break-normal text-sm md:text-base text-cyan-300">
                                                {children}
                                            </code>
                                        )
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="whitespace-pre-wrap break-words max-w-full">
                                {msg.query}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="flex h-screen bg-black overflow-hidden">

            
    {/* Mobile Sidebar Button */}
    <button className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white" onClick={toggleSidebar}>
        {isSidebarOpen ? <AiOutlineClose size={24} /> : <HiMenuAlt3 size={24} />}
    </button>

    {/* Sidebar */}
    <div
        ref={sidebarRef}
        className={`fixed lg:relative w-80 h-full bg-black border-r border-indigo-500 p-4 shadow-xl text-white z-40 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
        {/* Sidebar Content */}
        <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">{email ? email[0].toUpperCase() : '?'}</span>
            </div>
            <div className="text-sm truncate text-cyan-400">{email || 'Not signed in'}</div>
            <div className="text-sm font-bold text-cyan-400">ZaraX Bot</div>
        </div>

        {/* New Conversation Button */}
        <button
            onClick={startNewConversation}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:shadow-lg transition-all duration-300 ${!sessionId ? 'ring-2 ring-cyan-400' : ''}`}
        >
            <IoAdd className="text-lg" /> New Conversation
        </button>

        {/* Previous Conversations List */}
        <div className="mt-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 240px)", scrollbarWidth: "thin", scrollbarColor: "#4F46E5 transparent" }}>
            <h3 className="text-sm font-medium text-cyan-400 mb-4">Previous Conversations</h3>
            {isLoadingSessions ? (
    <div className="flex items-center justify-center p-4">
        <div className="flex gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
    </div>
) : sessions.length > 0 ? (
    sessions.map((session) => (
        <button
            key={session.sessionId}
            onClick={() => switchToSession(session.sessionId)}
            className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 transition-colors mb-2 text-left ${sessionId === session.sessionId ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 ring-2' : ''}`}
        >
            <span className="text-sm text-cyan-400 truncate">{session.sessionName || session.sessionId}</span>
            <IoChevronForward className="text-cyan-400" />
        </button>
    ))
) : (
    <p className="text-sm text-cyan-400 text-center">No previous conversations</p>
)}

        </div>

        <div className="pt-8">
                    <Link to="/">
                      <button
                        className="w-full text-left p-2 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 rounded transition-colors flex items-center bg-gradient-to-r from-indigo-600 to-purple-600"
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

    {/* Main Chat Area */}
    <div className="flex-1 flex flex-col h-screen">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 messages bg-black" style={{ height: "calc(100vh - 100px)" }}>
            {messages.map((msg, index) => renderMessage(msg, index))}
            {loading && (
                <div className="flex items-center justify-center p-4">
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            )}
        </div>

        {/* Message Input Section */}
        <div className="p-4 bg-black">
            <div className="flex gap-4  mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendQuery()}
                    placeholder="Message here..."
                    disabled={loading}
                    className="flex-1 p-3 rounded-2xl border border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-black text-cyan-400 placeholder-cyan-600"
                />
                <button
                    onClick={sendQuery}
                    disabled={loading}
                    className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                    <IoSend className="text-xl" />
                </button>
            </div>
        </div>
    </div>
</div>

    );
};

export default ChatBot;
