import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, FlatList, StyleSheet, TextInput, Modal } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

const Home = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('friends');
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showComments, setShowComments] = useState({});

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
    const loadUser = async () => {
      try {
        const rawUser = await SecureStore.getItemAsync('user');
        if (rawUser) {
          setUser(JSON.parse(rawUser));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
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

  const handleLike = async (postId) => {
    if (!user) {
      console.log("Cannot like: No user logged in");
      return;
    }
    
    console.log(`Attempting to like post: ${postId}`);
    
    try {
      const response = await fetch('https://geospotbackend.onrender.com/likePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          postId: postId,
          userId: user.uid 
        }),
      });
      
      if (!response.ok) {
        console.error(`Error liking post: ${response.status}`);
        Alert.alert('Error', 'Unable to like post');
        return;
      }
      
      const result = await response.json();
      console.log('Like result:', result);
      
      // Update posts state to reflect the like
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post._id === postId) {
            const isLiked = post.likes?.includes(user.uid);
            return {
              ...post,
              likes: isLiked 
                ? post.likes.filter(id => id !== user.uid) 
                : [...(post.likes || []), user.uid]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Unable to like post');
    }
  };

  const openCommentModal = (postId) => {
    setSelectedPostId(postId);
    setCommentText('');
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      return;
    }
    
    if (!user) {
      console.log("Cannot add comment: No user logged in");
      return;
    }
    
    try {
      const response = await fetch('https://geospotbackend.onrender.com/addComment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: selectedPostId,
          userId: user.uid,
          username: user.username,
          userProfilePicture: user.profilePicture || 'https://via.placeholder.com/40',
          text: commentText,
        }),
      });
      
      if (!response.ok) {
        console.error(`Error adding comment: ${response.status}`);
        Alert.alert('Error', 'Unable to add comment');
        return;
      }
      
      const result = await response.json();
      console.log('Comment result:', result);
      
      // Update posts state to include the new comment
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post._id === selectedPostId) {
            return {
              ...post,
              comments: [...(post.comments || []), result.comment]
            };
          }
          return post;
        })
      );
      
      setCommentText('');
      setCommentModalVisible(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Unable to add comment');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

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
  
      Alert.alert('Test post created!');
      fetchPosts(); // Refetch posts to refresh the feed
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
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={() => handleLike(item._id)}
                >
                  <Ionicons 
                    name={item.likes?.includes(user?.uid) ? "heart" : "heart-outline"} 
                    size={24} 
                    color={item.likes?.includes(user?.uid) ? "#e74c3c" : "#fff"} 
                  />
                  <Text style={styles.actionText}>
                    {item.likes?.length || 0} {item.likes?.length === 1 ? "like" : "likes"}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => toggleComments(item._id)}
                >
                  <Ionicons name="chatbubble-outline" size={22} color="#fff" />
                  <Text style={styles.actionText}>
                    {item.comments?.length || 0} {item.comments?.length === 1 ? "comment" : "comments"}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showComments[item._id] && (
                <View style={styles.commentsContainer}>
                  {item.comments && item.comments.length > 0 ? (
                    item.comments.map((comment, index) => (
                      <View key={index} style={styles.commentItem}>
                        <Image 
                          source={{ uri: comment.userProfilePicture || 'https://via.placeholder.com/30' }} 
                          style={styles.commentAvatar} 
                        />
                        <View style={styles.commentContent}>
                          <Text style={styles.commentUsername}>{comment.username}</Text>
                          <Text style={styles.commentText}>{comment.text}</Text>
                          <Text style={styles.commentDate}>
                            {new Date(comment.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.addCommentButton}
                    onPress={() => openCommentModal(item._id)}
                  >
                    <Text style={styles.addCommentText}>Add Comment</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
      
      <Modal
        visible={commentModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment..."
              placeholderTextColor="#888"
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCommentModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.postButton]}
                onPress={handleAddComment}
              >
                <Text style={styles.modalButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  date: {
    color: '#cbd5e0',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  postInfo: {
    padding: 12,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#2d3748',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  actionText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
  },
  commentsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#3a4556',
    borderRadius: 8,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
  },
  commentDate: {
    color: '#cbd5e0',
    fontSize: 10,
    marginTop: 2,
  },
  noCommentsText: {
    color: '#cbd5e0',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  addCommentButton: {
    backgroundColor: '#48bb78',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  addCommentText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#4a5568',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  commentInput: {
    backgroundColor: '#2d3748',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#718096',
  },
  postButton: {
    backgroundColor: '#48bb78',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default Home;