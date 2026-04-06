import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const ChatContext = createContext();

// Knowledge base for auto-reply
export const knowledgeBase = {
  // Order related queries
  'order': {
    keywords: ['order', 'orders', 'track', 'tracking', 'status', 'delivery', 'delivered', 'shipped', 'shipping'],
    response: "To track your order, please go to the Orders section in your profile. You'll find real-time tracking information there. For more details, please provide your order ID.",
    canResolve: true
  },
  'cancel order': {
    keywords: ['cancel', 'cancelled', 'cancellation'],
    response: "To cancel your order, please go to your order details and click on 'Cancel Order'. If the order has already been shipped, please contact our support team for assistance.",
    canResolve: true
  },
  // Payment related queries
  'payment': {
    keywords: ['payment', 'pay', 'paid', 'money', 'refund', 'transaction'],
    response: "For payment-related issues, we accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery. For refunds, please allow 5-7 business days for the amount to reflect in your account.",
    canResolve: true
  },
  'refund': {
    keywords: ['refund', 'money back', 'return'],
    response: "We offer a 30-day return policy for most products. To initiate a refund, please go to your order and request a return. Once we receive the item, refund will be processed within 5-7 business days.",
    canResolve: true
  },
  // Product related queries
  'product': {
    keywords: ['product', 'item', 'items', 'price', 'discount', 'offer', 'sale'],
    response: "You can browse all our products in the Products section. We regularly offer discounts and deals. Check our website regularly for latest offers!",
    canResolve: true
  },
  'out of stock': {
    keywords: ['out of stock', 'unavailable', 'not available'],
    response: "We're sorry that some items are currently out of stock. You can enable 'Notify Me' on the product page to get notified when it's back in stock.",
    canResolve: true
  },
  // Account related queries
  'account': {
    keywords: ['account', 'login', 'password', 'forgot', 'reset', 'signup', 'register'],
    response: "You can login or register from the top right corner of the website. If you've forgotten your password, use the 'Forgot Password' option on the login page.",
    canResolve: true
  },
  'profile': {
    keywords: ['profile', 'update', 'edit', 'details', 'information'],
    response: "You can update your profile by clicking on the Profile icon in the navigation menu. There you can edit your personal details, address, and preferences.",
    canResolve: true
  },
  // Shipping related queries
  'shipping': {
    keywords: ['shipping', 'delivery time', 'days', 'free delivery', 'express'],
    response: "We offer standard delivery (5-7 days) and express delivery (2-3 days). Free delivery is available on orders above ₹500. Delivery times may vary based on your location.",
    canResolve: true
  },
  // General queries
  'hello': {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: "Hello! Welcome to HarshiCart support. How can I help you today?",
    canResolve: true
  },
  'thank': {
    keywords: ['thank', 'thanks', 'appreciate'],
    response: "You're welcome! Is there anything else I can help you with?",
    canResolve: true
  },
  'help': {
    keywords: ['help', 'support', 'contact', 'assistant'],
    response: "I'm here to help! You can ask me about: Order status and tracking, Payment and refunds, Products and offers, Account issues, Shipping information. What would you like to know?",
    canResolve: true
  },
  'contact': {
    keywords: ['contact', 'phone', 'email', 'call'],
    response: "You can reach us through this chat for immediate assistance. For other queries, you can email us at support@harshicart.com",
    canResolve: true
  }
};

