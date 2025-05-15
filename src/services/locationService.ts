
import { Location } from '../lib/types';
import { supabase } from '../integrations/supabase/client';

export const createLocation = async (location: Location) => {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      name: location.name,
      code: location.code
    })
    .select();

  if (error) throw error;
  return data?.[0] as Location;
};

export const addLocation = async (location: Location) => {
  return createLocation(location);
};

export const fetchAllLocations = async (): Promise<Location[]> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*');

  if (error) throw error;
  return (data || []) as Location[];
};

export const getLocationById = async (id: string): Promise<Location> => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Location;
};

export const updateLocation = async (id: string, updates: Partial<Location>) => {
  const { data, error } = await supabase
    .from('locations')
    .update({
      name: updates.name,
      code: updates.code,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data?.[0] as Location;
};

export const deleteLocation = async (id: string) => {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

// Custom hook for location service
export const useLocationService = () => {
  return {
    fetchAllLocations,
    getLocationById,
    createLocation,
    updateLocation,
    deleteLocation,
    addLocation
  };
};

const locationService = {
  createLocation,
  fetchAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
  addLocation,
};

export default locationService;
