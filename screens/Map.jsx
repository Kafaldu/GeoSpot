import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, Circle, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { FaCamera, FaStar, FaExclamationTriangle } from 'react-icons/fa';
import ReactModal from 'react-modal';
import { MdCameraAlt, MdNoPhotography, MdCloudOff, MdRefresh } from 'react-icons/md';

// Fallback location data in case everything fails
const FALLBACK_LOCATIONS = [
  {
    name: "University of Florida",
    description: "The University of Florida campus in Gainesville.",
    coordinates: {
      lat: 29.643946,
      lng: -82.350482
    }
  },
  {
    name: "Ben Hill Griffin Stadium",
    description: "The Swamp - Home of the Florida Gators football team.",
    coordinates: {
      lat: 29.650180,
      lng: -82.347850
    }
  },
  {
    name: "Paynes Prairie Preserve",
    description: "A beautiful nature preserve with diverse wildlife.",
    coordinates: {
      lat: 29.525593,
      lng: -82.304382
    }
  }
];

// React Modal setup to prevent warnings
// Add this right before your Map component
ReactModal.setAppElement('#root');
try {
  ReactModal.setAppElement('#root');
} catch (e) {
  // Fallback for when #root is not available
  ReactModal.setAppElement('body');
}

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
    onError: () => console.error('Google Maps failed to load'),
  });

  const [availableLocations, setAvailableLocations] = useState([]);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState('');
  const [lastCacheUpdateTime, setLastCacheUpdateTime] = useState(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

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

  const [isLoading, setIsLoading] = useState(true);

  // Function to cache locations data using localStorage instead of AsyncStorage
  const cacheLocations = (locations) => {
    try {
      localStorage.setItem('cachedLocations', JSON.stringify(locations));
      localStorage.setItem('locationsCacheTime', new Date().toISOString());
      console.log('Locations cached successfully');
    } catch (error) {
      console.error('Error caching locations:', error);
    }
  };

  // Function to get cached locations using localStorage
  const getCachedLocations = () => {
    try {
      const cachedData = localStorage.getItem('cachedLocations');
      const cacheTime = localStorage.getItem('locationsCacheTime');
      
      if (cachedData) {
        setLastCacheUpdateTime(cacheTime ? new Date(cacheTime) : null);
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving cached locations:', error);
      return null;
    }
  };

  const fetchLocations = async () => {
    try {
      // Try to fetch from API first
      const res = await fetch('http://localhost:3000/api/locations');
      const data = await res.json();
      console.log('Fetched locations from API:', data);
      
      if (!data || data.length === 0) {
        throw new Error('No locations returned from API');
      }
      
      // Cache the fresh data
      cacheLocations(data);
      setAvailableLocations(data);
      setIsUsingCachedData(false);
      setApiErrorMessage('');
      
    } catch (err) {
      console.error('Failed to fetch locations from API:', err);
      
      // If API fetch fails, try to use cached data
      const cachedLocations = getCachedLocations();
      if (cachedLocations && cachedLocations.length > 0) {
        console.log('Using cached locations data:', cachedLocations);
        setAvailableLocations(cachedLocations);
        setIsUsingCachedData(true);
        setApiErrorMessage('Unable to connect to the server. Using cached data.');
        setIsOfflineModalOpen(true);
      } else {
        console.log('No cached data available, using fallback locations');
        setApiErrorMessage('No internet connection and no cached data available. Using fallback locations.');
        setIsOfflineModalOpen(true);
        
        // If no cached data is available, use fallback locations
        setAvailableLocations(FALLBACK_LOCATIONS);
        
        // Pick a random fallback location as destination
        const randomLocation = FALLBACK_LOCATIONS[Math.floor(Math.random() * FALLBACK_LOCATIONS.length)];
        setDestination({
          lat: randomLocation.coordinates.lat,
          lng: randomLocation.coordinates.lng
        });
      }
    } finally {
      // Always set loading to false when done
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
        setTimeUntilReveal("📍 Today's spot is revealed!");
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

  const handleRefreshData = async () => {
    try {
      setApiErrorMessage('Attempting to refresh data...');
      const res = await fetch('http://localhost:3000/api/locations');
      const data = await res.json();
      
      if (!data || data.length === 0) {
        throw new Error('No locations returned from API');
      }
      
      // Cache fresh data
      cacheLocations(data);
      setAvailableLocations(data);
      setIsUsingCachedData(false);
      setApiErrorMessage('');
      setIsOfflineModalOpen(false);
      
      console.log('Data refreshed successfully');
    } catch (err) {
      console.error('Failed to refresh data:', err);
      
      // use cached first
      const cachedLocations = getCachedLocations();
      if (cachedLocations && cachedLocations.length > 0) {
        setAvailableLocations(cachedLocations);
        setIsUsingCachedData(true);
        setApiErrorMessage('Still unable to connect to the server. Using cached data.');
      } else {
        // if no cached data, use 2nd option
        console.log('No cached data available for refresh, using fallback locations');
        setAvailableLocations(FALLBACK_LOCATIONS);
        setApiErrorMessage('No internet and no cached data. Using fallback locations.');
        
        // pick random fallback location as destination
        const randomLocation = FALLBACK_LOCATIONS[Math.floor(Math.random() * FALLBACK_LOCATIONS.length)];
        setDestination({
          lat: randomLocation.coordinates.lat,
          lng: randomLocation.coordinates.lng
        });
      }
    }
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
  
  useEffect(() => {
    if (loadError) {
      console.error('Google Maps API failed to load:', loadError);
      
      // if maps failed, use cached locations
      if (!availableLocations.length) {
        const cachedLocations = getCachedLocations();
        if (cachedLocations && cachedLocations.length > 0) {
          setAvailableLocations(cachedLocations);
        }
      }
    }
  }, [loadError]);

  const handleNetworkFailure = () => {
    return (
      <div style={styles.networkErrorContainer}>
        <MdCloudOff size={60} color="#F44336" />
        <h2>Cannot Connect to Server</h2>
        <p>We're having trouble connecting to the GeoSpot server.</p>
        
        <div style={styles.offlineOptions}>
          <button 
            onClick={handleRefreshData}
            style={styles.retryButton}
          >
            <MdRefresh size={20} /> Try Again
          </button>
          
          <button 
            onClick={() => setIsOfflineModalOpen(false)}
            style={styles.continueButton}
          >
            Continue with Limited Functionality
          </button>
        </div>
      </div>
    );
  };


  const safeModalSettings = {
    ariaHideApp: false,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEsc: true,
  };

  // offline modal
  const renderOfflineModal = () => (
    <ReactModal
      isOpen={isOfflineModalOpen}
      onRequestClose={() => setIsOfflineModalOpen(false)}
      style={styles.modal}
      contentLabel="Offline Mode"
      {...safeModalSettings}
    >
      <div style={styles.modalContent}>
        <MdCloudOff size={40} color="#F44336" />
        <h2>Offline Mode</h2>
        <p>{apiErrorMessage}</p>
        
        {lastCacheUpdateTime && (
          <p>Cache last updated: {lastCacheUpdateTime.toLocaleString()}</p>
        )}
        
        <div style={styles.modalButtons}>
          <button 
            onClick={handleRefreshData}
            style={styles.refreshModalButton}
          >
            <MdRefresh size={20} /> Try Again
          </button>
          <button 
            onClick={() => setIsOfflineModalOpen(false)}
            style={styles.closeButton}
          >
            Continue with Cached Data
          </button>
        </div>
      </div>
    </ReactModal>
  );

  // update hint to use safe settings
  const renderHintModal = () => (
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
      {...safeModalSettings}
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
  );

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading map and locations...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={styles.errorContainer}>
        <FaExclamationTriangle size={50} color="#FFC107" />
        <h2>Error loading Google Maps</h2>
        <p>Please check your internet connection and try again.</p>
        <div style={styles.errorDetails}>
          <p>Error details: {loadError.message}</p>
        </div>
        {availableLocations.length > 0 && (
          <div style={styles.locationsList}>
            <h3>Available Locations (Map not available)</h3>
            <ul>
              {availableLocations.map((location, index) => (
                <li key={index}>
                  <strong>{location.name}</strong>: {location.description}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button 
          onClick={() => window.location.reload()}
          style={styles.reloadButton}
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  if (!currentLocation) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p>Getting your location...</p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.mapContainer}>
        {isUsingCachedData && (
          <div style={styles.offlineBanner}>
            <MdCloudOff size={20} />
            <span>Offline Mode - Using Cached Data</span>
            <button 
              onClick={handleRefreshData}
              style={styles.refreshButton}
            >
              <MdRefresh size={20} /> Refresh
            </button>
          </div>
        )}

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={currentLocation || defaultCenter}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {/* Current user location marker */}
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />
          )}

          {/* Display destination marker if revealed */}
          {isRevealed && (
            <Marker
              position={destination}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              }}
            />
          )}

          {/* Display directions if available */}
          {isRevealed && directions && <DirectionsRenderer directions={directions} />}

          {/* Display user proximity circle */}
          {currentLocation && (
            <Circle
              center={currentLocation}
              radius={16} // 16 meters ~ 50 feet
              options={{
                fillColor: '#4285F4',
                fillOpacity: 0.3,
                strokeColor: '#4285F4',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          )}
        </GoogleMap>

        {/* Status bar at the top */}
        <div style={{
          ...styles.statusBar,
          top: isUsingCachedData ? '50px' : '10px'
        }}>
          <div style={styles.statusText}>{timeUntilReveal}</div>
          {isRevealed && (
            <div style={styles.distanceText}>
              📍 Distance: {distanceToDestination} miles
            </div>
          )}
        </div>

        {/* Camera button */}
        {isRevealed && (
          <button
            style={{
              ...styles.cameraButton,
              backgroundColor: isNearLocation ? '#4CAF50' : '#ccc',
            }}
            onClick={handleCameraClick}
            disabled={!isNearLocation}
          >
            <FaCamera size={24} />
          </button>
        )}

        {/* Render the offline modal separately */}
        {renderOfflineModal()}

        {/* Other existing components */}
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

        {/* Hint Button */}
        {isRevealed && (
          <button style={styles.hintButton} onClick={handleHintClick}>
            <span style={{ fontSize: 28, color: '#2d3748' }}>?</span>
          </button>
        )}

        {/* Replace the inline hint modal with the function */}
        {renderHintModal()}

        {/* Include a console log output for debugging */}
        <div style={{ display: 'none' }}>
          {console.log('Map Component State:', {
            isLoaded,
            loadError,
            currentLocation,
            availableLocations: availableLocations.length,
            isUsingCachedData
          })}
        </div>
      </div>
    </>
  );
};

const styles = {
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '100vh',
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F44336',
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  statusBar: {
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '20px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statusText: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  distanceText: {
    fontSize: '14px',
    marginTop: '5px',
  },
  cameraButton: {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
    cursor: 'pointer',
    zIndex: 10,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    textAlign: 'center',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
  },
  modal: {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '400px',
      width: '90%',
    },
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '100%',
    gap: '10px',
    marginTop: '20px',
  },
  refreshModalButton: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '4px',
    cursor: 'pointer',
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
  loadingSpinner: {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    borderLeft: '4px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px',
  },
  errorDetails: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: '4px',
    fontSize: '14px',
  },
  locationsList: {
    marginTop: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '15px',
    borderRadius: '8px',
    color: '#333',
    maxHeight: '300px',
    overflowY: 'auto',
    width: '100%',
    maxWidth: '500px',
  },
  reloadButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  networkErrorContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    textAlign: 'center',
  },
  offlineOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '20px',
    width: '100%',
    maxWidth: '300px',
  },
  retryButton: {
    padding: '12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  continueButton: {
    padding: '12px',
    backgroundColor: '#7f8c8d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Map;