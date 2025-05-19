
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Location } from '../lib/types';

interface LocationContextType {
  locations: Location[];
  currentLocation: Location | null;
  setCurrentLocation: (location: Location) => void;
  loading: boolean;
  error: Error | null;
}

export const LocationContext = createContext<LocationContextType>({
  locations: [],
  currentLocation: null,
  setCurrentLocation: () => {},
  loading: false,
  error: null
});

export const useLocation = () => useContext(LocationContext);

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load locations and selected location from database/localStorage
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');

        if (error) {
          throw new Error(error.message);
        }

        // Default locations if none exist in database
        const locationData = data?.length
          ? data
          : [
              { id: '1', name: 'Ananthapur', code: 'ATP' },
              { id: '2', name: 'Hyderabad', code: 'HYD' },
              { id: '3', name: 'Bangalore', code: 'BLR' },
              { id: '4', name: 'Chennai', code: 'CHN' },
            ];

        setLocations(locationData);

        // Get saved location or use default
        const savedLocationId = localStorage.getItem('selectedLocationId');
        if (savedLocationId) {
          const found = locationData.find(loc => loc.id === savedLocationId);
          if (found) setCurrentLocation(found);
          else setCurrentLocation(locationData[0]);
        } else {
          setCurrentLocation(locationData[0]);
        }
      } catch (err: any) {
        setError(err);
        console.error('Error fetching locations:', err);
        
        // Use fallback locations
        const fallbackLocations = [
          { id: '1', name: 'Ananthapur', code: 'ATP' },
          { id: '2', name: 'Hyderabad', code: 'HYD' },
          { id: '3', name: 'Bangalore', code: 'BLR' },
          { id: '4', name: 'Chennai', code: 'CHN' },
        ];
        setLocations(fallbackLocations);
        setCurrentLocation(fallbackLocations[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Save selected location to localStorage
  const handleSetCurrentLocation = (location: Location) => {
    setCurrentLocation(location);
    localStorage.setItem('selectedLocationId', location.id);
  };

  return (
    <LocationContext.Provider
      value={{
        locations,
        currentLocation,
        setCurrentLocation: handleSetCurrentLocation,
        loading,
        error,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
