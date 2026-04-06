import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: 'Top 10 Tech Gadgets of 2024',
      excerpt: 'Discover the latest and greatest technology products that are making waves in the market.',
      date: 'January 15, 2024',
      author: 'John Doe',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'How to Choose the Right Headphones',
      excerpt: 'A comprehensive guide to finding the perfect headphones for your needs and budget.',
      date: 'January 10, 2024',
      author: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'E-commerce Security Tips',
      excerpt: 'Stay safe while shopping online with these essential security practices.',
      date: 'January 5, 2024',
      author: 'Mike Johnson',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop'
    },
    {
      id: 4,
      title: 'The Future of Online Shopping',
      excerpt: 'Explore emerging trends that will shape the future of e-commerce.',
      date: 'December 28, 2023',
      author: 'Sarah Williams',
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop'
    },
    {
      id: 5,
      title: 'Best Budget Electronics',
      excerpt: 'Quality tech products that won\'t break the bank.',
      date: 'December 20, 2023',
      author: 'John Doe',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=250&fit=crop'
    },
    {
      id: 6,
      title: 'Understanding Product Warranties',
      excerpt: 'Everything you need to know about product warranties and what they cover.',
      date: 'December 15, 2023',
      author: 'Jane Smith',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop'
    },
  ];

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1>Our Blog</h1>
        <p>Latest news, tips, and insights from HarshiCart</p>
      </div>

      <div className="blog-grid">
        {blogPosts.map(post => (
          <article key={post.id} className="blog-card">
            <img src={post.image} alt={post.title} />
            <div className="blog-content">
              <span className="blog-date">{post.date}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <div className="blog-footer">
                <span className="blog-author">By {post.author}</span>
                <button className="btn-link">Read More</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
