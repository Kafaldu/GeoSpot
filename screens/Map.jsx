import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import polyline from '@mapbox/polyline';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

function getDistanceInMiles(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;
  return distanceMiles.toFixed(2);
}


const MapScreen = () => {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState({
    latitude: 29.650506721915335,
    longitude: -82.34286694879195,
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeUntilReveal, setTimeUntilReveal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [hintText, setHintText] = useState('This is your hint! 🌟');
  const [routeCoords, setRouteCoords] = useState([]);
  const [user, setUser] = useState(null);
  const [customRevealTime, setCustomRevealTime] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [distanceToDestination, setDistanceToDestination] = useState(null);

  const isNearDestination = location && destination && (
    Math.abs(location.latitude - destination.latitude) < 0.001 &&
    Math.abs(location.longitude - destination.longitude) < 0.001
  );

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    if (location && destination) {
      const miles = getDistanceInMiles(
        location.latitude,
        location.longitude,
        destination.latitude,
        destination.longitude
      );
      setDistanceToDestination(miles);
    }
  }, [location, destination]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('https://geospotbackend.onrender.com/api/locations');
        const data = await res.json();
        console.log('📍 Available locations:', data);
        setAvailableLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
  
    fetchLocations();
  }, []);

  useEffect(() => {
    if (isRevealed && location && destination) {
      fetchRoute();
    }
  }, [isRevealed, location, destination]); // Remove isRevealed from dependency list
  
  useEffect(() => {
    if (!isRevealed) {
      setRouteCoords([]);
    }
  }, [isRevealed]);
  

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const revealTime = customRevealTime ?? (() => {
        const defaultTime = new Date();
        defaultTime.setHours(9, 0, 0, 0);
        return defaultTime;
      })();
  
      if (now >= revealTime) {
        if (!isRevealed) setIsRevealed(true); // optional redundancy protection
        setTimeUntilReveal("📍 Today’s spot is revealed!");
      } else {
        const diff = revealTime - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilReveal(`🕒 ${hrs}:${mins}:${secs} until reveal`);
      }
      
    };
  
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [customRevealTime]);
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) setUser(JSON.parse(storedUser));
          else console.warn('⚠️ No user stored in AsyncStorage');
        }
      } catch (err) {
        console.error('Failed to load user from storage:', err);
      }
    };
    fetchUser();
  }, []);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Please enable camera access in settings.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7, base64: true });
      if (!result.cancelled) {
        const asset = result.assets?.[0];
        if (!asset || !asset.base64) {
          Alert.alert("Error", "Image capture failed or base64 not found.");
          return;
        }

        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        const uploadResponse = await fetch('https://geospotbackend.onrender.com/uploadPhoto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const uploadData = await uploadResponse.json();
        const imageUrl = uploadData.imageUrl;
        if (!imageUrl) return Alert.alert("Upload failed", "Could not get image URL.");

        const userData = await SecureStore.getItemAsync('user');
        const parsedUser = userData ? JSON.parse(userData) : null;
        if (!parsedUser?.uid) return Alert.alert("Error", "Could not find your account info.");

        const postResponse = await fetch('https://geospotbackend.onrender.com/createPost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: parsedUser.uid,
            username: parsedUser.username,
            imageUrl,
            location: 'Gainesville',
            description: 'Exploring the spot!'
          }),
        });
        await postResponse.json();
        Alert.alert("✅ Post created!", "Your photo has been uploaded.");
      }
    } catch (err) {
      console.error("❌ handlePickImage error:", err);
      Alert.alert("Something went wrong", err.message || "Unknown error");
    }
  };

  const simulateArrival = () => {
    setLocation(destination);
    console.log('🔁 Teleported to destination:', destination);
  };

  const fetchRoute = async () => {
    if (!location || !destination) return;
  
    const origin = `${location.latitude},${location.longitude}`;
    const dest = `${destination.latitude},${destination.longitude}`;
    const GOOGLE_MAPS_API_KEY = 'AIzaSyCSV46SoFOq-rrbnV5V8VkPU3mVoZw-xHM';
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
  
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
  
        // Animate the route in one by one
        let current = [];
        for (let i = 0; i < coords.length; i++) {
          current.push(coords[i]);
          setRouteCoords([...current]); // Force re-render
          await new Promise((res) => setTimeout(res, 20)); // Adjust speed here
        }
      } else {
        console.warn('No route found');
      }
    } catch (err) {
      console.error('Failed to fetch directions:', err);
    }
  };
  

  const changeToRandomLocation = async () => {
    if (availableLocations.length === 0) {
      console.warn('⚠️ No available locations to switch to!');
      return;
    }
  
    try {
      // Get latest user location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords); // 👈 update to actual user location
  
      const next = availableLocations[Math.floor(Math.random() * availableLocations.length)];
      console.log('📍 Switching to location:', next);
  
      if (next?.coordinates?.lat && next?.coordinates?.lng) {
        setDestination({
          latitude: next.coordinates.lat,
          longitude: next.coordinates.lng,
        });
        setIsRevealed(false);
        setRouteCoords([]);
        setHintText(next.description || 'No hint found for this location');
        setCustomRevealTime(new Date(Date.now() + 5000)); // auto-reveal in 5 sec
        Alert.alert("🔁 New destination set!", next.name);
      } else {
        console.warn('⚠️ Chosen location has invalid coordinates:', next);
      }
    } catch (error) {
      console.error('❌ Error fetching current location:', error);
      Alert.alert('Failed to get your current location. Please try again.');
    }
  };
  
  

  const revealDestinationNow = () => {
    setIsRevealed(false); // 👈 Hide destination & path during countdown
    const in10Seconds = new Date(Date.now() + 10000);
    setCustomRevealTime(in10Seconds);
  
    setTimeout(async () => {
      setIsRevealed(true);
  
      // ⏳ Wait until location is defined (max 5 tries)
      for (let i = 0; i < 5; i++) {
        if (location && location.latitude && location.longitude) {
          await fetchRoute();
          break;
        }
        console.warn(`⏱ Waiting for location... try ${i + 1}`);
        await new Promise((res) => setTimeout(res, 1000));
      }
    }, 10000);
  };
  
  
  

  if (!location) return <View style={styles.container}><Text>Loading map...</Text></View>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        customMapStyle={mapStyles}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {isRevealed && routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeColor="#00BFFF" strokeWidth={4} />
        )}
        {isRevealed && (
          <Marker coordinate={destination} title="Destination" pinColor="green" />
        )}
      </MapView>

      <View style={styles.overlay}>
        <Text style={styles.revealLabel}>{timeUntilReveal}</Text>
        <Text style={styles.distanceLabel}>
    📍 {distanceToDestination} miles away
  </Text>
      </View>

      

      {isRevealed && (
        <TouchableOpacity style={styles.hintButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>?</Text>
        </TouchableOpacity>
      )}

      {isNearDestination && (
        <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
          <Text style={styles.buttonText}>📷</Text>
        </TouchableOpacity>
      )}

      <View style={styles.testButtonsContainer}>
        <TouchableOpacity style={styles.testButton} onPress={revealDestinationNow}>
          <Text style={styles.testButtonText}> Reveal Destination</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={simulateArrival}>
          <Text style={styles.testButtonText}> Teleport to Spot</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.testButton} onPress={changeToRandomLocation}>
          <Text style={styles.testButtonText}> Change Test Location</Text>
        </TouchableOpacity>

      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{hintText}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4a5568' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2d3748' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4a5568' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a202c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] }
];


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  revealLabel: {
    backgroundColor: '#4a5568',
    color: '#68d391',
    padding: 10,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#4299e1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },  
  hintButton: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: '#4299e1',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },  
  testButtonsContainer: {
    position: 'absolute',
    bottom: 20, // ⬇️ was 160, lowered for more spacing
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  
  testButton: {
    backgroundColor: '#f6ad55',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    marginBottom: 8,
  },
  testButtonText: {
    color: '#2d3748',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2d3748',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    color: '#fff',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#f6ad55',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  distanceLabel: {
    backgroundColor: '#4a5568',
    color: '#68d391',
    padding: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default MapScreen;