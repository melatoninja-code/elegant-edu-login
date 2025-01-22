import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { AppSidebar } from "@/components/AppSidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

// Example events - in a real app, these would come from your backend
const events = {
  "2024-04-15": { type: "meeting", title: "Teacher Meeting" },
  "2024-04-20": { type: "event", title: "School Event" },
  "2024-04-25": { type: "deadline", title: "Grade Submission" },
}

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [key, setKey] = useState(0)
  const isMobile = useIsMobile()

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

  const hasEvent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return dateStr in events
  }

  const getEventDetails = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events[dateStr as keyof typeof events]
  }

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-neutral-light/50">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-2 md:p-6">
          <div className="flex items-center gap-4 p-6 border-b">
            <SidebarTrigger />
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>
          <div className="container mx-auto">
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white shadow-md md:col-span-2">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg text-primary md:text-xl">Select a Date</CardTitle>
                </CardHeader>
                <CardContent className={cn(
                  "pt-4",
                  isMobile ? "px-2" : "p-4"
                )}>
                  <div key={key} className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      locale={{
                        code: 'en-GB',
                        formatDistance: (token, count, options) => {
                          return `${count} ${token}${count !== 1 ? 's' : ''}`
                        },
                        formatRelative: (token) => token,
                        localize: {
                          day: (n) => ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][n],
                          month: (n) => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][n],
                          ordinalNumber: (n) => `${n}`,
                          era: (era) => ['BC', 'AD'][era],
                          quarter: (quarter) => [`Q1`, `Q2`, `Q3`, `Q4`][quarter],
                          dayPeriod: (dayPeriod) => dayPeriod.toLowerCase(),
                        },
                        formatLong: {
                          date: () => 'dd/MM/yyyy',
                          time: () => 'HH:mm',
                          dateTime: () => 'dd/MM/yyyy HH:mm'
                        },
                        match: {
                          ordinalNumber: () => ({
                            value: 0,
                            rest: ''
                          }),
                          era: () => ({
                            value: 0,
                            rest: ''
                          }),
                          quarter: () => ({
                            value: 1,
                            rest: ''
                          }),
                          month: () => ({
                            value: 0,
                            rest: ''
                          }),
                          day: () => ({
                            value: 0,
                            rest: ''
                          }),
                          dayPeriod: () => ({
                            value: 'am',
                            rest: ''
                          })
                        }
                      }}
                      className={cn(
                        "rounded-md border w-full max-w-[350px]",
                        isMobile ? "transform-none" : "transform origin-top"
                      )}
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "space-y-3 w-full",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "text-sm font-medium text-primary-dark",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex justify-between w-full",
                        head_cell: "text-neutral-600 w-8 font-normal text-[0.8rem]",
                        row: "flex w-full mt-1.5 justify-between",
                        cell: cn(
                          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary-lighter",
                          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        ),
                        day: cn(
                          "h-8 w-8 p-0 font-normal hover:bg-primary-light rounded-full transition-colors relative",
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

              {date && (
                <div className="space-y-4 md:row-span-2">
                  <Card className="bg-white shadow-md">
                    <CardHeader className="pb-3 border-b bg-primary-lighter">
                      <CardTitle className="text-lg text-primary-dark md:text-xl">
                        {formatDate(date)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
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

                  <Card className="bg-white shadow-md">
                    <CardHeader className="pb-3 border-b">
                      <CardTitle className="text-lg text-primary md:text-xl">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {Object.entries(events).map(([dateStr, event]) => (
                          <div key={dateStr} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-light/50 transition-colors">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-primary rounded-full" />
                              <span className="font-medium text-primary-dark">{event.title}</span>
                            </div>
                            <span className="text-sm text-neutral">{format(new Date(dateStr), 'dd/MM')}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
