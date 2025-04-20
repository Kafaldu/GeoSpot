/*import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Circle, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { FaCamera, FaStar } from 'react-icons/fa';
import ReactModal from 'react-modal';
import { MdCameraAlt, MdNoPhotography } from 'react-icons/md';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 29.647087787850563,
  lng: -82.34647508099067,
};

const libraries = ['geometry'];

const Map = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCSV46SoFOq-rrbnV5V8VkPU3mVoZw-xHM',
    libraries,
  });

  const [availableLocations, setAvailableLocations] = useState([]);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const mapRef = useRef(null);

  const [directions, setDirections] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);

  const [timeUntilReveal, setTimeUntilReveal] = useState('');

  const [customRevealTime, setCustomRevealTime] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const [isHintOpen, setIsHintOpen] = useState(false);
  const [currentHint, setCurrentHint] = useState('');

  const isNearLocation = isRevealed && parseFloat(distanceToDestination) <= 0.01;

  const [destination, setDestination] = useState({
    lat: 29.650506721915335,
    lng: -82.34286694879195,
  });

  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);


  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://YOUR IP HERE:3000/api/locations');
        const data = await res.json();
        console.log('Fetched locations:', data); 
        setAvailableLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };
  
    fetchLocations();
  }, []);
  
  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting initial location:', error);
          setCurrentLocation(defaultCenter);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCurrentLocation(newLocation);

          if (mapRef.current) {
            mapRef.current.panTo(newLocation);
          }
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.log('Geolocation not supported');
      setCurrentLocation(defaultCenter);
    }
  }, []);

  useEffect(() => {
    if (
      currentLocation &&
      window.google &&
      window.google.maps &&
      typeof window.google.maps.DirectionsService === 'function'
    ) {
      const directionsService = new window.google.maps.DirectionsService();
  
      directionsService.route(
        {
          origin: currentLocation,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error fetching directions:', result);
          }
        }
      );
    } else {
      console.warn('Google Maps API not fully loaded yet for DirectionsService');
    }
  }, [currentLocation, destination]);
  
  
  useEffect(() => {
    if (
      currentLocation &&
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      window.google.maps.geometry &&
      typeof window.google.maps.LatLng === 'function'
    ) {
      const userLatLng = new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng);
      const destinationLatLng = new window.google.maps.LatLng(destination.lat, destination.lng);
  
      const distanceMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
        userLatLng,
        destinationLatLng
      );
  
      setDistanceToDestination((distanceMeters / 1609.344).toFixed(2)); 
    }
  }, [currentLocation, destination]);
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const revealTime = customRevealTime ? new Date(customRevealTime) : new Date();
      if (!customRevealTime) {
        revealTime.setHours(9, 0, 0, 0); 
      }
  
      if (now >= revealTime) {
        setTimeUntilReveal("📍 Today’s spot is revealed!");
        setIsRevealed(true);
      } else {
        setIsRevealed(false);
        const diff = revealTime - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
        setTimeUntilReveal(
          `🕒 ${hours.toString().padStart(2, '0')}:${minutes
            .toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} until next reveal`
        );
      }
    };
  
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
  
    return () => clearInterval(interval);
  }, [customRevealTime]);
  
  useEffect(() => {
    if (!isRevealed && currentLocation && mapRef.current) {
      mapRef.current.panTo(currentLocation);
    }
  }, [isRevealed, currentLocation]);

  const handleCameraClick = () => {
    if (!isNearLocation) {
      alert("You're too far from the location to use the camera.");
      return;
    }
  
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Triggers the hidden file input
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setPhotoFile(file);
  
    const formData = new FormData();
    formData.append('photo', file);
  
    try {
      const res = await fetch('http://YOUR IP HERE:3000/api/posts/uploadPhoto', {
        method: 'POST',
        body: formData,
      });
  
      const result = await res.json();
      if (res.ok) {
        console.log('✅ Photo uploaded successfully:', result);
        alert('✅ Photo uploaded!');
      } else {
        console.error('❌ Upload failed:', result);
        alert('Upload failed');
      }
    } catch (err) {
      console.error('❌ Error uploading photo:', err);
      alert('Upload error');
    }
  };
  


  const handleTestChangeLocation = () => {
    if (destination) {
      setCurrentLocation(destination);
      console.log("✅ Current location manually set to destination for testing.");
    } else {
      console.warn("⚠️ No destination defined yet.");
    }
    /*console.log('🔁 Change Location Button Clicked');
    if (availableLocations.length === 0) {
      console.warn('⚠️ No available locations to switch to!');
      return;
    }
  
    const next = availableLocations[Math.floor(Math.random() * availableLocations.length)];
    console.log('📍 Switching to location:', next);
  
    if (next?.coordinates?.lat && next?.coordinates?.lng) {
      setDestination({
        lat: next.coordinates.lat,
        lng: next.coordinates.lng,
      });
    } else {
      console.warn('⚠️ Chosen location has invalid coordinates:', next);
    }/
  };

  const handleHintClick = () => {
    const matchedLocation = availableLocations.find(
      (loc) =>
        loc.coordinates.lat === destination.lat &&
        loc.coordinates.lng === destination.lng
    );
  
    if (matchedLocation) {
      setCurrentHint(matchedLocation.description || 'No description available.');
    } else {
      setCurrentHint('No hint found for this location.');
    }
  
    setIsHintOpen(true);
  };
  
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded || !currentLocation) return <div>Loading Maps...</div>;

  return (
    <div style={{ backgroundColor: '#2d3748', height: '100vh', color: '#fff', position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={17}
        center={currentLocation}
        options={mapOptions}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Moving Blue Dot /}
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8, 
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          }}
          clickable={false}
        />

{isRevealed && directions && (
  <DirectionsRenderer
    directions={directions}
    options={{
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#00BFFF',
        strokeWeight: 5,
      },
    }}
  />
)}

{isRevealed && isLoaded && window.google?.maps?.Size && (
  <Marker
    position={destination}
    icon={{
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    }}
  />
)}


      </GoogleMap>
      
      <div style={styles.infoRow}>
        <div style={styles.revealLabel}>
          {timeUntilReveal}
        </div>
        <div style={styles.distanceLabel}>
          {isRevealed && distanceToDestination
            ? `📍 ${distanceToDestination} miles away`
            : '📍 ??? miles away'}
        </div>
      </div>

      <button
        onClick={handleTestChangeLocation}
        style={{
          position: 'absolute',
          bottom: '160px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 16px',
          backgroundColor: '#f6ad55',
          color: '#2d3748',
          borderRadius: '10px',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 10
        }}
      >
        🔁 Change Test Location
      </button>

      <button
        onClick={() => {
          const testTime = new Date(Date.now() + 10000); 
          console.log("🕒 Custom reveal time set to:", testTime.toLocaleTimeString());
          setCustomRevealTime(testTime);
        }}
        style={{
          position: 'absolute',
          bottom: '220px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 16px',
          backgroundColor: '#90cdf4',
          color: '#2d3748',
          borderRadius: '10px',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        🧪 Test Reveal Timer
      </button>


      {/* Camera Button /}
      <button style={styles.cameraButton} onClick={handleCameraClick}>
        {isNearLocation ? (
          <MdCameraAlt size={24} color="#2d3748" />
        ) : (
          <MdNoPhotography size={24} color="#2d3748" style={{ opacity: 0.3, textDecoration: 'line-through' }} />
        )}
      </button>

      {/* Hint Button /}
      {isRevealed && (
        <button style={styles.hintButton} onClick={handleHintClick}>
          <span style={{ fontSize: 28, color: '#2d3748' }}>?</span>
        </button>
      )}

<ReactModal
  isOpen={isHintOpen}
  onRequestClose={() => setIsHintOpen(false)}
  style={{
    content: {
      backgroundColor: '#2d3748',
      color: '#fff',
      borderRadius: '10px',
      padding: '20px',
      width: 'fit-content',
      height: 'fit-content',
      inset: 'unset', 
      position: 'relative',
    },
    overlay: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  }}
  ariaHideApp={false}
>
  <h2 style={{ marginBottom: '10px' }}>📍 Hint</h2>
  <p style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{currentHint}</p>
  <button
    onClick={() => setIsHintOpen(false)}
    style={{
      marginTop: '20px',
      padding: '8px 16px',
      backgroundColor: '#f6ad55',
      color: '#2d3748',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
    }}
  >
    Close
  </button>
</ReactModal>

<input
  type="file"
  accept="image/*"
  capture="environment"
  ref={fileInputRef}
  onChange={handleFileChange}
  style={{ display: 'none' }}
/>


    </div>

    
  );
};

const styles = {
  cameraButton: {
    position: 'absolute',
    bottom: '80px',
    right: '20px',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#4299e1',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  starButton: {
    position: 'absolute',
    bottom: '80px',
    left: '20px',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#4299e1',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  infoRow: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '4px',
    zIndex: 1,
  },
  
  revealLabel: {
    backgroundColor: '#4a5568',
    padding: '6px 12px',
    borderRadius: 10,
    color: '#68d391',
    fontWeight: '600',
    fontSize: 13,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
    fontFamily: 'System',
    textAlign: 'center',
    minWidth: '120px',
  },
  
  distanceLabel: {
    backgroundColor: '#4a5568',
    padding: '6px 12px',
    borderRadius: 10,
    color: '#68d391',
    fontWeight: '600',
    fontSize: 13,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.3)',
    fontFamily: 'System',
    textAlign: 'center',
    minWidth: '120px',
  },
  hintButton: {
    position: 'absolute',
    bottom: '80px',
    left: '20px',
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: '#4299e1',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  
  
  
  
  
  
};

const mapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  scrollwheel: true,
  gestureHandling: 'greedy',
};


export default Map;*/

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import polyline from '@mapbox/polyline';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [imageUri, setImageUri] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [user, setUser] = useState(null);
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
    if (isRevealed && location && destination) {
      fetchRoute();
    }
  }, [isRevealed, location, destination]);  

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const revealTime = new Date();
      revealTime.setHours(9, 0, 0, 0); // 9AM

      if (now >= revealTime) {
        setIsRevealed(true);
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
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            console.warn('⚠️ No user stored in AsyncStorage');
          }
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
  
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
  
      if (!result.cancelled) {
        //setImageUri(result.uri);

        const asset = result.assets?.[0]; // ✅ safely grab the asset
        if (!asset || !asset.base64) {
          Alert.alert("Error", "Image capture failed or base64 not found.");
          return;
        }

        const base64Image = `data:image/jpeg;base64,${asset.base64}`;
        //const uploadedUrl = await uploadToCloudinary(base64Image);
        console.log("📤 Base64 being sent:", base64Image.slice(0, 100));

        const uploadResponse = await fetch('http://YOUR IP HERE:3000/uploadPhoto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });

        const uploadData = await uploadResponse.json();
        console.log("🌐 Cloudinary upload response:", uploadData);
        const imageUrl = uploadData.imageUrl;

        if (!imageUrl) {
          Alert.alert("Upload failed", "Could not get image URL.");
          return;
        }
  
        // ✅ Create the post after upload
        const userData = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(userData);

        const postResponse = await fetch('http://YOUR IP HERE:3000/createPost', {
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

        const postData = await postResponse.json();

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
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // 🔐 Replace with your real API key
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=walking&key=${apiKey}`
      );
      const data = await response.json();
  
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({ latitude: lat, longitude: lng }));
        setRouteCoords(coords);
      } else {
        console.warn('No route found');
      }
    } catch (err) {
      console.error('Failed to fetch directions:', err);
    }
  };  

  const updateDestinationToMyLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setDestination(loc.coords);
      console.log('📍 Destination updated to:', loc.coords);
      setIsRevealed(true); // Optional: auto-reveal after setting it
    } catch (error) {
      console.error('❌ Error fetching current location:', error);
      Alert.alert('Failed to update destination');
    }
  };

  const revealDestinationNow = () => {
    setIsRevealed(true);
    setTimeUntilReveal("📍 Destination manually revealed!");
  };

  const uploadToCloudinary = async (base64Image) => {
    try {
      const response = await fetch('http://YOUR IP HERE:3000/uploadPhoto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
  
      const data = await response.json();
      return data.imageUrl;
    } catch (err) {
      console.error('Upload to Cloudinary failed:', err);
      Alert.alert('Image upload failed');
    }
  };
  
  const createPost = async ({ userId, username, imageUrl, location, description }) => {
    try {
      const response = await fetch('http://YOUR IP HERE:3000/createPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          imageUrl,
          location,
          description,
        }),
      });
  
      const data = await response.json();
      Alert.alert('✅ Post created!');
      return data;
    } catch (err) {
      console.error('Post creation failed:', err);
      Alert.alert('❌ Failed to create post');
    }
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
        {isRevealed && (
          <>
            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#00BFFF"
                strokeWidth={4}
              />
            )}
            <Marker
              coordinate={destination}
              title="Destination"
              pinColor="green"
            />
          </>
        )}
      </MapView>

      {/* UI Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.revealText}>{timeUntilReveal}</Text>
      </View>

      {isRevealed && (
          <TouchableOpacity style={styles.hintButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Hint</Text>
          </TouchableOpacity>
        )}

      {isNearDestination && !imageUri && (
        <TouchableOpacity style={styles.cameraButton} onPress={handlePickImage}>
          <Text style={styles.buttonText}>📷</Text>
        </TouchableOpacity>
      )}

      {/* New bottom buttons container */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity style={styles.testButton} onPress={revealDestinationNow}>
          <Text style={styles.testButtonText}>👀 Reveal Destination Now</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={simulateArrival}>
          <Text style={styles.testButtonText}>🧪 Teleport to Destination</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={updateDestinationToMyLocation}>
          <Text style={styles.testButtonText}>📍 Set Destination to My Location</Text>
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
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#023e58' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
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
  revealText: {
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
    padding: 16,
    borderRadius: 40,
    zIndex: 10,
  },
  hintButton: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    backgroundColor: '#4299e1',
    padding: 16,
    borderRadius: 40,
    zIndex: 10,
  },
  testButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#f6ad55',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
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
  testButtonsContainer: {
    position: 'absolute',
    bottom: 160,
    width: '100%',
    alignItems: 'center',
    gap: 10, // spacing between buttons (RN 0.71+)
  },      
});

export default MapScreen;