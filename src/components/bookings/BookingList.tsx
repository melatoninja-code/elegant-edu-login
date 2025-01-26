import { Booking } from "@/types/booking";
import { BookingCard } from "./BookingCard";
import { useQueryClient } from "@tanstack/react-query";

interface BookingListProps {
  bookings: Booking[];
}

export function BookingList({ bookings }: BookingListProps) {
  const queryClient = useQueryClient();

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  if (bookings?.length === 0) {
    return (
      <div className="flex justify-center items-center p-6">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full p-6 space-y-4">
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