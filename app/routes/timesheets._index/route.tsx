import { useLoaderData, useSearchParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { getDB } from "~/db/getDB";
import '@schedule-x/theme-default/dist/index.css';

function getQueryParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get("search") || "",
    employee: searchParams.get("employee") || "",
    page: parseInt(searchParams.get("page") || "1", 10),
  };
}

export async function loader({ request }: any) {
  const url = new URL(request.url);
  const { search, employee, page } = getQueryParams(url.searchParams);
  const db = await getDB();
  let where = [];
  let params: any[] = [];
  if (search) {
    where.push("(summary LIKE ? OR employees.full_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (employee) {
    where.push("employee_id = ?");
    params.push(employee);
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const countRow = await db.get(`SELECT COUNT(*) as count FROM timesheets JOIN employees ON timesheets.employee_id = employees.id ${whereClause}`, params);
  const total = countRow.count;
  const pageSize = 5;
  const offset = (page - 1) * pageSize;
  const timesheetsAndEmployees = await db.all(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id ${whereClause} ORDER BY start_time DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  // For calendar, get all timesheets (ignore pagination)
  const allTimesheets = await db.all(
    `SELECT timesheets.*, employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id ${whereClause} ORDER BY start_time DESC`,
    params
  );
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { timesheetsAndEmployees, allTimesheets, total, page, pageSize, search, employee, employees };
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees, allTimesheets, total, page, pageSize, search, employee, employees } = useLoaderData() as any;
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'table'|'calendar'>('table');
  const totalPages = Math.ceil(total / pageSize);
  const [Calendar, setCalendar] = useState<any>(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);

  useEffect(() => {
    if (view === 'calendar' && !Calendar) {
      setLoadingCalendar(true);
      import('@schedule-x/react').then((mod) => {
        // @ts-ignore
        setCalendar(() => mod.Calendar);
        setLoadingCalendar(false);
      });
    }
  }, [view, Calendar]);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    if (key !== "page") params.set("page", "1"); // reset page on filter/search
    setSearchParams(params);
  }

  // Prepare events for calendar
  const events = allTimesheets.map((t: any) => ({
    id: String(t.id),
    title: `${t.full_name}: ${t.summary || ''}`,
    start: t.start_time,
    end: t.end_time,
  }));

  return (
    <div className="container">
      <h1>Timesheets</h1>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="Search summary or employee..."
          value={search}
          onChange={e => setParam("search", e.target.value)}
        />
        <select value={employee} onChange={e => setParam("employee", e.target.value)}>
          <option value="">All Employees</option>
          {employees.map((e: any) => (
            <option key={e.id} value={e.id}>{e.full_name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => setView('table')} disabled={view==='table'} className="button">Table View</button>
        <button onClick={() => setView('calendar')} disabled={view==='calendar'} className="button">Calendar View</button>
      </div>
      {view === 'table' ? (
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Summary</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheetsAndEmployees.map((t: any) => (
              <tr key={t.id}>
                <td>{t.full_name}</td>
                <td>{t.start_time}</td>
                <td>{t.end_time}</td>
                <td>{t.summary}</td>
                <td><Link to={`/timesheets/${t.id}`}>View/Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{height:600, background:'#f9fafb', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.04)', padding:'1em'}}>
          {loadingCalendar && <div>Loading calendar...</div>}
          {Calendar && <Calendar
            events={events}
            initialView="week"
          />}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        {Array.from({length: totalPages}, (_, i) => (
          <button
            key={i+1}
            onClick={()=>setParam("page", String(i+1))}
            disabled={page === i+1}
            className="button"
          >{i+1}</button>
        ))}
      </div>
      <ul className="flex gap-2 mt-2">
        <li><Link to="/timesheets/new" className="button">New Timesheet</Link></li>
        <li><Link to="/employees" className="button">Employees</Link></li>
      </ul>
    </div>
  );
}
