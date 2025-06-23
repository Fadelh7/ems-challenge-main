import { Form, useLoaderData, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader({ params }: any) {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", [params.timesheetId]);
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { timesheet, employees };
}

export const action = async ({ request, params }: any) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  const summary = formData.get("summary");

  // Validation
  const errors: any = {};
  if (!employee_id) errors.employee_id = "Employee is required";
  if (!start_time) errors.start_time = "Start time is required";
  if (!end_time) errors.end_time = "End time is required";
  if (start_time && end_time && new Date(start_time as string) >= new Date(end_time as string)) {
    errors.end_time = "End time must be after start time";
  }
  if (Object.keys(errors).length > 0) {
    return errors;
  }

  const db = await getDB();
  await db.run(
    `UPDATE timesheets SET employee_id=?, start_time=?, end_time=?, summary=? WHERE id=?`,
    [employee_id, start_time, end_time, summary, params.timesheetId]
  );
  return redirect("/timesheets");
};

export default function TimesheetPage() {
  const { timesheet, employees } = useLoaderData() as any;
  const errors = useActionData() as any;
  if (!timesheet) return <div>Timesheet not found</div>;
  return (
    <div className="container">
      <h1>Edit Timesheet</h1>
      <Form method="post">
        <div>
          <label htmlFor="employee_id">Employee</label>
          <select name="employee_id" id="employee_id" required defaultValue={timesheet.employee_id}>
            <option value="">Select employee</option>
            {employees.map((e: any) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
          {errors?.employee_id && <div className="error">{errors.employee_id}</div>}
        </div>
        <div>
          <label htmlFor="start_time">Start Time</label>
          <input type="datetime-local" name="start_time" id="start_time" defaultValue={timesheet.start_time} required />
          {errors?.start_time && <div className="error">{errors.start_time}</div>}
        </div>
        <div>
          <label htmlFor="end_time">End Time</label>
          <input type="datetime-local" name="end_time" id="end_time" defaultValue={timesheet.end_time} required />
          {errors?.end_time && <div className="error">{errors.end_time}</div>}
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <input type="text" name="summary" id="summary" defaultValue={timesheet.summary || ''} />
        </div>
        <button type="submit" className="button">Update Timesheet</button>
      </Form>
      <hr />
      <ul className="flex gap-2 mt-2">
        <li><a href="/timesheets" className="button">Timesheets</a></li>
        <li><a href="/timesheets/new" className="button">New Timesheet</a></li>
        <li><a href="/employees/" className="button">Employees</a></li>
      </ul>
    </div>
  );
}
