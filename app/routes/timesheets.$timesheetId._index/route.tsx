import { useLoaderData, redirect, type LoaderFunction, type ActionFunction } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { FaArrowRight } from "react-icons/fa";
import TimesheetForm from "~/components/timesheetForm";

export const loader: LoaderFunction = async ({ params }) => {
  const db = await getDB();
  const timesheet = await db.get("SELECT * FROM timesheets WHERE id = ?", [params.timesheetId]);
  if (!timesheet) {
    throw new Response("Timesheet not found", { status: 404 });
  }
  
  const employees = await db.all("SELECT id, full_name FROM employees");
  return { timesheet, employees };
};

export const action: ActionFunction = async ({ request, params }) => {
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
    "UPDATE timesheets SET employee_id=?, start_time=?, end_time=?, work_summary=? WHERE id=?",
    [timesheetData.employee_id, timesheetData.start_time, timesheetData.end_time, timesheetData.work_summary, params.timesheetId]
  );

  return redirect("/timesheets");
};

export default function EditTimesheetPage() {
  const { timesheet, employees } = useLoaderData() as { 
    timesheet: { id: number, employee_id: number, start_time: string, end_time: string, work_summary: string };
    employees: { id: number; full_name: string }[] 
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Timesheet</h1>
        <TimesheetForm 
          employees={employees} 
          defaultValues={timesheet} 
          buttonText="Update Timesheet" 
        />
      </div>
    </div>
  );
}
