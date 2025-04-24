import React, { useState, useRef, useEffect } from 'react';
import chatbotService from '../../services/chatbotService';
import './ChatbotWidget.css';
import DOMPurify from 'dompurify';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);

  // Animation lifecycle management
  useEffect(() => {
    // After component mounts, stop showing initial animation
    const timer = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 4000); // Wait for initial animations to complete

    return () => clearTimeout(timer);
  }, []);

  // Add welcome message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          { id: 1, text: "Hello! How can I help you today?", sender: 'bot', isNew: true }
        ]);
      }, 600); // Small delay for better visual effect after the chat window opens
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    if (isOpen) {
      // Start close animation
      setIsClosing(true);
      
      // After animation completes, actually close the chat
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        setError(null);
      }, 300); // Match this duration with the CSS animation duration
    } else {
      setIsOpen(true);
      setError(null);
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  // Sanitize message text to prevent XSS
  const sanitizeMessage = (text) => {
    return DOMPurify.sanitize(text);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading) return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: sanitizeMessage(inputMessage),
      sender: 'user',
      isNew: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Make API call to get bot response using the service
      const response = await chatbotService.sendMessage(inputMessage);
      
      // Add bot response to chat
      const botMessage = {
        id: messages.length + 2,
        text: sanitizeMessage(response.message || "I'm having trouble understanding. Can you rephrase that?"),
        sender: 'bot',
        isNew: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to get response. Please try again.');
      
      // Add error message from bot
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        error: true,
        isNew: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Determine button animation classes
  const buttonClasses = [
    "chatbot-toggle-button",
    showInitialAnimation ? "chatbot-entry-animation" : "",
    showInitialAnimation ? "chatbot-pulse" : ""
  ].filter(Boolean).join(" ");

  // Determine chat window animation classes
  const windowClasses = [
    "chatbot-window",
    isClosing ? "animate-fade-out-down" : "animate-fade-in-up"
  ].filter(Boolean).join(" ");

  return (
    <div className="chatbot-widget">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={buttonClasses}
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="chatbot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {(isOpen || isClosing) && (
        <div className={windowClasses} ref={chatWindowRef}>
          {/* Chat Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <div className="chatbot-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" className="chatbot-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="chatbot-title-text">Your Assistant</span>
            </div>
            <button 
              onClick={toggleChat}
              className="chatbot-close-button"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="chatbot-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`chatbot-message ${message.sender === 'user' ? 'chatbot-message-user' : 'chatbot-message-bot'} ${message.error ? 'chatbot-message-error' : ''} ${message.isNew ? 'chatbot-message-new' : ''}`}
              >
                <div className="chatbot-message-bubble">
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            {error && !isLoading && (
              <div className="chatbot-error-message">
                {error}
              </div>
            )}
            <div className="chatbot-input-container">
              <textarea
                className="chatbot-input"
                placeholder="Type your message..."
                rows="1"
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              ></textarea>
              <button 
                className={`chatbot-send-button ${isLoading ? 'chatbot-disabled' : ''}`}
                onClick={handleSendMessage}
                disabled={isLoading}
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="chatbot-send-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
