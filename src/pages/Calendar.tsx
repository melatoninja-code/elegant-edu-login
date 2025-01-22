import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Example events - in a real app, these would come from your backend
const events = {
  "2024-04-15": { type: "meeting", title: "Teacher Meeting" },
  "2024-04-20": { type: "event", title: "School Event" },
  "2024-04-25": { type: "deadline", title: "Grade Submission" },
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [key, setKey] = useState(0)

  useEffect(() => {
    return () => {
      const calendar = document.querySelector('.rdp')
      if (calendar && calendar.parentNode) {
        calendar.parentNode.removeChild(calendar)
      }
    }
  }, [])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    setKey(prev => prev + 1)
  }

  // Function to check if a date has an event
  const hasEvent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return dateStr in events
  }

  // Function to get event details
  const getEventDetails = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events[dateStr as keyof typeof events]
  }

  return (
    <div className="flex h-screen bg-neutral-light/50">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-8 text-2xl font-bold tracking-tight text-primary-dark md:text-3xl">
            Calendar
          </h1>
          
          <div className="space-y-8">
            <Card className="bg-white shadow-md">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg text-primary md:text-xl">Select a Date</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div key={key} className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="rounded-md border scale-110 transform origin-top"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium text-primary-dark",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-neutral-600 w-12 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: cn(
                        "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary-lighter",
                        "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                      ),
                      day: cn(
                        "h-12 w-12 p-0 font-normal hover:bg-primary-light rounded-full transition-colors relative",
                        "aria-selected:opacity-100"
                      ),
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary-dark hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full transition-colors",
                      day_today: "bg-neutral-light text-foreground rounded-full",
                      day_outside: "text-neutral opacity-50",
                      day_disabled: "text-neutral opacity-50",
                      day_range_middle: "aria-selected:bg-neutral-light aria-selected:text-foreground",
                      day_hidden: "invisible",
                    }}
                    components={{
                      DayContent: ({ date: dayDate, ...props }) => (
                        <div {...props} className="relative w-full h-full flex items-center justify-center">
                          <span>{dayDate.getDate()}</span>
                          {hasEvent(dayDate) && (
                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                          )}
                        </div>
                      ),
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date Information Display */}
            {date && (
              <Card className="bg-white shadow-md overflow-hidden">
                <CardHeader className="pb-3 border-b bg-primary-lighter">
                  <CardTitle className="text-lg text-primary-dark md:text-xl">
                    {format(date, 'PPPP')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                      <h3 className="mb-2 font-medium text-primary">Schedule</h3>
                      {hasEvent(date) ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            <p className="font-medium text-primary-dark">{getEventDetails(date)?.title}</p>
                          </div>
                          <p className="text-sm text-neutral pl-4">Type: {getEventDetails(date)?.type}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-neutral">
                          No events scheduled for this date.
                        </p>
                      )}
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-white p-4">
                      <h3 className="mb-2 font-medium text-primary">Notes</h3>
                      <p className="text-sm text-neutral">
                        Click on a date to view or add notes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}