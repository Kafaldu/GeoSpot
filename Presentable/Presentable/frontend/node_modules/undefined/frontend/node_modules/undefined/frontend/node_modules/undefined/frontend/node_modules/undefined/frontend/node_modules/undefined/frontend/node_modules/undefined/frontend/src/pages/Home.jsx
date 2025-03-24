import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const email = location.state?.email; // Get email from state if passed

  useEffect(() => {
    if (email) {
      axios.post('http://localhost:3000/home', { email })
        .then(result => {
          setUser(result.data); // Set user data
          setLoading(false);
        })
        .catch(err => {
          setError("Error fetching user data");
          setLoading(false);
        });
    }
  }, [email]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while user data is being fetched
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>; // Show error message if any
  }

  if (!user) {
    return <div>User not found</div>; // Show message if no user is found
  }

  return (
    <div style={styles.container}>
      {/* Profile Picture */}
      <img
        src={user.profilePicture || "/images/profile-placeholder.png"}
        alt="Profile Picture"
        style={styles.profilePicture}
      />

      {/* Username */}
      <h1 style={styles.username}>{user.username}</h1>

      {/* User Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statsColumn}>
          <p style={styles.statsText}>User Level: {user.level || "N/A"}</p>
          <p style={styles.statsText}>Spots Visited: {user.spotsVisited || 0}</p>
        </div>
        <div style={styles.statsColumn}>
          <p style={styles.statsText}>Streak: {user.streak || 0} Days</p>
          <p style={styles.statsText}>Member Since: {user.memberSince || "Jan 2024"}</p>
        </div>
      </div>

      {/* Pet Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Your Pet</h2>
        <img
          src={user.petImage || "/images/pet-placeholder.png"}
          alt="Pet"
          style={styles.petImage}
        />
      </div>

      {/* Photos Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Your Photos</h2>
        <div style={styles.photoGrid}>
          {user.photos?.map((photo, index) => (
            <div key={index} style={styles.photoItem}>
              <img src={photo} alt={`Photo ${index + 1}`} style={styles.photoImage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#2d3748",
    color: "#68d391",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "24px",
  },
  profilePicture: {
    borderRadius: "50%",
    width: "120px",
    height: "120px",
    marginBottom: "16px",
  },
  username: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "16px",
  },
  statsGrid: {
    display: "flex",
    justifyContent: "center",
    marginTop: "16px",
    marginBottom: "16px",
  },
  statsColumn: {
    margin: "0 20px",
    textAlign: "left",
  },
  statsText: {
    fontSize: "1rem",
    color: "#e2e8f0",
  },
  section: {
    marginTop: "32px",
    marginBottom: "32px",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "8px",
  },
  petImage: {
    borderRadius: "8px",
    width: "100px",
    height: "100px",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginTop: "16px",
  },
  photoItem: {
    width: "100%",
  },
  photoImage: {
    width: "100%",
    borderRadius: "8px",
    height: "auto",
  },
};

export default Home;
