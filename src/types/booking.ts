export interface Booking {
  id: string;
  classroom_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  purpose: string;
  classroom: {
    name: string;
    room_number: string;
  };
}

export interface BookingFormValues {
  classroom_id: string;
  teacher_id: string;
  start_date: Date;
  start_time: string;
  end_date: Date;
  end_time: string;
  purpose: string;
}