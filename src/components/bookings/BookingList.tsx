import { Booking } from "@/types/booking";
import { BookingCard } from "./BookingCard";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BookingListProps {
  bookings: Booking[];
}

export function BookingList({ bookings }: BookingListProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('room_bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_bookings'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  const handleStatusChange = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
  };

  if (bookings?.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px] bg-white rounded-lg border shadow-sm p-6">
        <p className="text-muted-foreground text-center">
          No bookings found. Create a new booking to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-fadeIn">
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