import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEdit, FaShoppingCart, FaCreditCard, FaMobileAlt, FaUniversity, FaMoneyBillWave, FaCheck, FaBox, FaShippingFast, FaHome, FaArrowLeft, FaUser, FaClock, FaLock, FaFileInvoice, FaDownload, FaPrint, FaWallet } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useToast } from '../components/Toast';
import API_URL from '../utils/api';

const Payment = () => {
  const { user, isLoggedIn } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { createOrder, getOrder, refreshOrdersFromBackend } = useOrders();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [useRegisteredAddress, setUseRegisteredAddress] = useState(true);
  const [newAddress, setNewAddress] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [showDeliveryTracking, setShowDeliveryTracking] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiId, setUpiId] = useState('');
  const [razorpayOrderId, setRazorpayOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Order status steps - similar to Flipkart/Amazon
  const orderStatuses = [
    { step: 0, label: 'Order Placed', message: 'Your order has been placed successfully!', icon: '📦', time: 'Today' },
    { step: 1, label: 'Order Confirmed', message: 'Your order has been confirmed by the seller!', icon: '✅', time: 'Today' },
    { step: 2, label: 'Processing', message: 'Your order is being processed and packed...', icon: '📋', time: 'Tomorrow' },
    { step: 3, label: 'Shipped', message: 'Your order has been shipped!', icon: '🚚', time: 'In 2 days' },
    { step: 4, label: 'Out for Delivery', message: 'Your order is out for delivery!', icon: '🏃', time: 'In 3 days' },
    { step: 5, label: 'Delivered', message: 'Your order has been delivered!', icon: '🎉', time: 'In 4 days' }
  ];

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      addToast('Please login to proceed to payment', 'warning');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch order data when orderId changes
  useEffect(() => {
    if (orderId && showDeliveryTracking) {
      const interval = setInterval(async () => {
        // Refresh orders from backend to get latest updates from admin
        await refreshOrdersFromBackend();
        const updatedOrder = getOrder(orderId);
        if (updatedOrder) {
          setOrderData(updatedOrder);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [orderId, showDeliveryTracking, getOrder, refreshOrdersFromBackend]);

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.finalPrice || item.price;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  const handleAddressConfirm = () => {
    if (!useRegisteredAddress && !newAddress.trim()) {
      addToast('Please enter a delivery address', 'warning');
      return;
    }
    setShowPaymentForm(true);
  };

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  // Generate invoice HTML for printing/downloading
  const generateInvoiceHTML = () => {
    const invoiceNumber = generateInvoiceNumber();
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    const invoiceTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    const itemsHTML = cartItems.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.quantity || 1}</td>
        <td>₹${(item.finalPrice || item.price).toFixed(2)}</td>
        <td>₹${((item.finalPrice || item.price) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          .invoice-header { text-align: center; margin-bottom: 30px; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #333; }
          .invoice-number { font-size: 16px; color: #666; margin-top: 10px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details div { width: 45%; }
          .invoice-details h3 { font-size: 14px; color: #888; margin-bottom: 5px; }
          .invoice-details p { margin: 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; }
          .text-right { text-align: right; }
          .total-row { font-weight: bold; font-size: 18px; }
          .total-row td { border-top: 2px solid #333; }
          .invoice-footer { text-align: center; margin-top: 40px; font-size: 12px; color: #888; }
          .status-badge { background: #22c55e; color: white; padding: 5px 15px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <div class="invoice-title">🛒 HarshiCart</div>
          <div class="invoice-number">Invoice: ${invoiceNumber}</div>
        </div>
        
        <div class="invoice-details">
          <div>
            <h3>BILL TO</h3>
            <p><strong>${user?.name}</strong></p>
            <p>${user?.email}</p>
            <p>${user?.phone}</p>
            <p>${getDeliveryAddress()}</p>
          </div>
          <div class="text-right">
            <h3>INVOICE DETAILS</h3>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Time:</strong> ${invoiceTime}</p>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Payment:</strong> <span class="status-badge">PAID</span></p>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
            <tr class="total-row">
              <td colspan="4" class="text-right">GRAND TOTAL</td>
              <td>₹${calculateTotal().toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="invoice-footer">
          <p>Thank you for shopping with HarshiCart!</p>
          <p>This is a computer-generated invoice. No signature required.</p>
        </div>
      </body>
      </html>
    `;
  };

  // Download invoice
  const handleDownloadInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${orderId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Invoice downloaded!', 'success');
  };

  // Print invoice
  const handlePrintInvoice = () => {
    const invoiceHTML = generateInvoiceHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsProcessing(true);
      const amount = calculateTotal();
      
      // Create order on backend
      const response = await fetch(`${API_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      
      const { orderId } = await response.json();
      setRazorpayOrderId(orderId);
      
      // Open Razorpay checkout
      const options = {
        key: 'rzp_test_qUmhUFElBiSNIs', // Replace with your actual key in production
        amount: amount * 100,
        currency: 'INR',
        name: 'HarshiCart',
        description: 'Order Payment',
        order_id: orderId,
        handler: async (response) => {
          // Payment successful - create order
          const orderDetails = {
            userId: user?.id,
            userName: user?.name,
            userEmail: user?.email,
            items: cartItems,
            total: amount,
            deliveryAddress: getDeliveryAddress(),
            phone: user?.phone,
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'paid'
          };
          
          const newOrderId = await createOrder(orderDetails);
          setOrderId(newOrderId);
          setShowPaymentForm(false);
          setShowDeliveryTracking(true);
          
          setTimeout(() => {
            setShowInvoice(true);
          }, 1000);
          
          const initialOrder = getOrder(newOrderId);
          setOrderData(initialOrder);
          addToast('Payment successful! Order placed.', 'success');
        },
        theme: {
          color: '#528FF0'
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment Error:', error);
      addToast('Payment failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    // For Razorpay, use the dedicated function
    if (selectedPayment === 'razorpay') {
      handleRazorpayPayment();
      return;
    }
    
    // For COD and other payment methods
    const orderDetails = {
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
      items: cartItems,
      total: calculateTotal(),
      deliveryAddress: getDeliveryAddress(),
      phone: user?.phone,
      paymentMethod: selectedPayment,
      paymentStatus: selectedPayment === 'cod' ? 'pending' : 'paid'
    };
    
    const newOrderId = await createOrder(orderDetails);
    setOrderId(newOrderId);
    setShowPaymentForm(false);
    setShowDeliveryTracking(true);
    
    setTimeout(() => {
      setShowInvoice(true);
    }, 1000);
    
    const initialOrder = getOrder(newOrderId);
    setOrderData(initialOrder);
    
    if (selectedPayment === 'cod') {
      addToast('Order placed! Pay on delivery.', 'success');
    }
  };

  const handleContinueShopping = () => {
    clearCart();
    navigate('/products');
  };

  // Get the delivery address
  const getDeliveryAddress = () => {
    return useRegisteredAddress ? user?.address : newAddress;
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="payment-page">
      <Link to="/cart" className="back-to-cart-link">
        <FaArrowLeft /> Back to Cart
      </Link>
      {!showDeliveryTracking ? (
        !showPaymentForm ? (
          <div className="address-confirmation-container">
            <div className="payment-header">
              <h1><FaMapMarkerAlt /> Confirm Delivery Address</h1>
            </div>
            
            <div className="registered-address-section">
              <h3><FaHome /> Registered Address</h3>
              <div className="address-card registered">
                <p className="address-name"><FaUser /> {user?.name}</p>
                <p className="address-text"><FaMapMarkerAlt /> {user?.address}</p>
                <p className="address-phone"><FaMobileAlt /> Phone: {user?.phone}</p>
              </div>
              
              <div className="address-choice">
                <label className="choice-label">
                  <input
                    type="radio"
                    name="addressChoice"
                    checked={useRegisteredAddress}
                    onChange={() => setUseRegisteredAddress(true)}
                  />
                  <span>Use this address for delivery</span>
                </label>
                
                <label className="choice-label">
                  <input
                    type="radio"
                    name="addressChoice"
                    checked={!useRegisteredAddress}
                    onChange={() => setUseRegisteredAddress(false)}
                  />
                  <span>Enter a different delivery address</span>
                </label>
              </div>
            </div>

            {!useRegisteredAddress && (
              <div className="new-address-section">
                <h3><FaEdit /> New Delivery Address</h3>
                <textarea
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter your complete delivery address"
                  rows="4"
                  className="address-input"
                />
              </div>
            )}

            <div className="order-summary">
              <h3><FaShoppingCart /> Order Summary</h3>
              {cartItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity || 1}</span>
                  <span className="item-price">₹{((item.finalPrice || item.price) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-total">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="btn-primary confirm-address-btn"
              onClick={handleAddressConfirm}
            >
              Confirm & Proceed to Payment
            </button>
          </div>
        ) : (
          <div className="payment-form-container">
            <div className="payment-header">
              <h1><FaCreditCard /> Payment</h1>
            </div>
            
            <div className="delivery-address-display">
              <h3>Delivery Address</h3>
              <p>{getDeliveryAddress()}</p>
            </div>

            <div className="order-total-display">
              <span>Total Amount:</span>
              <span className="total-amount">₹{calculateTotal().toFixed(2)}</span>
            </div>

            <div className="payment-methods">
              <h3><FaCreditCard /> Select Payment Method</h3>
              <div className="payment-options">
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card"
                    checked={selectedPayment === 'card'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span><FaCreditCard /> Credit/Debit Card</span>
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="upi"
                    checked={selectedPayment === 'upi'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span><FaMobileAlt /> UPI</span>
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="netbanking"
                    checked={selectedPayment === 'netbanking'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span><FaUniversity /> Net Banking</span>
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="razorpay"
                    checked={selectedPayment === 'razorpay'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span><FaWallet /> Pay with Razorpay</span>
                </label>
                <label className="payment-option">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cod"
                    checked={selectedPayment === 'cod'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <span><FaMoneyBillWave /> Cash on Delivery</span>
                </label>
              </div>
              
              {/* Card Details Input */}
              {selectedPayment === 'card' && (
                <div className="card-details-form">
                  <div className="secure-payment-header">
                    <FaLock /> Secure Payment
                  </div>
                  <div className="form-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))}
                      maxLength={16}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input 
                        type="password" 
                        placeholder="***"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* UPI Input */}
              {selectedPayment === 'upi' && (
                <div className="upi-details-form">
                  <div className="secure-payment-header">
                    <FaLock /> Secure Payment
                  </div>
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {/* Net Banking Links */}
              {selectedPayment === 'netbanking' && (
                <div className="netbanking-details-form">
                  <div className="secure-payment-header">
                    <FaLock /> Secure Payment via Net Banking
                  </div>
                  <p className="netbanking-info">Select your bank to proceed with net banking payment:</p>
                  <div className="netbanking-links">
                    <a href="https://www.icicibank.com" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> ICICI Bank
                    </a>
                    <a href="https://www.hdfcbank.com" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> HDFC Bank
                    </a>
                    <a href="https://www.sbi.co.in" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> State Bank of India
                    </a>
                    <a href="https://www.axisbank.com" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> Axis Bank
                    </a>
                    <a href="https://www.bankofbaroda.in" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> Bank of Baroda
                    </a>
                    <a href="https://www.kotak.com" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> Kotak Mahindra Bank
                    </a>
                    <a href="https://www.idbibank.com" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> IDBI Bank
                    </a>
                    <a href="https://www.pnb.co.in" target="_blank" rel="noopener noreferrer" className="bank-link">
                      <span className="bank-icon">🏦</span> Punjab National Bank
                    </a>
                  </div>
                  <p className="netbanking-note">* Click on your bank to redirect to their net banking portal</p>
                </div>
              )}
            </div>

            <button 
              className="btn-primary payment-btn"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ₹${calculateTotal().toFixed(2)}`}
            </button>
            
            <button 
              className="btn-secondary back-btn"
              onClick={() => setShowPaymentForm(false)}
            >
              Back to Address
            </button>
          </div>
        )
      ) : (
        <div className="delivery-tracking">
          <div className="tracking-header">
            <h1><FaCheck /> Order Confirmed!</h1>
            <p className="order-id"><FaBox /> Order ID: {orderId}</p>
            {orderData?.expectedDelivery && (
              <p className="expected-delivery"><FaClock /> Expected Delivery: {new Date(orderData.expectedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            )}
          </div>
          
          <div className="delivery-status">
            <h2>Track Your Order</h2>
            <div className="status-timeline">
              {orderStatuses.map((status, index) => (
                <div 
                  key={index} 
                  className={`status-step ${(orderData?.status || 0) >= status.step ? 'active' : ''} ${(orderData?.status || 0) === status.step ? 'current' : ''}`}
                >
                  <div className="status-icon">{status.icon}</div>
                  <div className="status-details">
                    <span className="status-label">{status.label}</span>
                    <span className="status-time">{status.time}</span>
                    {(orderData?.status || 0) === status.step && (
                      <span className="status-message">{status.message}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((orderData?.status || 0) / 5) * 100}%` }}
              ></div>
            </div>
            <p className="status-message">
              {orderStatuses[orderData?.status || 0]?.message}
            </p>
          </div>

          <div className="delivery-address">
            <h3><FaMapMarkerAlt /> Delivery Address</h3>
            <p>{orderData?.deliveryAddress || getDeliveryAddress()}</p>
          </div>

          {/* Invoice Section */}
          {showInvoice && (
            <div className="invoice-section">
              <div className="invoice-header">
                <h3><FaFileInvoice /> Invoice Generated!</h3>
                <p>Your invoice has been generated for Order #{orderId}</p>
              </div>
              
              <div className="invoice-actions">
                <button className="btn-primary invoice-btn" onClick={handleDownloadInvoice}>
                  <FaDownload /> Download Invoice
                </button>
                <button className="btn-secondary invoice-btn" onClick={handlePrintInvoice}>
                  <FaPrint /> Print Invoice
                </button>
              </div>

              {/* Invoice Preview */}
              <div className="invoice-preview">
                <h4>Invoice Summary</h4>
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity || 1}</td>
                        <td>₹{(item.finalPrice || item.price).toFixed(2)}</td>
                        <td>₹{((item.finalPrice || item.price) * (item.quantity || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan="3">Grand Total</td>
                      <td>₹{calculateTotal().toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          <button 
            className="btn-primary"
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default Payment;
