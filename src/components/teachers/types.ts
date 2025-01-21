export interface Teacher {
  id: string;
  name: string;
  gender: string;
  studies: string;
  dorm_room: string | null;
  address: string;
  phone_number: string;
  profile_picture_url?: string | null;
}