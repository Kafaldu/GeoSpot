import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Home = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [currentPostId, setCurrentPostId] = useState(null);
  const [showComments, setShowComments] = useState({});
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
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
  
        const response = await axios.get(endpoint);
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
  
    fetchPosts();
  }, [activeTab]);

  const handleLike = async (postId) => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        console.error('User not found in localStorage');
        return;
      }
  
      const user = JSON.parse(rawUser);
      
      // Get full user from database to ensure we have the UID
      const { data: dbUser } = await axios.get(`http://localhost:3000/user/${user.email}`);
      if (!dbUser || !dbUser.uid) {
        console.error('DB user not found');
        return;
      }
      
      const response = await axios.post('http://localhost:3000/likePost', {
        postId,
        userId: dbUser.uid
      });
      
      // Update posts state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? {
            ...post,
            likes: post.likes.includes(dbUser.uid) 
              ? post.likes.filter(id => id !== dbUser.uid) 
              : [...post.likes, dbUser.uid]
          } : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
    setCurrentPostId(postId);
  };
  
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;
    
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        console.error('User not found in localStorage');
        return;
      }
  
      const user = JSON.parse(rawUser);
      
      // Get full user from database
      const { data: dbUser } = await axios.get(`http://localhost:3000/user/${user.email}`);
      if (!dbUser) {
        console.error('DB user not found');
        return;
      }
      
      const response = await axios.post('http://localhost:3000/addComment', {
        postId,
        userId: dbUser.uid,
        username: dbUser.username,
        userProfilePicture: dbUser.profilePicture,
        text: commentText
      });
      
      // Update posts state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId ? {
            ...post,
            comments: [...post.comments, response.data.comment]
          } : post
        )
      );
      
      // Clear comment text
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
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
              
              <div style={styles.actionsContainer}>
                <div 
                  style={styles.actionButton} 
                  onClick={() => handleLike(post._id)}
                >
                  <span style={{ color: post.likes?.includes(localStorage.getItem('userUid')) ? '#48bb78' : '#fff' }}>
                    ❤️ {post.likes?.length || 0}
                  </span>
                </div>
                <div 
                  style={styles.actionButton}
                  onClick={() => toggleComments(post._id)}
                >
                  💬 {post.comments?.length || 0}
                </div>
              </div>
              
              {showComments[post._id] && (
                <div style={styles.commentsSection}>
                  <div style={styles.commentsList}>
                    {post.comments && post.comments.length > 0 ? (
                      post.comments.map((comment, cIndex) => (
                        <div key={cIndex} style={styles.commentItem}>
                          <img 
                            src={comment.userProfilePicture || 'https://via.placeholder.com/30'} 
                            alt="Profile" 
                            style={styles.commentProfilePic} 
                          />
                          <div style={styles.commentContent}>
                            <span style={styles.commentUsername}>{comment.username}</span>
                            <p style={styles.commentText}>{comment.text}</p>
                            <span style={styles.commentDate}>
                              {new Date(comment.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noComments}>No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                  
                  <div style={styles.addCommentSection}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      style={styles.commentInput}
                    />
                    <button 
                      onClick={() => handleAddComment(post._id)}
                      style={styles.commentButton}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
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
    alignItems: 'center',
    padding: '10px 15px',
    gap: '10px',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    objectFit: 'cover',
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
    marginBottom: '15px',
  },
  actionsContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
  },
  actionButton: {
    cursor: 'pointer',
    fontSize: '14px',
  },
  commentsSection: {
    marginTop: '15px',
    borderTop: '1px solid #5a6478',
    paddingTop: '15px',
  },
  commentsList: {
    maxHeight: '200px',
    overflowY: 'auto',
    marginBottom: '15px',
  },
  commentItem: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  commentProfilePic: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    objectFit: 'cover',
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: '#68d391',
    fontWeight: 'bold',
    fontSize: '13px',
  },
  commentText: {
    color: '#eee',
    fontSize: '13px',
    margin: '3px 0',
  },
  commentDate: {
    color: '#ccc',
    fontSize: '10px',
  },
  addCommentSection: {
    display: 'flex',
    gap: '10px',
  },
  commentInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#2d3748',
    color: '#fff',
  },
  commentButton: {
    padding: '8px 15px',
    borderRadius: '20px',
    backgroundColor: '#48bb78',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  noComments: {
    color: '#ccc',
    fontSize: '13px',
    fontStyle: 'italic',
    textAlign: 'center',
  }
};

export default Home;
