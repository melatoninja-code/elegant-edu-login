import { Booking } from "@/types/booking";
import { BookingCard } from "./BookingCard";

interface BookingListProps {
  bookings: Booking[];
}

export function BookingList({ bookings }: BookingListProps) {
  if (bookings?.length === 0) {
    return <p>No bookings found.</p>;
  }

  return (
    <div className="grid gap-4">
      {bookings?.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}