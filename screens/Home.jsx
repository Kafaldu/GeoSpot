
import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, FlatList, StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

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
        endpoint = `https://geospotbackend.onrender.com/friendsFeed/${userInfo.uid}`;
      } else {
        endpoint = `https://geospotbackend.onrender.com/localFeed/${userInfo.location || 'Gainesville'}`;
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

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [activeTab])
  );

  

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
  
      const response = await fetch(`https://geospotbackend.onrender.com/user/${user.email}`);
      const dbUser = await response.json();
      if (!dbUser || !dbUser.uid) {
        console.error('DB user not found');
        return;
      }
  
      await fetch('https://geospotbackend.onrender.com/createPost', {
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
  
      Alert.alert(' Test post created!');
      fetchPosts(); //  Refetch posts to refresh the feed
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
