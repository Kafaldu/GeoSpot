import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';


const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addFriendsModalVisible, setAddFriendsModalVisible] = useState(false);
  const debounceTimeout = useRef(null);
  const navigation = useNavigation();
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const [isFollowingViewedUser, setIsFollowingViewedUser] = useState(false);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);

  const route = useRoute();
  const viewedEmail = route.params?.email;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!viewedEmail) {
        setError("No email provided.");
        setLoading(false);
        return;
      }
    
      try {
        const rawUser = await SecureStore.getItemAsync('user');
        if (!rawUser) {
          console.warn('No user found in SecureStore. Redirecting to login.');
          navigation.replace('Login');
          return;
        }

        const currentUserParsed = JSON.parse(rawUser);
        const currentUserEmail = currentUserParsed?.email;
        const currentUid = currentUserParsed?.uid;
        setCurrentUserUid(currentUid);
        setIsOwnProfile(currentUserEmail === viewedEmail);
    
        // Fetch viewed user
        const viewedUserResponse = await axios.post("https://geospotbackend.onrender.com/UserProfilePage", {
          email: viewedEmail,
        });
        const viewedUserData = viewedUserResponse.data;
    
        // Fetch current user 
        const currentUserResponse = await axios.post("https://geospotbackend.onrender.com/UserProfilePage", {
          email: currentUserEmail,
        });
        const currentUserData = currentUserResponse.data;
    
        //Check if current user follows the viewed user
        const followingArray = currentUserData.following || [];
        const isFollowing = followingArray.some(f => {
          if (typeof f === 'string') {
            return f === viewedUserData.uid;
          } else if (f?.uid) {
            return f.uid === viewedUserData.uid;
          }
          return false;
        });
    
        setIsFollowingViewedUser(isFollowing);
    
        //Set viewed user's data (not current user)
        const cleanedFollowing = (viewedUserData.following || []).map(f =>
          typeof f === 'string' ? { uid: f } : f
        );
    
        setUser({
          ...viewedUserData,
          following: cleanedFollowing,
        });
    
        setBioInput(viewedUserData.bio || '');
        setUsernameInput(viewedUserData.username || '');
    
        if (Array.isArray(viewedUserData.photos)) {
          setPhotoUrls(viewedUserData.photos.map(url => ({
            url,
            postedBy: viewedUserData.username,
            date: new Date().toLocaleDateString('en-US'),
          })));
        } else {
          setPhotoUrls([]); // fallback if no photos
        }
              
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    
  
    fetchUserData();
  }, [viewedEmail]);
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }
  
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
  
    if (!pickerResult.canceled) {
      const base64Img = `data:image/jpg;base64,${pickerResult.assets[0].base64}`;
  
      if (!user) {
        console.error("User not loaded yet, cannot upload image.");
        return;
      }
  
      // Upload
      axios.post('https://geospotbackend.onrender.com/updateProfilePicture', {
        email: viewedEmail,
        image: base64Img,
      })
      .then(response => {
        console.log('Profile picture updated successfully');
        // Refresh profile
        axios.post('https://geospotbackend.onrender.com/UserProfilePage', { email: viewedEmail })
          .then((result) => {
            setUser(result.data);
            setBioInput(result.data.bio || '');        
            setUsernameInput(result.data.username || ''); 
          })
          .catch(err => {
            console.error("Error reloading user profile:", err);
          });
      })
      .catch(error => {
        console.error('Error updating profile picture:', error);
      });
    }
  };
  
  const handleSavePetName = async () => {
    try {
      await axios.post('https://geospotbackend.onrender.com/updatePetName', {
        email: viewedEmail,
        petName: user.petName
      });
      alert('Pet name updated successfully!');
  
      // Refresh the user data after saving
      axios.post("https://geospotbackend.onrender.com/UserProfilePage", { email: viewedEmail })
        .then((result) => {
          setUser(result.data);
        })
        .catch(err => {
          console.error("Error refreshing user after pet name update:", err);
        });
  
    } catch (error) {
      console.error('Error updating pet name:', error);
      alert('Failed to update pet name.');
    }
  };

  const handleSearch = async () => {
  if (searchQuery.trim() === '') return;

  setIsSearching(true);
  try {
    const response = await axios.post('https://geospotbackend.onrender.com/search', {
      username: searchQuery,
      currentUserId: user.uid,
    });

    setSearchResults(response.data);
    setIsSearching(false);
  } catch (error) {
    console.error('Error searching for users:', error);
    setIsSearching(false);
  }
};

