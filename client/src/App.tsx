import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRef } from 'react';

export default function App() {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Searching for:', inputValue);

    const accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        inputValue
      )}.json?access_token=${accessToken}`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;

      // Move the map
      mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });

      // Drop a marker
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
    } else {
      alert('Location not found!');
    }
  };

  const mapRef = useRef(null);
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

    const map = new mapboxgl.Map({
      container: 'map', // ID of the div where the map will render
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.006, 40.7128], // [lng, lat] = NYC
      zoom: 10,
    });

    mapRef.current = map;

    return () => map.remove(); // Clean up on unmount
  }, []);
  // useEffect(() => {
  //   const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  //   console.log('Google Maps API key:', googleMapsApiKey);

  //   const loadMapScript = () => {
  //     return new Promise((resolve, reject) => {
  //       if (document.getElementById('googleMapsScript')) {
  //         resolve(true);
  //         return;
  //       }

  //       const script = document.createElement('script');
  //       script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}`;
  //       script.id = 'googleMapsScript';
  //       script.async = true;
  //       script.defer = true;
  //       script.onload = () => resolve(true);
  //       script.onerror = () => reject('Google Maps script failed to load');
  //       document.body.appendChild(script);
  //     });
  //   };

  //   loadMapScript()
  //     .then(() => {
  //       if (window.google) {
  //         new window.google.maps.Map(document.getElementById('map')!, {
  //           center: { lat: 40.7128, lng: -74.006 },
  //           zoom: 10,
  //         });
  //       } else {
  //         console.error('Google Maps API is not available');
  //       }
  //     })
  //     .catch(console.error);
  // }, []);

  return (
    <div className='app'>
      <div className='header'>
        <div className='header-container'>
          <h1>Trip Planner</h1>
          {/* <img src='/planeimg.png' alt='plane' /> */}
        </div>
      </div>
      <div className='page-main'>
        <div className='home-container'>
          <div className='layout-container'>
            <div className='home-map-container'>
              <div className='map-container'>
                <div id='map'></div>
                {/* <img
                  src='/staticmap.jpg'
                  alt='static-map'
                  className='static-map'
                /> */}
              </div>
            </div>
            <div className='home-search-container'>
              <div className='search-container'>
                <div className='form-container'>
                  <form onSubmit={handleSubmit}>
                    <input
                      type='text'
                      placeholder='Enter a location...'
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button type='submit'>Search</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
