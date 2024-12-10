import React, { useState, useEffect } from 'react';
import { backEndUrl } from '../../utils/BackendUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const ChatBot = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [sessions, setSessions] = useState([]);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (email) {
            fetchPreviousSessions();
        }
    }, [email]);

    const fetchPreviousSessions = async () => {
        try {
            const backendUrl = await backEndUrl();
            const response = await fetch(`${backendUrl}/api/getSessions?email=${email}`);
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
            const backendUrl = await backEndUrl();
            const response = await fetch(`${backendUrl}/api/getSessionMessages?email=${email}&sessionId=${id}`);
    
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
    };

    const sendQuery = async () => {
        if (!query.trim()) return;

        const userMessage = { query, sender: 'user' };
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setQuery('');
        setLoading(true);

        try {
            const backendUrl = await backEndUrl();
            if (!email) {
                throw new Error("Email is not found in localStorage!");
            }

            const response = await fetch(`${backendUrl}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            <div key={index} className={`message ${msg.sender}`} style={{ 
                backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f1f1f1', 
                marginLeft: msg.sender === 'user' ? 'auto' : '0',
                marginRight: msg.sender === 'user' ? '0' : 'auto',
                textAlign: msg.sender === 'user' ? 'right' : 'left'
            }}>
                {msg.sender === 'bot' ? (
                    <div>
                        <ReactMarkdown
                            children={msg.response}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const language = className?.replace('language-', '') || 'plaintext';
                                    return !inline ? (
                                        <div>
                                            <CopyToClipboard text={children}>
                                                <button style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}>
                                                    Copy Code
                                                </button>
                                            </CopyToClipboard>
                                            <SyntaxHighlighter language={language} style={docco} {...props}>
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code {...props}>{children}</code>
                                    );
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div>{msg.query}</div>
                )}
            </div>
        );
    };

    return (
        <div className="chat-container">
            <button onClick={startNewConversation}>New Conversation</button>

            <div>
    <h3>Previous Conversations</h3>
    {sessions.length > 0 ? (
        sessions.map((session) => (
            <div key={session.sessionId}>
                <button onClick={() => switchToSession(session.sessionId)}>
                    Continue Conversation - {session.sessionName || session.sessionId}
                </button>
            </div>
        ))
    ) : (
        <p>No previous conversations available.</p>
    )}
</div>



            <div className="messages">
                {messages.map((msg, index) => renderMessage(msg, index))}
                {loading && (
                    <div className="message bot" style={{ textAlign: 'center' }}>
                        <div>Loading...</div>
                    </div>
                )}
            </div>

            <div className="input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={loading}
                />
                <button onClick={sendQuery} disabled={loading}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBot;