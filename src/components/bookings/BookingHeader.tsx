import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface BookingHeaderProps {
  onNewBooking: () => void;
}

export function BookingHeader({ onNewBooking }: BookingHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 sm:h-16 gap-4 sm:gap-0">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Room Bookings</h1>
              <p className="text-sm text-gray-500">Manage your classroom reservations</p>
            </div>
          </div>
          <Button 
            onClick={onNewBooking}
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark transition-colors shadow-sm"
          >
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>
    </header>
  );
}