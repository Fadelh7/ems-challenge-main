import { useLoaderData, redirect, type ActionFunction, type LoaderFunctionArgs } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { FaArrowRight } from "react-icons/fa";
import TimesheetForm from "~/components/timesheetForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const db = await getDB();
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { employees };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const timesheetData = {
    employee_id: formData.get("employee_id"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    work_summary: formData.get("work_summary"),
  };

  if (!timesheetData.employee_id || !timesheetData.start_time || !timesheetData.end_time) {
    throw new Response("Missing required fields", { status: 400 });
  }

  if (new Date(timesheetData.end_time as string) <= new Date(timesheetData.start_time as string)) {
    throw new Response("End time must be after start time", { status: 400 });
  }

  const db = await getDB();
  await db.run(
    "INSERT INTO timesheets (employee_id, start_time, end_time, work_summary) VALUES (?, ?, ?, ?)",
    [timesheetData.employee_id, timesheetData.start_time, timesheetData.end_time, timesheetData.work_summary]
  );

  return redirect("/timesheets");
};

export default function NewTimesheetPage() {
  const { employees } = useLoaderData() as { employees: { id: number; full_name: string }[] };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Timesheet</h1>
        <TimesheetForm employees={employees} buttonText="Create Timesheet" />
        <hr className="my-6 border-gray-700" />
        <ul className="space-y-2">
          <li>
            <a href="/employees" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300">
              <span>Employees</span>
              <FaArrowRight className="ml-2" />
            </a>
          </li>
          <li>
            <a href="/timesheets" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300">
              <span>Timesheets</span>
              <FaArrowRight className="ml-2" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
