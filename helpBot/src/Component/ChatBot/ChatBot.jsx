import React, { useState, useEffect, useRef } from 'react';
import { backEndUrl } from '../../utils/BackendUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSend, IoCopy, IoAdd, IoChevronForward } from 'react-icons/io5';
import { RiRobot2Line } from 'react-icons/ri';
import { FaUser } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';
import { AiOutlineClose } from 'react-icons/ai';
import * as jwt_decode from 'jwt-decode';

const ChatBot = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const token = localStorage.getItem('token');

    const email = token ? jwt_decode.jwtDecode(token).email : null;

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

    const renderMessage = (msg, index) => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                key={index}
                className={`flex items-start gap-4 p-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                }`}>
                    {msg.sender === 'user' ? (
                        <FaUser className="text-white text-sm" />
                    ) : (
                        <RiRobot2Line className="text-white text-sm" />
                    )}
                </div>
                <div className={`flex-1 max-w-[80%] ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block rounded-2xl p-4 ${
                        msg.sender === 'user' ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white' : 'bg-white/95 backdrop-blur-md'
                    }`}>
                        {msg.sender === 'bot' ? (
                            <ReactMarkdown children={msg.response} />
                        ) : (
                            <div>{msg.query}</div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
            <button
                className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg bg-gray-900 text-white"
                onClick={toggleSidebar}
            >
                {isSidebarOpen ? <AiOutlineClose size={24} /> : <HiMenuAlt3 size={24} />}
            </button>

            <motion.div
                ref={sidebarRef}
                initial={false}
                animate={{
                    x: isSidebarOpen ? 0 : -100,
                    opacity: isSidebarOpen ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className={`fixed lg:relative w-80 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-4 shadow-xl text-white z-40 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                            {email ? email[0].toUpperCase() : '?'}
                        </span>
                    </div>
                    <div className="text-sm truncate">{email || 'Not signed in'}</div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewConversation}
                    className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:shadow-lg transition-all duration-300 ${
                        !sessionId ? 'ring-2 ring-white' : ''
                    }`}
                >
                    <IoAdd className="text-lg" />
                    New Conversation
                </motion.button>

                <div className="mt-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)", scrollbarWidth: "thin", scrollbarColor: "#4F46E5 transparent" }}>
                    <h3 className="text-sm font-medium text-cyan-300 mb-4">Previous Conversations</h3>
                    <AnimatePresence>
                        {sessions.length > 0 ? (
                            sessions.map((session) => (
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    key={session.sessionId}
                                    onClick={() => switchToSession(session.sessionId)}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-fuchsia-600 transition-colors mb-2 text-left ${
                                        sessionId === session.sessionId ? 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 ring-2' : ''
                                    }`}
                                >
                                    <span className="text-sm text-white truncate">
                                        {session.sessionName || session.sessionId}
                                    </span>
                                    <IoChevronForward className="text-gray-400" />
                                </motion.button>
                            ))
                        ) : (
                            <p className="text-sm text-cyan-300 text-center">No previous conversations</p>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <div className="flex-1 flex flex-col h-screen">
                <div className="flex-1 overflow-y-auto p-4 messages" style={{ height: "calc(100vh - 100px)" }}>
                    <AnimatePresence mode="wait">
                        {messages.map((msg, index) => renderMessage(msg, index))}
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex items-center justify-center p-4"
                            >
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 border-t bg-white/95 backdrop-blur-md">
                    <div className="flex gap-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendQuery()}
                            placeholder="Message Gemini..."
                            disabled={loading}
                            className="flex-1 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90"
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={sendQuery}
                            disabled={loading}
                            className="p-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                            <IoSend className="text-xl" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;