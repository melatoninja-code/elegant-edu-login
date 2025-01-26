import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BookingHeaderProps {
  onNewBooking: () => void;
}

export function BookingHeader({ onNewBooking }: BookingHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 border-b bg-white shadow-sm">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-0">
        <SidebarTrigger className="flex-shrink-0" />
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Room Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your classroom reservations</p>
        </div>
      </div>
      <Button 
        onClick={onNewBooking}
        className="w-full md:w-auto bg-primary hover:bg-primary-dark transition-colors"
      >
        <Calendar className="mr-2 h-4 w-4" />
        New Booking
      </Button>
    </div>
  );
}