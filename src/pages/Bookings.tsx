import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";

interface Booking {
  id: string;
  classroom_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  purpose: string;
  classroom: {
    name: string;
    room_number: string;
  };
}

export default function Bookings() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // Fetch user role and teacher ID on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }

        const { data: teacher } = await supabase
          .from('teachers')
          .select('id')
          .eq('auth_id', user.id)
          .single();
        
        if (teacher) {
          setTeacherId(teacher.id);
        }
      }
    };

    fetchUserData();
  }, []);

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const query = supabase
        .from('room_bookings')
        .select(`
          *,
          classroom:classrooms (
            name,
            room_number
          )
        `);

      if (userRole !== 'admin') {
        query.eq('teacher_id', teacherId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching bookings",
          description: error.message,
        });
        return [];
      }

      return data as Booking[];
    },
    enabled: Boolean(userRole && (userRole === 'admin' || teacherId)),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <h1 className="text-2xl font-semibold">Room Bookings</h1>
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
        <div className="p-6">
          {bookings?.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="grid gap-4">
              {bookings?.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {booking.classroom.name} ({booking.classroom.room_number})
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.start_time).toLocaleString()} -{" "}
                        {new Date(booking.end_time).toLocaleString()}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}