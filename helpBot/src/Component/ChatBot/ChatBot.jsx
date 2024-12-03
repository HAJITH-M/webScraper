import React, { useState } from 'react';
import { backEndUrl } from '../../utils/BackendUrl';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './ChatBot.css'
const ChatBot = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendQuery = async () => {
        if (!query.trim()) return;

        setMessages((prevMessages) => [
            ...prevMessages,
            { text: query, sender: 'user' },
        ]);
        setQuery('');
        setLoading(true);

        try {
            const backendUrl = await backEndUrl();
            const response = await fetch(`${backendUrl}/api/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

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

    const renderMessage = (msg, index) => {
        // If the message contains code (starts with triple backticks)
        if (msg.sender === 'bot' && msg.text.includes("```")) {
            // Split explanation and code, assuming they are separated by triple backticks
            const [explanation, code] = msg.text.split("```").filter(Boolean);
            return (
                <div key={index} className={`message ${msg.sender}`} style={{ backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f1f1f1', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    <div>{explanation.trim()}</div> {/* Explanation part */}
                    <div style={{ marginTop: '10px' }}>
                        <CopyToClipboard text={code.trim()}>
                            <button style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}>Copy Code</button>
                        </CopyToClipboard>
                        <SyntaxHighlighter language="python" style={docco}>
                            {code.trim()}
                        </SyntaxHighlighter>
                    </div>
                </div>
            );
        } else {
            // Non-code messages
            return (
                <div key={index} className={`message ${msg.sender}`} style={{ backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#f1f1f1', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.text}
                </div>
            );
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => renderMessage(msg, index))}
                {loading && <div className="message bot">Loading...</div>}
            </div>
            <div className="input-container">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ask me anything..." />
                <button onClick={sendQuery}>Send</button>
            </div>
        </div>
    );
};

export default ChatBot;
