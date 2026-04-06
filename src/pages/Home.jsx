import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';
import UserForm from './Userform';

const Home = () => {
    const { addToCart } = useCart();
    const { addToast } = useToast();

    const handleAddToCart = (product) => {
        addToCart({ ...product, quantity: 1 });
        addToast(`${product.name} added to cart!`, 'success');
    };

    const featuredProducts = [
        { id: 1, name: 'Premium Wireless Headphones', price: 2999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop', category: 'Electronics' },
        { id: 2, name: 'Smart Fitness Watch', price: 4999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', category: 'Wearables' },
        { id: 3, name: 'Ergonomic Laptop Stand', price: 1499, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop', category: 'Accessories' },
        { id: 4, name: '4K Ultra HD Webcam', price: 5999, image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop', category: 'Electronics' },
    ];

    const categories = [
        { id: 1, name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop', count: 15, slug: 'electronics' },
        { id: 2, name: 'Gaming', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop', count: 8, slug: 'gaming' },
        { id: 3, name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop', count: 12, slug: 'audio' },
    ];

    return (

        <>
            <div className="home-page">
                <section className="hero">
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <h1>Welcome to <span className="brand-name">HarshiCart</span></h1>
                        <p>Discover Amazing Products at Unbeatable Prices</p>
                        <div className="hero-buttons">
                            <Link to="/products" className="btn-primary btn-large">Shop Now</Link>
                            <Link to="/about" className="btn-outline">Learn More</Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">10K+</span>
                                <span className="stat-label">Products</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Customers</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">4.9</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="categories-section">
                    <h2>Shop by Category</h2>
                    <div className="categories-grid">
                        {categories.map(category => (
                            <Link key={category.id} to="/products" className="category-card">
                                <img src={category.image} alt={category.name} />
                                <div className="category-info">
                                    <h3>{category.name}</h3>
                                    <p>{category.count} Products</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="features">
                    <div className="feature">
                        <div className="feature-icon">🚚</div>
                        <h3>Free Shipping</h3>
                        <p>On orders over $50</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">🔒</div>
                        <h3>Secure Payment</h3>
                        <p>100% secure checkout</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">💬</div>
                        <h3>24/7 Support</h3>
                        <p>Dedicated customer support</p>
                    </div>
                    <div className="feature">
                        <div className="feature-icon">↩️</div>
                        <h3>Easy Returns</h3>
                        <p>30-day return policy</p>
                    </div>
                </section>

                <section className="featured-products">
                    <h2>Featured Products</h2>
                    <p className="section-subtitle">Handpicked selections from our latest collection</p>
                    <div className="product-grid">
                        {featuredProducts.map(product => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">
                                    <img src={product.image} alt={product.name} />
                                    <span className="product-badge">New</span>
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h3>{product.name}</h3>
                                    <p className="price">₹{product.price.toFixed(2)}</p>
                                    <button className="btn-secondary" onClick={() => handleAddToCart(product)}>Add to Cart</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="view-all-container">
                        <Link to="/products" className="btn-link">View All Products →</Link>
                    </div>
                </section>

                <section className="promo-section">
                    <div className="promo-content">
                        <h2>Special Offer!</h2>
                        <p>Get 20% off on all electronics this week</p>
                        <Link to="/products" className="btn-primary">Shop Now</Link>
                    </div>
                </section>
            </div>
            <UserForm />
        </>
    );
};

export default Home;
