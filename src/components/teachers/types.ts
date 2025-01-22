export interface Teacher {
  id: string;
  name: string;
  gender: string;
  studies: string;
  dorm_room: string | null;
  address: string;
  phone_number: string;
  profile_picture_url?: string | null;
  email?: string | null;
  auth_id?: string | null;
  account_email?: string | null;
  account_password?: string | null;
}

export type FormValues = {
  name: string;
  gender: string;
  studies: string;
  dorm_room?: string;
  address: string;
  phone_number: string;
  email?: string;
};