const handleLiveSearch = (query) => {
  if (debounceTimeout.current) {
    clearTimeout(debounceTimeout.current);
  }

  debounceTimeout.current = setTimeout(async () => {
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.post('https://geospotbackend.onrender.com/search', {
        username: query,
        currentUserId: user.uid, 
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching for users:', error);
    } finally {
      setIsSearching(false);
    }
  }, 300);
};

const handleFollow = async (targetUserId) => {
  console.log("Inside handleFollow");

  let storedUid = await AsyncStorage.getItem('userUid');

  if (!storedUid && user?.uid) {
    storedUid = user.uid;
    console.log("Fallback to user.uid:", storedUid);
  }

  console.log("Current user UID:", storedUid);
  console.log("Target user UID:", targetUserId);

  if (!storedUid || !targetUserId) {
    console.error('Missing current user UID or targetUserId');
    return;
  }

  try {
    const response = await axios.post('https://geospotbackend.onrender.com/follow', {
      currentUserId: storedUid,
      targetUserId,
    });

    if (response.data.message === "Followed successfully") {
      console.log("Followed successfully!");
      setIsFollowingViewedUser(true);

      setSearchResults(prevResults =>
        prevResults.map(result =>
          result.uid === targetUserId ? { ...result, isFollowing: true } : result
        )
      );
    } else {
      console.warn("Unexpected response from server:", response.data);
    }
  } catch (error) {
    console.error("Error sending follow request:", error);
  }

  // Refresh viewed user
  axios.post("https://geospotbackend.onrender.com/UserProfilePage", { email: viewedEmail })
  .then((result) => {
    setUser(result.data);
  })
  .catch(err => {
    console.error("Error refreshing viewed user after follow:", err);
  });
};

const handleUnfollow = async (targetUserId) => {
  try {
    const storedUid = await AsyncStorage.getItem('userUid');
    if (!storedUid || !targetUserId) return;

    const response = await axios.post('https://geospotbackend.onrender.com/unfollow', {
      currentUserId: storedUid,
      targetUserId,
    });

    if (response.data.message === "Unfollowed successfully") {
      setIsFollowingViewedUser(false);

      setSearchResults(prevResults =>
        prevResults.map(result =>
          result.uid === targetUserId ? { ...result, isFollowing: false } : result
        )
      );
    }
  } catch (error) {
    console.error("Error unfollowing user:", error);
  }

  // Refresh viewed user
  axios.post("https://geospotbackend.onrender.com/UserProfilePage", { email: viewedEmail })
  .then((result) => {
    setUser(result.data);
  })
  .catch(err => {
    console.error("Error refreshing viewed user after unfollow:", err);
  });
};
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  console.log(user);
  if (error) {
    return <Text>{error}</Text>;
  }
  return (
    <ScrollView style={styles.container}>
      
{/* Add Friends or Back Arrow depending on profile */}
<View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginTop: 20, marginBottom: 10 }}>

  {!isOwnProfile ? (
    <TouchableOpacity onPress={() => {
      AsyncStorage.getItem('userEmail').then(myEmail => {
        navigation.navigate("UserProfilePage", { email: myEmail });
      });
    }}>
      <Ionicons name="arrow-back-outline" size={30} color="#68d391" />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={() => setAddFriendsModalVisible(true)}>
      <Ionicons name="person-add-outline" size={30} color="#68d391" />
    </TouchableOpacity>
  )}
</View>



      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: user.profilePicture || 'https://res.cloudinary.com/dbmpdoet6/image/upload/v1744226231/jxz9tcyulimodvceq47f.png' }} 
          style={styles.profilePicture} 
        />
        

        <View style={styles.profileInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>
            {user.bio ? user.bio : "No bio yet"}
          </Text>
        </View>

      </View>

      {/* Edit Profile / Settings */}
      <View style={styles.buttonsContainer}>
  {isOwnProfile ? (
    <>
      <TouchableOpacity 
        style={styles.followButton} 
        onPress={() => setEditProfileModalVisible(true)}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsModalVisible(true)}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </>
  ) : (
    <TouchableOpacity 
      style={[
        styles.followButton, 
        { backgroundColor: isFollowingViewedUser ? "#aaa" : "#48bb78" }
      ]}
      onPress={() =>
        isFollowingViewedUser
          ? handleUnfollow(user.uid)
          : handleFollow(user.uid)
      }
    >
      <Text style={styles.buttonText}>
        {isFollowingViewedUser ? "Following" : "Follow"}
      </Text>
    </TouchableOpacity>
  )}
