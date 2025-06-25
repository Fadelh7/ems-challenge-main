import { useLoaderData, Link } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";
import { FaArrowRight } from "react-icons/fa";

import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "@schedule-x/theme-default/dist/index.css";

interface Timesheet {
  id: number;
  start_time: string;
  end_time: string;
  work_summary: string;
  employee_name: string;
}

interface LoaderData {
  timesheets: Timesheet[];
}

export const loader = async () => {
  const db = await getDB();
  const timesheets = await db.all(
    "SELECT t.id, t.start_time, t.end_time, t.work_summary, e.full_name as employee_name FROM timesheets t JOIN employees e ON t.employee_id = e.id ORDER BY t.start_time DESC"
  );
  return { timesheets };
};

export default function TimesheetsPage() {
  const { timesheets } = useLoaderData() as LoaderData;
  const [view, setView] = useState<"table" | "calendar">("table");

  // Initialize Events Plugin
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Prepare calendar data
  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: timesheets.map((ts) => ({
      id: ts.id.toString(),
      title: `${ts.employee_name}: ${ts.work_summary}`,
      start: new Date(ts.start_time).toISOString().split("T")[0],
      end: new Date(ts.end_time).toISOString().split("T")[0],
    })),
    plugins: [eventsService],
  });

  useEffect(() => {
    eventsService.getAll();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <Link
            to="/timesheets/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center"
          >
            <span>Add Timesheet</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              view === "table" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-lg transition duration-300 ${
              view === "calendar" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Calendar View
          </button>
        </div>

        {view === "table" ? (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full border-collapse">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase">Start Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase">End Time</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase">Work Summary</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {timesheets.map((timesheet: Timesheet) => (
                  <tr key={timesheet.id} className="hover:bg-gray-800 transition duration-200">
                    <td className="px-6 py-4 text-sm">{timesheet.employee_name}</td>
                    <td className="px-6 py-4 text-sm">{new Date(timesheet.start_time).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{new Date(timesheet.end_time).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{timesheet.work_summary}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link 
                        to={`/timesheets/${timesheet.id}`} 
                        className="text-blue-400 hover:text-blue-300 transition duration-300 inline-flex items-center"
                      >
                        <span>Edit</span>
                        <FaArrowRight className="ml-2" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : view === "calendar" ? (
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <ScheduleXCalendar calendarApp={calendar} />
          </div>
        ) : (
          <p className="text-gray-400 mt-4">No events available to display.</p>
        )}

        <div className="mt-6">
          <Link 
            to="/employees" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300"
          >
            <span>Go to Employees</span>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
