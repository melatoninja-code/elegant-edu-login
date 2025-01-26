import { Booking } from "@/types/booking";
import { BookingCard } from "./BookingCard";
import { useQueryClient } from "@tanstack/react-query";

interface BookingListProps {
  bookings: Booking[];
}

export function BookingList({ bookings }: BookingListProps) {
  const queryClient = useQueryClient();

  if (bookings?.length === 0) {
    return <p>No bookings found.</p>;
  }

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  return (
    <div className="grid gap-4">
      {bookings?.map((booking) => (
        <BookingCard 
          key={booking.id} 
          booking={booking} 
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}