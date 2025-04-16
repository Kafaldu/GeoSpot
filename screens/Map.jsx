import React, { useState, useEffect, useRef } from 'react';
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

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/locations');
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
  
    setCameraOpen(true);
    alert('Camera would open here!');
  };


  const handleTestChangeLocation = () => {
    console.log('🔁 Change Location Button Clicked');
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
    }
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


      {/* Camera Button */}
      <button style={styles.cameraButton} onClick={handleCameraClick}>
        {isNearLocation ? (
          <MdCameraAlt size={24} color="#2d3748" />
        ) : (
          <MdNoPhotography size={24} color="#2d3748" style={{ opacity: 0.3, textDecoration: 'line-through' }} />
        )}
      </button>

      {/* Hint Button */}
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


export default Map;