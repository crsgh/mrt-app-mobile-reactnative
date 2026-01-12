import { client } from './client';
import { AuthResponse, Station, Trip, User } from '../types';

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const response = await client.post<AuthResponse>('/api/auth/login', { username, password });
      return response.data;
    },
  },
  mobile: {
    getStations: async () => {
      const response = await client.get<{ stations: Station[] }>('/api/mobile/stations');
      return response.data;
    },
    getProfile: async () => {
      const response = await client.get<{ success: boolean; passenger: User }>('/api/mobile/passenger/profile');
      return response.data;
    },
    getTrips: async () => {
      const response = await client.get<{ success: boolean; trips: Trip[] }>('/api/mobile/passenger/trips');
      return response.data;
    },
  },
  trips: {
    tapIn: async (passengerCode: string, stationId: string) => {
      const response = await client.post('/api/trips', {
        action: 'tap_in',
        passengerCode,
        stationId,
      });
      return response.data;
    },
    tapOut: async (passengerCode: string, stationId: string) => {
      const response = await client.post('/api/trips', {
        action: 'tap_out',
        passengerCode,
        stationId,
      });
      return response.data;
    },
  },
};
