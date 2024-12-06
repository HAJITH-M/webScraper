import React, { useState, useEffect } from 'react';
import { backEndUrl } from '../../utils/BackendUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import ReactMarkdown from 'react-markdown'; // Import react-markdown
import './ChatBot.css';

const ChatBot = () => { 
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // Retrieve userEmail from localStorage
    const email = localStorage.getItem('userEmail');  // Assuming you stored the email under 'userEmail'

    const sendQuery = async () => {
        if (!query.trim()) return;  // Make sure query is not empty
    
        setMessages((prevMessages) => [
            ...prevMessages,
            { text: query, sender: 'user' },
        ]);
        setQuery('');
        setLoading(true);
    
        try {
            const backendUrl = await backEndUrl();
            if (!email) {  // Check if email is available in localStorage
                console.error("Email is not found in localStorage!");
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: "Email is missing. Please log in again.", sender: 'bot' },
                ]);
                return;
            }
            const response = await fetch(`${backendUrl}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, email }),  // Send email to backend
            });
    
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
    
            const data = await response.json();
    
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: data.response, sender: 'bot' },
            ]);
        } catch (error) {
            console.error("Error:", error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: "Sorry, something went wrong. Please try again.", sender: 'bot' },
            ]);
        } finally {
            setLoading(false);
        }
    };
    
    // Automatically scroll to the bottom when messages change
    useEffect(() => {
        const messagesContainer = document.querySelector(".messages");
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [messages]);

    const renderMessage = (msg, index) => {
        return (
            <div key={index} className={`message ${msg.sender}`} style={{ backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f1f1f1', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {msg.sender === 'bot' ? (
                    <div>
                        <ReactMarkdown
                            children={msg.text} // This will render markdown
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const language = className?.replace('language-', '') || 'plaintext'; // Default to plaintext if no language specified
                                    return !inline ? (
                                        <div>
                                            <CopyToClipboard text={children}>
                                                <button style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }} >
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
                    <div>{msg.text}</div>
                )}
            </div>
        );
    };

    return (
        <div className="chat-container">
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
