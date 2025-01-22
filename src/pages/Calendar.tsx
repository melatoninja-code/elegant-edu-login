import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex h-screen bg-neutral-light/50">
      <AppSidebar />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-8">Calendar</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Calendar Component */}
            <Card>
              <CardHeader>
                <CardTitle>Select a Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border shadow"
                />
              </CardContent>
            </Card>

            {/* Date Information Display */}
            <Card>
              <CardHeader>
                <CardTitle>Date Information</CardTitle>
              </CardHeader>
              <CardContent>
                {date ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium">
                      Selected Date: {format(date, 'PPPP')}
                    </p>
                    <div className="space-y-2">
                      <h3 className="font-medium">Schedule</h3>
                      <p className="text-neutral-600">
                        No events scheduled for this date.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Notes</h3>
                      <p className="text-neutral-600">
                        Click on a date to view or add notes.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-600">
                    Please select a date to view information.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}