import { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView({ doctorName }) {
    const [events, setEvents] = useState([]);
    // const [view, setView] = useState(Views.WEEK);
    const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    if (!doctorName) return;
    fetch(`http://localhost:5000/api/doctors/name/${encodeURIComponent(doctorName)}/availability`)
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(formatted);
      });
  }, [doctorName]);

  const eventStyleGetter = (event) => {
    const bgColor = event.status === 'booked' ? '#ef4444' : '#10b981';
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: '5px',
        color: 'white',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        {/* <button onClick={this.handlePreviousWeek}>Previous Week</button>
        <button onClick={this.handleNextWeek}>Next Week</button> */}
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor='start'
        endAccessor='end'
        defaultView={view}
        onView={setView}
        style={{ height: 500 }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
}