// Find matching response from knowledge base
const findResponse = (userMessage) => {
  const messageLower = userMessage.toLowerCase();
  
  for (const [key, data] of Object.entries(knowledgeBase)) {
    for (const keyword of data.keywords) {
      if (messageLower.includes(keyword)) {
        return { response: data.response, canResolve: data.canResolve, category: key };
      }
    }
  }
  
  // No match found
  return { 
    response: "Thank you for reaching out! I've forwarded your query to our support team. An administrator will review your request and get back to you shortly.", 
    canResolve: false, 
    category: 'unknown' 
  };
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unresolvedQueries, setUnresolvedQueries] = useState([]);
  const autoReplyTimeoutRef = useRef(null);

  // Load messages from backend or localStorage on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        // Try to load from backend
        const response = await fetch('/api/chat');
        if (response.ok) {
          const backendChats = await response.json();
          if (backendChats.length > 0) {
            // Map backend chats to frontend format
            const mappedConversations = backendChats.map(chat => ({
              id: chat._id,
              userId: chat.userId,
              userName: chat.userName,
              lastMessage: chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].text : '',
              lastMessageTime: chat.messages?.length > 0 ? chat.messages[chat.messages.length - 1].timestamp : null,
              unreadCount: chat.unreadCount || 0,
              createdAt: chat.createdAt
            }));
            
            // Flatten all messages
            const allMessages = backendChats.flatMap(chat => 
              (chat.messages || []).map(msg => ({
                ...msg,
                id: msg._id || `msg-${Date.now()}-${Math.random()}`,
                conversationId: chat._id
              }))
            );
            
            setConversations(mappedConversations);
            setMessages(allMessages);
            
            // Save to localStorage
            localStorage.setItem('conversations', JSON.stringify(mappedConversations));
            localStorage.setItem('chatMessages', JSON.stringify(allMessages));
            return;
          }
        }
      } catch (error) {
        console.log('Could not load chats from backend:', error);
      }
      
      // Fallback to localStorage
      const savedMessages = localStorage.getItem('chatMessages');
      const savedConversations = localStorage.getItem('conversations');
      const savedUnresolved = localStorage.getItem('unresolvedQueries');
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      if (savedUnresolved) {
        setUnresolvedQueries(JSON.parse(savedUnresolved));
      }
    };
    
    loadChats();
    
    // Cleanup timeout on unmount
    return () => {
      if (autoReplyTimeoutRef.current) {
        clearTimeout(autoReplyTimeoutRef.current);
      }
    };
  }, []);

  // Save to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Start a new conversation or get existing one
  const startConversation = async (userId, userName, userEmail) => {
    const existing = conversations.find(c => c.userId === userId);
    if (existing) {
      setActiveConversation(existing);
      return existing.id;
    }
    
    const newConversation = {
      id: 'conv-' + Date.now(),
      userId,
      userName,
      userEmail,
      lastMessage: '',
      lastMessageTime: null,
      unreadCount: 0,
      createdAt: new Date().toISOString()
    };
    
    setConversations(prev => [...prev, newConversation]);
    setActiveConversation(newConversation);
    
    // Save to backend
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          messages: [],
          unreadCount: 0
        })
      });
    } catch (error) {
      console.error('Error saving conversation to backend:', error);
    }
    
    return newConversation.id;
  };

  // Send a message
  const sendMessage = async (conversationId, sender, senderName, text) => {
    const newMessage = {
      id: 'msg-' + Date.now(),
      conversationId,
      sender, // 'admin' or 'user'
      senderName,
      text,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: text,
          lastMessageTime: new Date().toISOString(),
          unreadCount: sender === 'admin' ? conv.unreadCount + 1 : 0
        };
      }
      return conv;
    }));
    
    // Save message to backend
    try {
      await fetch(`/api/chat/${conversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          senderName,
          text
        })
      });
    } catch (error) {
      console.error('Error saving message to backend:', error);
    }
    
    // Auto-reply if message is from user
    if (sender === 'user') {
      // Clear any existing timeout
      if (autoReplyTimeoutRef.current) {
        clearTimeout(autoReplyTimeoutRef.current);
      }
      
      // Delay the auto-reply to simulate thinking
      autoReplyTimeoutRef.current = setTimeout(() => {
        const { response, canResolve, category } = findResponse(text);
        
        // Send auto-reply
        const botMessage = {
          id: 'msg-' + Date.now() + '-bot',
          conversationId,
          sender: 'bot',
          senderName: 'Support Bot',
          text: response,
          timestamp: new Date().toISOString(),
          read: true,
          isAutoReply: true
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Update conversation
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: response,
              lastMessageTime: new Date().toISOString(),
              unreadCount: 0
            };
          }
          return conv;
        }));
        
        // Save bot message to backend
        fetch(`/api/chat/${conversationId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: 'bot',
            senderName: 'Support Bot',
            text: response
          })
        }).catch(error => console.error('Error saving bot message:', error));
        
        // If query cannot be resolved, add to unresolved queries for admin notification
        if (!canResolve) {
          const queryNotification = {
            id: 'query-' + Date.now(),
            conversationId,
            userId: conversations.find(c => c.id === conversationId)?.userId,
            userName: conversations.find(c => c.id === conversationId)?.userName,
            originalMessage: text,
            timestamp: new Date().toISOString(),
            needsAdminAttention: true
          };
          
          setUnresolvedQueries(prev => [...prev, queryNotification]);
          
          // Store in localStorage for persistence
          const stored = JSON.parse(localStorage.getItem('unresolvedQueries') || '[]');
          localStorage.setItem('unresolvedQueries', JSON.stringify([...stored, queryNotification]));
        }
      }, 1000); // 1 second delay for natural feel
    }
    
    return newMessage;
  };

  // Get messages for a conversation
  const getMessages = (conversationId) => {
    return messages.filter(m => m.conversationId === conversationId);
  };

  // Get all conversations
  const getConversations = () => {
    return conversations;
  };

  // Mark messages as read
  const markAsRead = (conversationId) => {
    setMessages(prev => prev.map(m => {
      if (m.conversationId === conversationId && !m.read) {
        return { ...m, read: true };
      }
      return m;
    }));
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  // Delete a conversation
  const deleteConversation = async (conversationId) => {
    setMessages(prev => prev.filter(m => m.conversationId !== conversationId));
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    setUnresolvedQueries(prev => prev.filter(q => q.conversationId !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }
    
    // Update localStorage
    const storedUnresolved = JSON.parse(localStorage.getItem('unresolvedQueries') || '[]');
    localStorage.setItem('unresolvedQueries', JSON.stringify(storedUnresolved.filter(q => q.conversationId !== conversationId)));
    
    // Delete from backend
    try {
      await fetch(`/api/chat/${conversationId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting conversation from backend:', error);
    }
  };

  // Get all unresolved queries (for admin)
  const getUnresolvedQueries = () => {
    return unresolvedQueries;
  };

  // Clear an unresolved query (after admin handles it)
  const clearUnresolvedQuery = (queryId) => {
    setUnresolvedQueries(prev => prev.filter(q => q.id !== queryId));
    localStorage.setItem('unresolvedQueries', JSON.stringify(unresolvedQueries.filter(q => q.id !== queryId)));
  };

  // Get count of queries needing admin attention
  const getUnresolvedCount = () => {
    return unresolvedQueries.filter(q => q.needsAdminAttention).length;
  };

  return (
    <ChatContext.Provider value={{
      messages,
      conversations,
      activeConversation,
      setActiveConversation,
      startConversation,
      sendMessage,
      getMessages,
      getConversations,
      markAsRead,
      deleteConversation,
      getUnresolvedQueries,
      clearUnresolvedQuery,
      getUnresolvedCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
