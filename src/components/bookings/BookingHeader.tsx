import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BookingHeaderProps {
  onNewBooking: () => void;
}

export function BookingHeader({ onNewBooking }: BookingHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 border-b bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Room Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your classroom reservations</p>
        </div>
      </div>
      <Button 
        onClick={onNewBooking}
        className="bg-primary hover:bg-primary-dark transition-colors"
      >
        <Calendar className="mr-2 h-4 w-4" />
        New Booking
      </Button>
    </div>
  );
}