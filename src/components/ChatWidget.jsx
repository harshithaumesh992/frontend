import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaTrash } from 'react-icons/fa';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const ChatWidget = ({ isAdmin = false }) => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation,
    startConversation, 
    sendMessage, 
    getMessages, 
    markAsRead,
    deleteConversation 
  } = useChat();
  
  const { user, isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const msgs = getMessages(activeConversation.id);
      setChatMessages(msgs);
      markAsRead(activeConversation.id);
    }
  }, [activeConversation, getMessages, markAsRead]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    const sender = isAdmin ? 'admin' : 'user';
    const senderName = isAdmin ? 'Admin' : user?.name || 'User';
    
    sendMessage(activeConversation.id, sender, senderName, messageText.trim());
    setMessageText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartChat = () => {
    if (!isLoggedIn && !isAdmin) return;
    
    if (isAdmin) {
      // For admin, select from conversations
      if (conversations.length > 0 && !activeConversation) {
        setActiveConversation(conversations[0]);
      }
    } else {
      // For user, start new conversation
      const convId = startConversation(user?.id, user?.name, user?.email);
      const conv = conversations.find(c => c.id === convId) || { id: convId, userId: user?.id };
      setActiveConversation(conv);
    }
    setIsOpen(true);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => isOpen ? setIsOpen(false) : handleStartChat()}
        title={isAdmin ? "Admin Chats" : "Chat with Support"}
      >
        <FaComments />
        {!isAdmin && conversations.reduce((acc, c) => acc + c.unreadCount, 0) > 0 && (
          <span className="chat-badge">
            {conversations.reduce((acc, c) => acc + c.unreadCount, 0)}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <h3>
              {isAdmin ? 'Admin Chat Support' : 'Chat with Support'}
            </h3>
            <button className="close-chat" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {isAdmin ? (
            /* Admin View - Conversation List */
            <div className="chat-conversations">
              {conversations.length === 0 ? (
                <p className="no-conversations">No conversations yet</p>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${activeConversation?.id === conv.id ? 'active' : ''}`}
                    onClick={() => setActiveConversation(conv)}
                  >
                    <div className="conv-avatar">
                      <FaUser />
                    </div>
                    <div className="conv-info">
                      <span className="conv-name">{conv.userName}</span>
                      <span className="conv-preview">{conv.lastMessage || 'No messages'}</span>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            /* User View - Start chat prompt */
            !activeConversation && (
              <div className="chat-start">
                <p>Start a conversation with our support team</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const convId = startConversation(user?.id, user?.name, user?.email);
                    setActiveConversation({ id: convId, userId: user?.id });
                  }}
                >
                  Start Chat
                </button>
              </div>
            )
          )}

          {/* Messages Area */}
          {activeConversation && (
            <>
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <p className="no-messages">No messages yet. Start the conversation!</p>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`message ${msg.sender === (isAdmin ? 'admin' : 'user') ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        <span className="message-text">{msg.text}</span>
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button onClick={handleSendMessage} disabled={!messageText.trim()}>
                  <FaPaperPlane />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .chat-toggle-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          z-index: 1000;
          transition: transform 0.3s;
        }

        .chat-toggle-btn:hover {
          transform: scale(1.1);
        }

        .chat-toggle-btn.hidden {
          display: none;
        }

        .chat-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #dc2626;
          color: white;
          font-size: 12px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-widget {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 380px;
          height: 500px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
        }

        .chat-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .close-chat {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }

        .chat-conversations {
          height: 200px;
          overflow-y: auto;
          border-bottom: 1px solid #e2e8f0;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 15px;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid #f1f5f9;
        }

        .conversation-item:hover {
          background: #f8fafc;
        }

        .conversation-item.active {
          background: #eff6ff;
        }

        .conv-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .conv-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .conv-name {
          font-weight: 600;
          color: #1e293b;
        }

        .conv-preview {
          font-size: 12px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .unread-badge {
          background: #2563eb;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .chat-start {
          padding: 40px 20px;
          text-align: center;
        }

        .chat-start p {
          color: #64748b;
          margin-bottom: 20px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .no-messages {
          text-align: center;
          color: #94a3b8;
          margin: auto;
        }

        .message {
          display: flex;
          max-width: 80%;
        }

        .message.sent {
          align-self: flex-end;
        }

        .message.received {
          align-self: flex-start;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .message.sent .message-content {
          background: #2563eb;
          color: white;
          border-bottom-right-radius: 2px;
        }

        .message.received .message-content {
          background: #f1f5f9;
          color: #1e293b;
          border-bottom-left-radius: 2px;
        }

        .message-text {
          font-size: 14px;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 10px;
          opacity: 0.7;
          align-self: flex-end;
        }

        .chat-input {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid #e2e8f0;
        }

        .chat-input input {
          flex: 1;
          padding: 10px 15px;
          border: 2px solid #e2e8f0;
          border-radius: 25px;
          outline: none;
        }

        .chat-input input:focus {
          border-color: #2563eb;
        }

        .chat-input button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }

        .chat-input button:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .chat-input button:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        .no-conversations {
          text-align: center;
          color: #94a3b8;
          padding: 40px 20px;
        }

        @media (max-width: 480px) {
          .chat-widget {
            width: calc(100vw - 40px);
            right: 20px;
            left: 20px;
            bottom: 80px;
          }
        }
      `}</style>
    </>
  );
};

export default ChatWidget;
