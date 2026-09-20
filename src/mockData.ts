import { PhotoItem, SearchPhotosRequest, SearchPhotosResponse } from './types';

// Curated high quality event photography (hackathons, keynote speeches, awards, workshop collaborations, stage moments)
export const MOCK_EVENT_PHOTOS: PhotoItem[] = [
  {
    id: 'IMG_2026_0101',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2000&auto=format&fit=crop&q=95',
    title: 'Opening Ceremony & Keynote Address',
    session: 'Grand Auditorium',
    timestamp: '09:45 AM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0102',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=2000&auto=format&fit=crop&q=95',
    title: 'Audience Engagement & Q&A',
    session: 'Hall A',
    timestamp: '10:15 AM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0103',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=2000&auto=format&fit=crop&q=95',
    title: 'Team Collaboration Sprint',
    session: 'Innovation Hub',
    timestamp: '11:20 AM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0104',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=2000&auto=format&fit=crop&q=95',
    title: 'Participant Welcome & Check-in',
    session: 'Main Concourse',
    timestamp: '09:05 AM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0105',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=2000&auto=format&fit=crop&q=95',
    title: 'Roundtable Tech Discussion',
    session: 'Seminar Room 2',
    timestamp: '11:45 AM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0106',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=2000&auto=format&fit=crop&q=95',
    title: 'Group Strategy Session',
    session: 'Hack Lab West',
    timestamp: '12:30 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0107',
    thumbnailUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=2000&auto=format&fit=crop&q=95',
    title: 'Networking Lunch & Ideas Exchange',
    session: 'Outdoor Courtyard',
    timestamp: '01:15 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0108',
    thumbnailUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=2000&auto=format&fit=crop&q=95',
    title: 'Panel Discussion & Guest Speaker',
    session: 'Center Stage',
    timestamp: '02:00 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0109',
    thumbnailUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=2000&auto=format&fit=crop&q=95',
    title: 'Live Product Demonstration',
    session: 'Showcase Hall',
    timestamp: '02:40 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0110',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=2000&auto=format&fit=crop&q=95',
    title: 'Interactive Workshop Session',
    session: 'Conference Suite B',
    timestamp: '03:10 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0111',
    thumbnailUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=2000&auto=format&fit=crop&q=95',
    title: 'Campus Walk & Team Candid',
    session: 'Main Plaza',
    timestamp: '03:45 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0112',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2000&auto=format&fit=crop&q=95',
    title: 'Audience Celebration Moment',
    session: 'Grand Stage',
    timestamp: '04:15 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0113',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2000&auto=format&fit=crop&q=95',
    title: 'Evening Showcase & Lighting',
    session: 'Amphitheater',
    timestamp: '05:00 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0114',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?w=2000&auto=format&fit=crop&q=95',
    title: 'Tech Expo Booth Presentation',
    session: 'Exhibition Hall',
    timestamp: '05:30 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0115',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2000&auto=format&fit=crop&q=95',
    title: 'Project Pitching & Mentorship',
    session: 'Pitch Arena',
    timestamp: '05:55 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0116',
    thumbnailUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=2000&auto=format&fit=crop&q=95',
    title: 'Trophy Presentation & Honors',
    session: 'Main Stage',
    timestamp: '06:20 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0117',
    thumbnailUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=2000&auto=format&fit=crop&q=95',
    title: 'Closing Ceremony Cheers',
    session: 'Auditorium Floor',
    timestamp: '06:45 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0118',
    thumbnailUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=2000&auto=format&fit=crop&q=95',
    title: 'Fireside Chat with Innovators',
    session: 'Lounge Stage',
    timestamp: '07:05 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0119',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=2000&auto=format&fit=crop&q=95',
    title: 'Celebration Toast & Social Mixer',
    session: 'Rooftop Terrace',
    timestamp: '07:30 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0120',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520881593913-e842b164559a?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1520881593913-e842b164559a?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1520881593913-e842b164559a?w=2000&auto=format&fit=crop&q=95',
    title: 'Award Distribution & Medals',
    session: 'Grand Stage',
    timestamp: '07:50 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0121',
    thumbnailUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=2000&auto=format&fit=crop&q=95',
    title: 'Event Finale Concert & Crowd',
    session: 'Open Air Stadium',
    timestamp: '08:15 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0122',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=2000&auto=format&fit=crop&q=95',
    title: 'Hackathon Grand Winner Pitch',
    session: 'Auditorium Main',
    timestamp: '08:35 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0123',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=2000&auto=format&fit=crop&q=95',
    title: 'Special Guest Performance',
    session: 'Music Stage',
    timestamp: '08:55 PM',
    aspectRatio: 'landscape',
  },
  {
    id: 'IMG_2026_0124',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=90',
    downloadUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=2000&auto=format&fit=crop&q=95',
    title: 'Festival Lights & After-Party',
    session: 'Festival Grounds',
    timestamp: '09:20 PM',
    aspectRatio: 'landscape',
  },
];

/**
 * Service function to search event photos.
 * In production this will call POST /api/search-photos
 */
export async function searchEventPhotos(request: SearchPhotosRequest): Promise<SearchPhotosResponse> {
  // Normalize registration ID
  const cleanId = request.registrationId.trim().toUpperCase();

  // Test triggers for simulating error / empty states if needed
  if (cleanId === 'TEST-EMPTY' || cleanId === 'BCET2026-EMPTY') {
    return {
      success: true,
      count: 0,
      photos: [],
    };
  }

  if (cleanId === 'TEST-FACE' || cleanId === 'TEST-NO-FACE') {
    return {
      success: false,
      count: 0,
      photos: [],
      errorCode: 'NO_FACE',
      error: "We couldn't detect your face",
    };
  }

  if (cleanId === 'TEST-MULTI' || cleanId === 'TEST-MULTIPLE') {
    return {
      success: false,
      count: 0,
      photos: [],
      errorCode: 'MULTIPLE_FACES',
      error: 'Please make sure only one person is visible',
    };
  }

  if (cleanId === 'TEST-INVALID' || cleanId === 'INVALID-999') {
    return {
      success: false,
      count: 0,
      photos: [],
      errorCode: 'REGISTRATION_NOT_FOUND',
      error: 'Registration ID not found',
    };
  }

  if (cleanId === 'TEST-NETWORK' || cleanId === 'TEST-NET') {
    return {
      success: false,
      count: 0,
      photos: [],
      errorCode: 'NETWORK_ERROR',
      error: 'Something went wrong',
    };
  }

  // Default standard response: exactly 24 photos matching user selfie
  return {
    success: true,
    count: MOCK_EVENT_PHOTOS.length,
    photos: MOCK_EVENT_PHOTOS,
  };
}