</View>


      {/* Stats Section*/}
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numPosts}</Text>
          <Text style={styles.statsLabel}>Posts</Text>
        </View>
        <TouchableOpacity onPress={() => setFollowersModalVisible(true)} style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numFollowers}</Text>
          <Text style={styles.statsLabel}>Followers</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFollowingModalVisible(true)} style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numFollowing}</Text>
          <Text style={styles.statsLabel}>Following</Text>
        </TouchableOpacity>
      </View>



      {/* User Stats Section */}
      <View style={styles.userStatsContainer}>
        <Text style={styles.statsTitle}>User Stats</Text>
        <View style={{ height: 1, backgroundColor: "#2d3748", marginVertical: 10 }} />
        <View style={styles.userStatsRow}>
          <View style={styles.userStatColumn}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>User Level:</Text>
              <Text style={styles.userStatValue}>{user.userLevel}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Spots Visited:</Text>
              <Text style={styles.userStatValue}>{user.spotsVisited}</Text>
            </View>
          </View>

          <View style={styles.userStatColumn}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Streak:</Text>
              <Text style={styles.userStatValue}>{user.streak}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Member Since:</Text>
              <Text style={styles.userStatValue}>
                {user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US') : 'Not available'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      

      {/* Pet Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.petTitle}>Your Pet</Text>
      </View>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => setPetModalVisible(true)}>
          <View style={styles.petImageContainer}>
            {/* Background Image */}
            <Image 
              source={{ uri: "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744232304/d8qvvsonsrd3em0asyn5.png" }} 
              style={styles.backgroundImage} 
            />
            
            {/* Pet Image */}
            <Image 
              source={{ uri: user.pet || "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/kispd3yrq5srohe7igiq.png" }}
              style={styles.petImage}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Photos Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.photosTitle}>Photos</Text>
      </View>
      <View style={styles.photosContainer}>
      {photoUrls.map((photo, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => {
            setSelectedPhoto(photo);  
            setModalVisible(true);  
          }}
        >
          <Image source={{ uri: photo.url }} style={styles.photo} />
        </TouchableOpacity>
      ))}
      </View>

      {/*Open Image*/}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              {/* Top section: Username and date */}
              {selectedPhoto && (
                <View style={styles.postHeader}>
                  <Text style={styles.postUsername}>{selectedPhoto.postedBy}</Text>
                  <Text style={styles.postDate}>{selectedPhoto.date}</Text>
                </View>
              )}
              {/* Image itself */}
              {selectedPhoto && (
                <Image source={{ uri: selectedPhoto.url }} style={styles.modalImage} />
              )}
            </View>
          </TouchableOpacity>
        </View>

      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
      <View style={styles.editProfileModalBackground}>
        <View style={styles.editProfileModalContent}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#68d391" }}>
            Edit Profile
          </Text>

          {/* Username Input */}
          <TextInput
            value={usernameInput}
            onChangeText={setUsernameInput}
            placeholder="Edit your username..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          {/* Bio Input */}
          <TextInput
            value={bioInput}
            onChangeText={setBioInput}
            placeholder="Edit your bio..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          {/* Change Profile Picture Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: "#4a5568", marginBottom: 15 }]}
            onPress={pickImage}
          >
            <Text style={{ color: "white" }}>Change Profile Picture</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => {
              axios.post('https://geospotbackend.onrender.com/updateProfile', {
                email: viewedEmail,
                username: usernameInput,
                bio: bioInput
              })
              .then(response => {
                console.log('Profile updated successfully');
            
                setUser(prev => ({
                  ...prev,
                  username: usernameInput,
                  bio: bioInput
                }));
            
                setEditProfileModalVisible(false);
              
                setTimeout(() => {
                  axios.post("https://geospotbackend.onrender.com/UserProfilePage", { email: viewedEmail })
                    .then((result) => {
                      setUser(result.data);
                      setBioInput(result.data.bio || '');
                      setUsernameInput(result.data.username || '');
                    })
                    .catch(err => {
                      console.error("Error refreshing user after update:", err);
                    });
                }, 1000); 
              })
              .catch(error => console.error('Error updating profile:', error));
            }}
        
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Save</Text>
      </TouchableOpacity>

      {/* Cancel Button */}
      <TouchableOpacity onPress={() => setEditProfileModalVisible(false)}>
        <Text style={{ color: "red", marginTop: 15 }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={settingsModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setSettingsModalVisible(false)}
>
  <View style={styles.editProfileModalBackground}>
    <View style={styles.editProfileModalContent}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#68d391" }}>
        Settings
      </Text>

      {/*Settings Options */}
      <TouchableOpacity style={styles.saveButton} onPress={() => alert('Notifications setting clicked!')}>
        <Text style={{ color: "white" }}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: "#4a5568", marginTop: 10 }]} onPress={() => alert('Privacy setting clicked!')}>
        <Text style={{ color: "white" }}>Privacy</Text>
      </TouchableOpacity>

      {/* Close Settings Button */}
      <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
        <Text style={{ color: "red", marginTop: 20 }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={petModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setPetModalVisible(false)}
>
  <View style={styles.petModalBackground}>
    <View style={styles.petModalContent}>
      
      {/* Close Button */}
      <TouchableOpacity onPress={() => setPetModalVisible(false)} style={{ alignSelf: "flex-end" }}>
        <Text style={{ color: "red", fontWeight: "bold" }}>Close</Text>
      </TouchableOpacity>

      {/* Pet Container */}
      <View style={styles.petModalImageContainer}>
        {/* Background Image */}
        <Image 
          source={{ uri: "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744232304/d8qvvsonsrd3em0asyn5.png" }} 
          style={styles.petModalBackgroundImage}
        />
        
        {/* Pet Image */}
        <Image
          source={{ uri: user.pet || "https://res.cloudinary.com/dbmpdoet6/image/upload/v1744230983/kispd3yrq5srohe7igiq.png" }}
          style={styles.petModalPetImage}
        />
      </View>

      {/* Pet Info */}
      <Text style={styles.petInfoText}>Name: {user.petName || "No Name Yet"}</Text>
      <Text style={styles.petInfoText}>Level: {user.petLevel !== undefined ? user.petLevel : "N/A"}</Text>
      <Text style={styles.petInfoText}>Currency: {user.petCurrency !== undefined ? user.petCurrency : 0} 🪙</Text>

      {isOwnProfile && (
        <>
          {/* Pet Name Input */}
          <TextInput
            value={user.petName}
            onChangeText={(text) => {
              setUser(prev => ({ ...prev, petName: text }));
            }}
            placeholder="Enter new pet name..."
            placeholderTextColor="#888"
            style={styles.input}
          />

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSavePetName}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Save Pet Name</Text>
          </TouchableOpacity>

          {/* Little Pet Shop Section */}
          <Text style={styles.shopTitle}>Pet Shop</Text>
          <View style={styles.shopContainer}>
            <TouchableOpacity style={styles.shopItem} onPress={() => alert('Bought a Hat!')}>
              <Text style={styles.shopItemText}>🎩 Hat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shopItem} onPress={() => alert('Bought a Toy!')}>
              <Text style={styles.shopItemText}>🧸 Toy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shopItem} onPress={() => alert('Bought a Snack!')}>
              <Text style={styles.shopItemText}>🍪 Snack</Text>
            </TouchableOpacity>
          </View>
        </>
      )}



    </View>
  </View>
