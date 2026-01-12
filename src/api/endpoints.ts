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
    deposit: async (amount: number) => {
        const response = await client.post<{ success: boolean; balance: number; message: string }>('/api/wallet/deposit', {
            amount
        });
        return response.data;
    },
    createPayment: async (amount: number, type: 'gcash' | 'grab_pay' | 'bpi' | 'ubp_online' = 'gcash') => {
        const response = await client.post<{ success: boolean; data: any }>('/api/payments/create', {
            amount,
            type
        });
        return response.data;
    },
    verifyPayment: async (sourceId: string) => {
        const response = await client.post<{ success: boolean; balance?: number; message?: string; status: string }>('/api/payments/verify', {
            sourceId
        });
        return response.data;
    }
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
