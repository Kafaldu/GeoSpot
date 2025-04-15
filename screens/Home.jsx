import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const endpoint = activeTab === 'friends' 
          ? 'http://localhost:3000/friendsFeed' 
          : 'http://localhost:3000/localFeed';
        
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [activeTab]);

  return (
    <div style={styles.container}>
      <div style={styles.tabContainer}>
        <span 
          style={activeTab === 'friends' ? styles.activeTabText : styles.tabText}
          onClick={() => setActiveTab('friends')}
        >
          Friends Feed
        </span>
        <span 
          style={activeTab === 'local' ? styles.activeTabText : styles.tabText}
          onClick={() => setActiveTab('local')}
        >
          Local Feed
        </span>
      </div>

      <div style={styles.feedContainer}>
        {posts.map((post, index) => (
          <div key={index} style={styles.postCard}>
            <img src={post.imageUrl} alt="Post" style={styles.postImage} />
            <div style={styles.postInfo}>
              <div style={styles.postHeader}>
                <span style={styles.username}>{post.username}</span>
                <span style={styles.date}>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <p style={styles.description}>{post.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#2d3748',
    minHeight: '100vh',
    padding: '20px',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    gap: '20px',
  },
  tabText: {
    fontSize: '18px',
    color: '#ccc',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  activeTabText: {
    fontSize: '18px',
    color: '#48bb78',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderBottom: '2px solid #48bb78',
    paddingBottom: '2px',
  },
  feedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#4a5568',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '20px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    fontFamily: 'inherit',
  },
  postImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
  },
  postInfo: {
    padding: '15px',
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  username: {
    color: '#68d391',
    fontWeight: 'bold',
  },
  date: {
    color: '#ccc',
    fontSize: '12px',
  },
  description: {
    color: '#eee',
    fontSize: '14px',
  },
};

export default Home;
