import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Circle } from '@react-google-maps/api';
import { FaCamera, FaStar } from 'react-icons/fa';
import { Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 29.647087787850563,
  lng: -82.34647508099067,
};

const Map = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCSV46SoFOq-rrbnV5V8VkPU3mVoZw-xHM',
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const mapRef = useRef(null);

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

  const handleCameraClick = () => {
    setCameraOpen(true);
    alert('Camera would open here!');
  };

  const handleStarClick = () => {
    alert('Star button clicked!');
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
        {/* Moving Blue Dot */}
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
      </GoogleMap>

      {/* Camera Button */}
      <button style={styles.cameraButton} onClick={handleCameraClick}>
        <FaCamera size={24} color="#2d3748" />
      </button>

      {/* Star Button */}
      <button style={styles.starButton} onClick={handleStarClick}>
        <FaStar size={28} color="#2d3748" />
      </button>
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
};

export default Map;