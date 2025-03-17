// src/pages/Home.js
import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import "./Home.css";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="home-container">
      {/* Header */}
      <div className="header">
        <h1>BARK & STAY</h1>
        <div className="account-icon">👤</div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search Property..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-btn">
          <FaSearch />
        </button>
        <button className="filter-btn">
          <FaFilter /> Filter
        </button>
      </div>

      {/* Featured Image */}
      <div className="featured-image">
        <img src="/images/dogs-hotel.jpg" alt="Dogs in Hotel" />
      </div>

      {/* Top Picks Section */}
      <div className="top-picks">
        <h2>Top Picks</h2>
        <div className="hotel-list">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="hotel-card">
              <img src="/images/hotel-placeholder.jpg" alt="Hotel" />
              <p>Hotel Name</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button>🏠 Home</button>
        <button>🗺️ Map</button>
        <button>💬 Chat</button>
        <button>⭐ Reviews</button>
      </div>
    </div>
  );
};

export default Home;
