import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../services/api'; // Ensure this is used
import './Chatbot.css';

function Chatbot() {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userText = input;
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chatbot/interact/', { message: userText });
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: response.data.reply }]);
    } catch (error) {
      console.error("Error sending message to chatbot:", error.response || error.message || error);
      setMessages(prevMessages => [...prevMessages, { sender: 'bot', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 1) { // If opening for the first time (or after reset)
        // Optionally, send an initial greeting or fetch history
    }
  };

  return (
    <>
      <button className={`chatbot-toggle-button ${isOpen ? 'open' : ''}`} onClick={toggleChatbot} aria-expanded={isOpen} aria-label="Toggle Chatbot">
        {isOpen ? <span className="icon-close">×</span> : <span className="icon-chat"></span>}
      </button>
      {isOpen && (
        <div className="chatbot-container" role="dialog" aria-labelledby="chatbot-header">
          <div id="chatbot-header" className="chatbot-header">
            AI Health Assistant
            <button onClick={toggleChatbot} className="chatbot-close-button" aria-label="Close Chatbot">×</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && <div className="message bot typing"><p>Bot is typing...</p></div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              aria-label="Chat input"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;