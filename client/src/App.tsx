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
  const [mainAttractionz, setMainAttractionz] = useState<
    {
      name: string;
      reason: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    }[]
  >([]);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);

  const cities = [
    { name: 'New York', coords: [-74.006, 40.7128] },
    { name: 'San Francisco', coords: [-122.4194, 37.7749] },
    { name: 'Los Angeles', coords: [-118.2437, 34.0522] },
    { name: 'Tokyo', coords: [139.6917, 35.6895] },
    { name: 'Sydney', coords: [151.2093, -33.8688] },
    { name: 'Dubai', coords: [55.2708, 25.2048] },
  ];

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => console.log('HELLO RESPONSE:', data))
      .catch((err) => console.error('❌ Proxy not working:', err));
  }, []);

  const fetchCityAttractions = async (query: string) => {
    console.log('Searching for:', query);

    const request = await fetch('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userQuery: query }),
    });

    if (!request.ok) {
      throw new Error(`HTTP error! Status: ${request.status}`);
    }

    const data = await request.json();
    const parsedMessage = JSON.parse(data.message);
    setMainAttractionz(parsedMessage.mainAttractions);
    fetchMapApi(parsedMessage.city);
  };

  const flyToLocation = (lng, lat) => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });
      new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Searching for:', inputValue);
    await fetchCityAttractions(inputValue);

    const request = await fetch('http://localhost:3000/api/recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userQuery: inputValue }),
    });

    if (!request.ok) {
      // If the response status code is not in the 200–299 range
      throw new Error(`HTTP error! Status: ${request.status}`);
    }

    const data = await request.json();

    //console.log('Response from OpenAI:', data);
    //console.log('JSON string', data.message);
    //console.log(typeof data.message);
    const parsedMessage = JSON.parse(data.message);
    setMainAttractionz(parsedMessage.mainAttractions); // Set mainAttractionz to parsedMessage.mainAttractions;
    console.log(mainAttractionz);

    // const mainAttractionsList = mainAttractions.map((attraction) => {
    //   return `<li>${attraction}</li>`;
    // });
    // console.log('Main attractions list:', mainAttractionsList);
    // const mainAttractionsHTML = `<ul>${mainAttractionsList.join('')}</ul>`;
    // console.log('Main attractions HTML:', mainAttractionsHTML);
    // const mainAttractionsContainer = document.createElement('div');
    // mainAttractionsContainer.innerHTML = mainAttractionsHTML;
    // const popup = new mapboxgl.Popup()
    //   .setLngLat(mapRef.current.getCenter())
    //   .setHTML(mainAttractionsContainer.innerHTML)
    //   .addTo(mapRef.current);
    // console.log('Popup:', popup);

    const cityInfo = JSON.parse(data.message);
    const { city, mainAttractions } = cityInfo;

    fetchMapApi(city);

    //    if (data.features && data.features.length > 0) {
    //     const [lng, lat] = data.features[0].center;
  };

  const fetchMapApi = async (inputValue: string) => {
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
      //mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });

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

  useEffect(() => {
    if (!mapRef.current || mainAttractionz.length === 0) return;

    // 1. Clear old markers
    markers.forEach((marker) => marker.remove());

    const bounds = new mapboxgl.LngLatBounds();
    const newMarkers: mapboxgl.Marker[] = [];

    // 2. Add new markers
    mainAttractionz.forEach((place) => {
      const lngLat = [place.coordinates.longitude, place.coordinates.latitude];

      bounds.extend(lngLat);

      const marker = new mapboxgl.Marker({ color: '#FF5733' })
        .setLngLat(lngLat)
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<div style="color: black;">
            <strong>${place.name}</strong><br>${place.reason}
          </div>`
          )
        )
        .addTo(mapRef.current);

      newMarkers.push(marker);
    });

    mapRef.current.fitBounds(bounds, { padding: 50 });

    // 3. Save marker references for cleanup next time
    setMarkers(newMarkers);
  }, [mainAttractionz]);

  // Add the markers for the main attractions
  // mainAttractionz.forEach((place) => {
  //   new mapboxgl.Marker({ color: '#FF5733' })
  //     .setLngLat([place.coordinates.longitude, place.coordinates.latitude])
  //     .setPopup(new mapboxgl.Popup().setText(place.name))
  //     .addTo(mapRef.current);
  // });

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
          <img src='/planeimg.png' alt='plane-img' className='header-img' />
          {/* <img src='/maplogo.jpg' alt='maplogo' className='header-img' /> */}
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
                  className='header-img'
                /> */}
              </div>
            </div>
            <div className='home-search-container'>
              <div className='search-container'>
                <div className='button-title-container'>
                  <h2>Plan your trip</h2>

                  <div className='button-container'>
                    {cities.map((city) => (
                      <button
                        key={city.name}
                        className='button'
                        onClick={() => {
                          setInputValue(city.name);
                          fetchCityAttractions(city.name);
                        }}
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                  <ol className='main-attractions-list'>
                    {mainAttractionz.map((place, index) => (
                      <li key={index}>
                        <strong>{place.name}:</strong> {place.reason}
                      </li>
                    ))}
                  </ol>
                </div>
                <div className='form-container'>
                  <form onSubmit={handleSubmit} className='search-wrapper'>
                    <input
                      type='text'
                      className='search-input'
                      placeholder='Search or ask about any place...'
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button className='search-button' type='submit'>
                      ↑
                    </button>
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
