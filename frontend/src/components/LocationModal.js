import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, X, AlertCircle, Search } from 'lucide-react';
import { getAdminApiBase } from '../api/adminApiBase';

const LocationModal = ({ isOpen, onClose, onLocationSet }) => {
  const [pincode, setPincode] = useState('');
  const [, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [, setIsSearching] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDesc, setSelectedDesc] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // Try Nominatim first (with email parameter to prevent rate limits)
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: { lat: lat, lon: lng, format: 'json', email: 'test@mankathaspices.com' }
          });
          
          if (response.data && response.data.address && response.data.address.postcode) {
             const pin = response.data.address.postcode;
             const desc = response.data.display_name;
             checkLocation(pin, desc);
          } else {
             throw new Error("Nominatim failed or no postcode");
          }
        } catch (err) {
          console.warn("Nominatim failed, falling back to Photon...", err.message);
          
          // Fallback to Photon API (Free, returns accurate Indian pincodes)
          try {
            const fallbackResponse = await axios.get(`https://photon.komoot.io/reverse`, {
              params: { lat: lat, lon: lng }
            });
            
            if (fallbackResponse.data && fallbackResponse.data.features && fallbackResponse.data.features.length > 0) {
              const props = fallbackResponse.data.features[0].properties;
              
              const pin = props.postcode || props.city || "Unknown";
              const desc = props.name || props.locality || props.street || props.city || "Serviceable Area";
              
              checkLocation(pin, desc);
            } else {
              alert("Could not detect area from your location.");
              setLoading(false);
            }
          } catch (fallbackErr) {
            console.error("Both Geocoding APIs failed", fallbackErr);
            alert("Failed to reverse geocode location. Please search manually.");
            setLoading(false);
          }
        }
      },
      (error) => {
        alert("Location permission denied. Please allow location access.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const fetchNominatimFallback = async (query) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: { q: query, format: 'json', addressdetails: 1, countrycodes: 'in', limit: 8 }
      });
      if (response.data && response.data.length > 0) {
        const uniquePlaces = new Map();
        response.data.forEach(place => {
          const pin = place.address?.postcode || '';
          if (!uniquePlaces.has(place.place_id)) {
            uniquePlaces.set(place.place_id, {
              pin: pin || query,
              desc: place.display_name,
              rawName: place.name || ''
            });
          }
        });
        setSearchResults(Array.from(uniquePlaces.values()));
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Nominatim error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Search function using Google Places Autocomplete API with Nominatim fallback
  const fetchSearchResults = (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    if (window.google && window.google.maps && window.google.maps.places) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({
        input: query,
        componentRestrictions: { country: 'in' }, // Limit to India
      }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
           setIsSearching(false);
           const formatted = predictions.map(p => ({
              pin: null, // Will fetch pincode on click using Geocoder
              place_id: p.place_id,
              desc: p.description,
              rawName: p.structured_formatting.main_text
           }));
           setSearchResults(formatted);
        } else {
           // Fallback to Nominatim if Google fails (e.g. Android API key restriction)
           fetchNominatimFallback(query);
        }
      });
    } else {
      // Fallback
      fetchNominatimFallback(query);
    }
  };

  const handleLocationSelect = (item) => {
    if (item.place_id && window.google && window.google.maps) {
      setLoading(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: item.place_id }, (results, status) => {
        setLoading(false);
        if (status === 'OK' && results[0]) {
           const postalCodeObj = results[0].address_components.find(c => c.types.includes('postal_code'));
           const pin = postalCodeObj ? postalCodeObj.long_name : null;
           
           if (pin) {
              checkLocation(pin, item.desc);
           } else {
              // No pincode found for this place
              checkLocation(item.rawName, item.desc); // Fallback
           }
        } else {
           checkLocation(item.rawName, item.desc);
        }
      });
    } else {
      checkLocation(item.pin || item.rawName, item.desc);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setPincode(val);
    setResult(null);
    fetchSearchResults(val);
  };

  const clearSearch = () => {
    setPincode('');
    setSearchResults([]);
    setResult(null);
  };

  const handleEdit = () => {
    setStep(1);
    setResult(null);
  };

  const handleConfirm = () => {
    if (onLocationSet) onLocationSet(pincode.trim(), selectedCity, selectedDesc);
    onClose();
    setTimeout(() => {
      setStep(1);
      setResult(null);
    }, 300);
  };

  if (!isOpen) return null;

  const checkLocation = async (selectedPin, selectedDescription = '') => {
    const pinToCheck = selectedPin || pincode;
    if (!pinToCheck) return;
    
    setPincode(pinToCheck);
    setSearchResults([]);
    setLoading(true);
    try {
      const base = getAdminApiBase();
      const res = await axios.post(`${base}/service-areas/check-location`, { pincode: pinToCheck.trim() });
      
      setResult({
        success: res.data.success,
        available: res.data.available,
        message: res.data.message,
        city: res.data.city || ''
      });

      if (res.data.available) {
        setSelectedCity(res.data.city || '');
        setSelectedDesc(selectedDescription || pinToCheck);
        setStep(2);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Fallback: If backend isn't updated on production yet, assume location is available.
        setResult({
          success: true,
          available: true,
          message: "Location available (fallback)",
          city: "Serviceable Area"
        });
        setSelectedCity("Serviceable Area");
        setSelectedDesc(selectedDescription || pinToCheck);
        setStep(2);
      } else {
        setResult({
          success: false,
          available: false,
          message: "Failed to check service availability. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className={`bg-white w-full overflow-hidden relative shadow-2xl animate-scaleIn rounded-lg z-10 flex flex-col ${step === 2 ? 'max-w-2xl' : 'max-w-lg'}`}>
        
        {step === 1 ? (
          /* Step 1: Choose Delivery Location */
          <div className="p-8 pb-4 text-center">
            <h2 className="text-[22px] font-semibold text-[#333] mb-6">Choose your location</h2>
            
            {/* Input field exactly like DMart */}
            <div className="relative mb-6 z-20">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for area, street name or pincode.."
                value={pincode}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') checkLocation();
                }}
                className="w-full pl-12 pr-12 py-3.5 border border-[#2e8b57] rounded outline-none focus:ring-1 focus:ring-[#2e8b57] text-[15px] text-[#333] placeholder-gray-400 font-semibold"
              />
              {/* Clear button (X) */}
              {pincode && (
                <button 
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-0.5"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}

              {/* Live Autocomplete Dropdown */}
              {searchResults.length > 0 && !result && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-b-lg overflow-hidden text-left z-50">
                  <div className="px-4 py-3 text-[11px] font-bold text-gray-400 tracking-wider">
                    SEARCH RESULT
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchResults.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                        onClick={() => handleLocationSelect(item)}
                      >
                        <MapPin size={18} className="text-gray-300 mt-0.5 shrink-0" fill="#f3f4f6" />
                        <div>
                          <div className="font-bold text-[#333] text-[15px]">
                            {item.pin && /^\d+$/.test(item.pin) ? item.pin : item.rawName || 'Location'}
                          </div>
                          <div className="text-gray-500 text-[13px]">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detect Location Button */}
            <button 
              onClick={handleDetectLocation}
              className="flex items-center gap-2 text-[#2e8b57] font-semibold text-[14px] hover:text-[#218838] transition-colors z-20 relative mx-auto mb-6 bg-green-50 px-4 py-2 rounded-full border border-green-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Detect my current location
            </button>

            {/* Result Alert (Only for errors in step 1 now) */}
            {result && !result.available && (
              <div className="mb-6 bg-[#fff5f5] border border-[#fed7d7] rounded p-4">
                <div className="flex items-center gap-2.5 text-[#9b2c2c] font-medium text-[15px] mb-3">
                  <AlertCircle size={18} className="text-[#c53030]" />
                  Currently not available
                </div>
                <button 
                  onClick={() => {
                     if (onLocationSet) onLocationSet(pincode || 'Guest', 'Unknown', 'Unserviceable Area');
                     onClose();
                  }}
                  className="w-full py-2.5 bg-white border border-[#9b2c2c] text-[#9b2c2c] rounded font-medium text-[14px] hover:bg-[#fff0f0] transition-colors"
                >
                  Browse Products Anyway
                </button>
              </div>
            )}

            {/* The Map Pin Graphic exactly like screenshot */}
            {!result && (
              <div className="flex justify-center my-12 relative">
                {/* Fake Map Graphic Background */}
                <div className="w-[120px] h-[120px] bg-[#f0f0f0] rounded-full overflow-hidden relative border-4 border-white shadow-sm">
                  {/* White roads */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-3 bg-white transform -translate-x-1/2 -rotate-45"></div>
                  <div className="absolute top-1/2 left-0 right-0 h-3 bg-white transform -translate-y-1/2 rotate-12"></div>
                  <div className="absolute top-1/4 left-0 right-0 h-3 bg-white transform -translate-y-1/2 -rotate-12"></div>
                </div>
                {/* Big Red Pin */}
                <MapPin size={56} className="absolute top-1 left-1/2 transform -translate-x-1/2 text-[#ff5b5b] fill-[#ff5b5b] filter drop-shadow-md" strokeWidth={1} />
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Confirm Location */
          <div className="flex flex-col w-full bg-white">
            <div className="bg-[#f0f0f0] py-4 text-center border-b border-gray-200">
              <h2 className="text-[20px] font-semibold text-[#333]">Confirm Location</h2>
            </div>
            
            <div className="p-6 pb-8">
              <div className="flex items-start justify-between mb-6 px-2">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-1 shrink-0" size={24} fill="#e5e7eb" />
                  <div>
                    <div className="text-[16px] font-bold text-[#333] mb-1">{pincode} {selectedDesc ? `, ${selectedDesc.split(',')[0]}` : ''}</div>
                    <div className="text-[14px] text-gray-500">{selectedDesc || selectedCity}</div>
                  </div>
                </div>
                <button 
                  onClick={handleEdit}
                  className="text-[#2e8b57] hover:bg-green-50 p-2 rounded-full transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-8 text-center mb-6">
                <div className="flex justify-center mb-4">
                  {/* Grocery Basket Illustration */}
                  <div className="relative w-32 h-24">
                    <div className="absolute bottom-0 w-full h-16 bg-[#2eb886] rounded-b-xl border-t-4 border-[#22956b] z-10 flex items-center justify-center">
                       <span className="text-white font-bold text-xs">Mankatha</span>
                    </div>
                    {/* Items in basket */}
                    <div className="absolute bottom-12 left-4 w-4 h-12 bg-orange-400 rounded-t-sm rotate-[-15deg] z-0"></div>
                    <div className="absolute bottom-12 left-10 w-6 h-10 bg-blue-500 rounded-t-sm z-0"></div>
                    <div className="absolute bottom-12 right-10 w-5 h-14 bg-red-400 rounded-t-sm rotate-[10deg] z-0"></div>
                    <div className="absolute bottom-12 right-4 w-3 h-16 bg-[#8b5a2b] rounded-t-sm rotate-[25deg] z-0"></div>
                    {/* Leaf */}
                    <div className="absolute bottom-16 left-8 text-green-500 z-20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C17 8 13 4 8 4C8 4 6 13 11 17C11 17 15 21 20 21C20 21 22 12 17 8Z"/></svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-[18px] font-bold text-[#333] mb-2">Great, We are available here!</h3>
                <p className="text-[15px] text-gray-500">Explore our wide range of products delivered straight to your home!</p>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full bg-[#28a745] hover:bg-[#218838] text-white font-bold py-4 rounded text-[16px] transition-colors"
              >
                CONFIRM LOCATION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
