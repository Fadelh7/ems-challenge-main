import { useLoaderData, Form, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";

export const action: ActionFunction = async ({ request }) => {
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
    'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
    [employee_id, start_time, end_time, summary]
  );

  return redirect("/timesheets");
}

export default function NewTimesheetPage() {
  const { employees } = useLoaderData(); // Used to create a select input
  const errors = useActionData() as any;
  return (
    <div className="container">
      <h1>Create New Timesheet</h1>
      <Form method="post">
        <div>
          <label htmlFor="employee_id">Employee</label>
          <select name="employee_id" id="employee_id" required>
            <option value="">Select employee</option>
            {employees.map((e: any) => (
              <option key={e.id} value={e.id}>{e.full_name}</option>
            ))}
          </select>
          {errors?.employee_id && <div className="error">{errors.employee_id}</div>}
        </div>
        <div>
          <label htmlFor="start_time">Start Time</label>
          <input type="datetime-local" name="start_time" id="start_time" required />
          {errors?.start_time && <div className="error">{errors.start_time}</div>}
        </div>
        <div>
          <label htmlFor="end_time">End Time</label>
          <input type="datetime-local" name="end_time" id="end_time" required />
          {errors?.end_time && <div className="error">{errors.end_time}</div>}
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <input type="text" name="summary" id="summary" />
        </div>
        <button type="submit" className="button">Create Timesheet</button>
      </Form>
      <hr />
      <ul className="flex gap-2 mt-2">
        <li><a href="/timesheets" className="button">Timesheets</a></li>
        <li><a href="/employees" className="button">Employees</a></li>
      </ul>
    </div>
  );
}
