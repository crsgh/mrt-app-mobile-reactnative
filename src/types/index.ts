export interface User {
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  discountType?: string;
  isActive?: boolean;
  joinedDate?: string;
  balance?: number;
  profilePicture?: string;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  latitude?: number;
  longitude?: number;
  order?: number;
  description?: string;
}

export interface Trip {
  id: string;
  startStation: {
    name: string;
    code: string;
  };
  endStation?: {
    name: string;
    code: string;
  };
  tapInTime: string;
  tapOutTime?: string;
  status: 'active' | 'completed' | 'cancelled';
  fare: number;
  travelTime?: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
