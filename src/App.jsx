import React from 'react';
import AppRouter from './router/AppRouter';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import { UsersProvider } from './context/UsersContext';
import { ChatProvider } from './context/ChatContext';
import { ToastProvider } from './components/Toast';
import ChatWidget from './components/ChatWidget';
import './App.css';
import './admin.css';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <UsersProvider>
          <CartProvider>
            <OrdersProvider>
              <ChatProvider>
                <ToastProvider>
                  <AppRouter />
                  {/* Chat widget for users to chat with admin */}
                  <ChatWidget />
                </ToastProvider>
              </ChatProvider>
            </OrdersProvider>
          </CartProvider>
        </UsersProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
