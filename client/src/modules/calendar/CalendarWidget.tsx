import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Link } from "wouter";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/calendar/events', currentDate.getFullYear(), currentDate.getMonth()],
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-nara-navy text-white p-6">
          <div className="flex justify-center items-center">
            <div className="spinner w-6 h-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-nara-navy text-white p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-colors focus-ring"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="bg-blue-700 hover:bg-blue-600 p-2 rounded-lg transition-colors focus-ring"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${
                day === new Date().getDate() && 
                currentDate.getMonth() === new Date().getMonth() && 
                currentDate.getFullYear() === new Date().getFullYear()
                  ? 'today' 
                  : ''
              } ${day ? 'has-events' : ''}`}
            >
              {day && (
                <>
                  <span className="text-sm font-medium">{day}</span>
                  {/* Sample events indicators */}
                  {day % 5 === 0 && (
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full mb-1" title="Research Activity"></div>
                    </div>
                  )}
                  {day % 7 === 0 && (
                    <div className="mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Monitoring Session"></div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/calendar">
            <button className="btn-primary">
              <CalendarIcon className="w-5 h-5 mr-2" />
              View Full Calendar
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