</Modal>

{/* Add friends modal*/}
<Modal
  visible={addFriendsModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setAddFriendsModalVisible(false)}
>
  <View style={styles.editProfileModalBackground}>
    <View style={styles.editProfileModalContent}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#68d391" }}>
        Add Friends
      </Text>

      <TextInput
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          handleLiveSearch(text);
        }}
        placeholder="Search by username"
        placeholderTextColor="#aaa"
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleSearch}
        style={[styles.saveButton, { marginBottom: 10 }]}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Search</Text>
      </TouchableOpacity>

      {isSearching && <Text style={{ color: "#fff", marginBottom: 10 }}>Searching...</Text>}

      {searchResults.length > 0 && (
        <ScrollView style={{ maxHeight: 200, width: "100%" }}>
          {searchResults.map((resultUser) => (
            <View
              key={resultUser.uid}
              style={{
                backgroundColor: "#4a5568",
                padding: 12,
                marginBottom: 12,
                borderRadius: 10,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate("UserProfilePage", {
                  email: resultUser.email,   
                  uid: resultUser.uid        
                })}
                style={{ flex: 1 }}
              >
                <View>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>{resultUser.username}</Text>
                  <Text style={{ color: "#aaa", fontSize: 12 }}>{resultUser.email}</Text>
                </View>
              </TouchableOpacity>


              <TouchableOpacity
                disabled={resultUser.isFollowing}
                onPress={() => handleFollow(resultUser.uid)}
                style={{
                  backgroundColor: resultUser.isFollowing ? "#aaa" : "#38a169",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginLeft: 10,
                }}
              >
                <Text style={{ color: "#fff" }}>
                  {resultUser.isFollowing ? "Added" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        onPress={() => setAddFriendsModalVisible(false)}
        style={{ marginTop: 15 }}
      >
        <Text style={{ color: "red" }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={followersModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setFollowersModalVisible(false)}
>
  <View style={styles.editProfileModalBackground}>
    <View style={styles.editProfileModalContent}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#68d391" }}>
        Followers
      </Text>
      <ScrollView style={{ maxHeight: 300, width: "100%" }}>
        {user.followers && user.followers.map((follower) => (
          <TouchableOpacity
            key={follower.uid}
            onPress={() => {
              setFollowersModalVisible(false);
              navigation.navigate("UserProfilePage", {
                email: follower.email,
              });
            }}
            style={{
              backgroundColor: "#4a5568",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{follower.username}</Text>
            <Text style={{ color: "#aaa", fontSize: 12 }}>{follower.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => setFollowersModalVisible(false)}>
        <Text style={{ color: "red", marginTop: 15 }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

<Modal
  visible={followingModalVisible}
  transparent={true}
  animationType="slide"
  onRequestClose={() => setFollowingModalVisible(false)}
>
  <View style={styles.editProfileModalBackground}>
    <View style={styles.editProfileModalContent}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20, color: "#68d391" }}>
        Following
      </Text>
      <ScrollView style={{ maxHeight: 300, width: "100%" }}>
        {user.following && user.following.map((followed) => (
          <TouchableOpacity
            key={followed.uid}
            onPress={() => {
              setFollowingModalVisible(false);
              navigation.navigate("UserProfilePage", {
                email: followed.email,
              });
            }}
            style={{
              backgroundColor: "#4a5568",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>{followed.username}</Text>
            <Text style={{ color: "#aaa", fontSize: 12 }}>{followed.email}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity onPress={() => setFollowingModalVisible(false)}>
        <Text style={{ color: "red", marginTop: 15 }}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>



    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d3748",
    padding: 20,
  },
  profileContainer: {
    alignItems: "center",  
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,  
  },
  profileInfo: {
    alignItems: "center", 
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#68d391",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 5,
    textAlign: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  followButton: {
    backgroundColor: "#48bb78",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButton: {
    backgroundColor: "#4a5568",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "black",
    fontWeight: "bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statsItem: {
    alignItems: "center",
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#68d391",
  },
  statsLabel: {
    fontSize: 14,
    color: "#ccc",
    marginRight: 3,
  },
  petTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#68d391",
    marginBottom: 10,
  },
  photosTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#68d391",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  petImageContainer: {
    width: 300,
    height: 150,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#68d391",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a5568", 
    position: "relative",       
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, 
    resizeMode: "cover",
  },
  
  petImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain", 
  },
  
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    minHeight: 100, 
  },
  photo: {
    width: 100,
    height: 100,
    marginBottom: 5,
    borderWidth: 0.5,
    borderColor: "#2d3748",
  },
  userStatsContainer: {
    width: "100%",
    backgroundColor: "#4a5568",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#2d3748",
    marginBottom: 30, 
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#68d391",
    textAlign: "center",
    marginBottom: 10, 
  },
  userStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userStatColumn: {
    flex: 1,
    marginRight: 10,
  },
  userStatItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  userStatLabel: {
    fontSize: 16,
    color: "#ccc",
    flexShrink: 1,
  },
  userStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#68d391",
    flexShrink: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    width: "100%",
    backgroundColor: "#4a5568",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
  editProfileModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  editProfileModalContent: {
    width: "80%",
    backgroundColor: "#2d3748",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#4a5568",
    padding: 10,
    borderRadius: 8,
    color: "#fff",
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#48bb78",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#4a5568", 
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  petModalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  petModalContent: {
    width: "90%",
    backgroundColor: "#2d3748",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  petBigImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  petInfoText: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 5,
  },
  shopTitle: {
    fontSize: 20,
    color: "#68d391",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  shopContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  shopItem: {
    backgroundColor: "#48bb78",
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  shopItemText: {
    color: "white",
    fontWeight: "bold",
  },
  petModalImageContainer: {
    width: 300,
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    position: "relative", 
    marginBottom: 20,
    backgroundColor: "#4a5568",
  },
  
  petModalBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  
  petModalPetImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  modalContent: {
    backgroundColor: "#2d3748",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    width: 320,
    minHeight: 400,
  },
  
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  
  postUsername: {
    color: "#68d391",
    fontWeight: "bold",
    fontSize: 16,
  },
  
  postDate: {
    color: "#ccc",
    fontSize: 12,
  },
  
});


export default UserProfilePage;
