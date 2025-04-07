import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
// Placeholder content for user profile
const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const route = useRoute();
  const email = route.params?.email;


  // Simulate loading state
  useEffect(() => {
    if (email) {
      axios.post("http://localhost:3000/UserProfilePage", { email })
        .then((result) => {
          setUser(result.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load user data.");
          setLoading(false);
        });
    } else {
      setError("No email provided.");
      setLoading(false);
    }
  }, [email]);
  
  if (loading) {
    return <Text>Loading...</Text>;
  }
  console.log(user);
  if (error) {
    return <Text>{error}</Text>;
  }
  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileContainer}>
        {/* Profile Picture */}
        <Image
          source={{ uri: "https://via.placeholder.com/150" }}
          style={styles.profilePicture}
        />
        {/* Username and Bio */}
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>Add a cool bio here!</Text>
        </View>
      </View>

      {/* Follow / Message Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.buttonText}>Follow</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.messageButton}>
          <Text style={styles.buttonText}>Message</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section: Posts, Followers, Following */}
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numPosts}</Text>
          <Text style={styles.statsLabel}>Posts</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numFollowers}</Text>
          <Text style={styles.statsLabel}>Followers</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>{user.numFollowing}</Text>
          <Text style={styles.statsLabel}>Following</Text>
        </View>
      </View>

      {/* User Stats Section */}
      <View style={styles.userStats}>
        <Text style={styles.statsTitle}>User Stats</Text>
        <View style={styles.userStatsContainer}>
          <View style={styles.userStatColumn}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>User Level:      </Text>
              <Text style={styles.userStatValue}>{user.userLevel}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Spots Visited:     </Text>
              <Text style={styles.userStatValue}>{user.spotsVisited}</Text>
            </View>
          </View>
          <View style={styles.userStatColumn}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Streak:      </Text>
              <Text style={styles.userStatValue}>{user.streak}</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Member Since:      </Text>
              <Text style={styles.userStatValue}>{user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US') : 'Not available'}</Text>
              </View>
          </View>
        </View>
      </View>
      
      {/* Pet Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.petTitle}>Your Pet</Text>
      </View>
      <Image
        source={{ uri: "https://via.placeholder.com/100" }}
        style={styles.petImage}
      />

      {/* Photos Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.photosTitle}>Photos</Text>
      </View>
      <View style={styles.photosContainer}>
        {/* Placeholders for photos */}
        {[...Array(6)].map((_, index) => (
          <Image
            key={index}
            source={{ uri: "https://via.placeholder.com/100" }}
            style={styles.photo}
          />
        ))}
      </View>
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
  userStats: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  userStat: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
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
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 20,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  userStats: {
    marginBottom: 30,  
    paddingHorizontal: 15,
    alignItems: "center",  
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#68d391",
    marginBottom: 15,  
  },
  userStatsContainer: {
    width: "100%",  
    backgroundColor: "#4a5568",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#2d3748",
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
    justifyContent: "center"
  },
});

export default UserProfilePage;
