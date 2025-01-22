export interface StudentDocument {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
  description: string | null;
}