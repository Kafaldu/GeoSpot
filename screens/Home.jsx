import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('token');
        const rawUser = localStorage.getItem('user');
  
        if (!rawUser) {
          console.error('User info not found in localStorage.');
          return; 
        }
  
        const userInfo = JSON.parse(rawUser);
        let endpoint = '';
  
        if (activeTab === 'friends') {
          endpoint = `http://localhost:3000/friendsFeed/${userInfo.uid}`;
        } else {
          endpoint = `http://localhost:3000/localFeed/${userInfo.location || 'Gainesville'}`;
        }
  
        const response = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
  
    fetchPosts();
  }, [activeTab]);
  
  const createTestPost = async () => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        console.error('User not found in localStorage');
        return;
      }
  
      const user = JSON.parse(rawUser);
      if (!user.email) {
        console.error('User email is missing');
        return;
      }
  
      const { data: dbUser } = await axios.get(`http://localhost:3000/user/${user.email}`);
      if (!dbUser || !dbUser.uid) {
        console.error('DB user not found');
        return;
      }
  
      await axios.post('http://localhost:3000/createPost', {
        userId: dbUser.uid,
        username: dbUser.username,
        userProfilePicture: dbUser.profilePicture, 
        imageUrl: 'https://picsum.photos/600/400',
        description: 'Exploring Gainesville!',
        location: 'Gainesville',
        date: new Date(),
      });
  
      alert('Test post created!');
    } catch (error) {
      console.error('Error creating test post:', error);
    }
  };
  
  

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

      <button onClick={createTestPost}>Create Test Post</button>

      <div style={styles.feedContainer}>
        {posts.map((post, index) => (
          <div key={index} style={styles.postCard}>
          <div style={styles.postHeader}>
  <img 
    src={post.userProfilePicture || 'https://via.placeholder.com/40'} 
    alt="Profile"
    style={styles.profileImage}
  />
  <div>
    <span style={styles.username}>{post.username}</span>
    <br />
    <span style={styles.date}>{new Date(post.date).toLocaleDateString()}</span>
  </div>
</div>

          <img src={post.imageUrl} alt="Post" style={styles.postImage} />
          <div style={styles.postInfo}>
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
    overflowY: 'auto', 
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
    marginRight: 10,
  },
  
  postHeader: {
    display: 'flex',
    alignItems: 'center',      
    padding: '10px 15px 0 15px', 
    marginBottom: '10px',
  },
  
};

export default Home;
