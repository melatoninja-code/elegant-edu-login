import { format } from "date-fns";
import { Booking } from "@/types/booking";

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm");
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            {booking.classroom.name} ({booking.classroom.room_number})
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(booking.start_time)} - {formatDateTime(booking.end_time)}
          </p>
          <p className="mt-2">{booking.purpose}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            booking.status === "approved"
              ? "bg-green-100 text-green-800"
              : booking.status === "rejected"
              ? "bg-red-100 text-red-800"
              : booking.status === "cancelled"
              ? "bg-gray-100 text-gray-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {booking.status}
        </span>
      </div>
    </div>
  );
}