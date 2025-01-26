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
      <div className="flex justify-center items-center min-h-[200px] bg-white rounded-lg border shadow-sm">
        <p className="text-muted-foreground text-center px-4">
          No bookings found. Create a new booking to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 animate-fadeIn">
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