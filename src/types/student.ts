export type Student = {
  id: string;
  name: string;
  email: string | null;
  student_id: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone_number: string | null;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated' | 'suspended';
  grade_level: number;
  class_section: string | null;
  dorm_room: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  created_at: string;
  updated_at: string;
};