import { Form } from "react-router-dom";

interface TimesheetFormProps {
  employees: { id: number; full_name: string }[];
  defaultValues?: {
    employee_id?: number;
    start_time?: string;
    end_time?: string;
    work_summary?: string;
  };
  buttonText: string;
}

export default function TimesheetForm({ employees, defaultValues, buttonText }: TimesheetFormProps) {
  return (
    <Form method="post" className="space-y-4">
      <div>
        <label htmlFor="employee_id" className="block text-gray-300">Employee</label>
        <select 
          name="employee_id" 
          id="employee_id" 
          required 
          defaultValue={defaultValues?.employee_id || ""}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="start_time" className="block text-gray-300">Start Time</label>
        <input
          type="datetime-local"
          name="start_time"
          id="start_time"
          required
          defaultValue={defaultValues?.start_time || ""}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        />
      </div>

      <div>
        <label htmlFor="end_time" className="block text-gray-300">End Time</label>
        <input
          type="datetime-local"
          name="end_time"
          id="end_time"
          required
          defaultValue={defaultValues?.end_time || ""}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        />
      </div>

      <div>
        <label htmlFor="work_summary" className="block text-gray-300">Work Summary</label>
        <textarea
          name="work_summary"
          id="work_summary"
          defaultValue={defaultValues?.work_summary || ""}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        ></textarea>
      </div>

      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded w-full">
        {buttonText}
      </button>
    </Form>
  );
}
