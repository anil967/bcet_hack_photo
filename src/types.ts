export interface PhotoItem {
  id: string;
  thumbnailUrl: string;
  imageUrl: string;
  downloadUrl: string;
  title?: string;
  session?: string;
  timestamp?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export interface SearchPhotosRequest {
  registrationId: string;
  selfie: string; // base64 data URI
}

export interface SearchPhotosResponse {
  success: boolean;
  count: number;
  photos: PhotoItem[];
  error?: string;
  errorCode?: 'REGISTRATION_NOT_FOUND' | 'NO_FACE' | 'MULTIPLE_FACES' | 'NETWORK_ERROR' | 'UNKNOWN';
}

export type AppStage = 'initial' | 'submitting' | 'gallery' | 'empty';

export type ErrorType = 
  | 'camera_denied'
  | 'no_face'
  | 'multiple_faces'
  | 'invalid_id'
  | 'network_error'
  | null;

export interface AppError {
  type: ErrorType;
  title: string;
  message: string;
}
