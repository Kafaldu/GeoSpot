/*import React, { useState, useEffect } from 'react';
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
          endpoint = `http://YOUR IP HERE:3000/friendsFeed/${userInfo.uid}`;
        } else {
          endpoint = `http://YOUR IP HERE:3000/localFeed/${userInfo.location || 'Gainesville'}`;
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
  
      const { data: dbUser } = await axios.get(`http://YOUR IP HERE:3000/user/${user.email}`);
      if (!dbUser || !dbUser.uid) {
        console.error('DB user not found');
        return;
      }
  
      await axios.post('http://YOUR IP HERE:3000/createPost', {
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

export default Home;*/

import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, FlatList, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const Home = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const debugSecureStore = async () => {
      const user = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('token');

      console.log("🔍 SecureStore user:", user);
      console.log("🔍 SecureStore token:", token);
    };
    debugSecureStore();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const rawUser = await SecureStore.getItemAsync('user');

        if (!rawUser) {
          console.warn('User info not found in SecureStore. Redirecting to login...');
          await SecureStore.deleteItemAsync('token');
          navigation.replace('Login');
          return;
        }

        const userInfo = JSON.parse(rawUser);
        let endpoint = '';

        if (activeTab === 'friends') {
          endpoint = `http://YOUR IP HERE:3000/friendsFeed/${userInfo.uid}`;
        } else {
          endpoint = `http://YOUR IP HERE:3000/localFeed/${userInfo.location || 'Gainesville'}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [activeTab]);

  const createTestPost = async () => {
    try {
      const rawUser = await SecureStore.getItemAsync('user');
      if (!rawUser) {
        console.error('User not found in SecureStore');
        return;
      }

      const user = JSON.parse(rawUser);
      if (!user.email) {
        console.error('User email is missing');
        return;
      }

      const response = await fetch(`http://YOUR IP HERE:3000/user/${user.email}`);
      const dbUser = await response.json();
      if (!dbUser || !dbUser.uid) {
        console.error('DB user not found');
        return;
      }

      await fetch('http://YOUR IP HERE:3000/createPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dbUser.uid,
          username: dbUser.username,
          userProfilePicture: dbUser.profilePicture,
          imageUrl: 'https://picsum.photos/600/400',
          description: 'Exploring Gainesville!',
          location: 'Gainesville',
          date: new Date(),
        }),
      });

      Alert.alert('✅ Test post created!');
    } catch (error) {
      console.error('Error creating test post:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('friends')}>
          <Text style={activeTab === 'friends' ? styles.activeTabText : styles.tabText}>Friends Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('local')}>
          <Text style={activeTab === 'local' ? styles.activeTabText : styles.tabText}>Local Feed</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={createTestPost} style={styles.createPostButton}>
        <Text style={styles.createPostButtonText}>📸 Create Test Post</Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image
                source={{ uri: item.userProfilePicture || 'https://via.placeholder.com/40' }}
                style={styles.profileImage}
              />
              <View>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              </View>
            </View>

            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            <View style={styles.postInfo}>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d3748',
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  tabText: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  activeTabText: {
    fontSize: 18,
    color: '#48bb78',
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#48bb78',
    paddingBottom: 2,
    marginHorizontal: 10,
  },
  createPostButton: {
    backgroundColor: '#48bb78',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  postCard: {
    backgroundColor: '#4a5568',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: '#68d391',
    fontWeight: 'bold',
  },
  date: {
    color: '#ccc',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postInfo: {
    padding: 15,
  },
  description: {
    color: '#eee',
    fontSize: 14,
  },
});

export default Home;
