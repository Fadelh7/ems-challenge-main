import { Form, redirect, type ActionFunction, useNavigate } from "react-router-dom";
import { getDB } from "~/db/getDB";
import EmployeeForm from "~/components/employeeForm";
import { FaArrowRight } from "react-icons/fa"; // Import the arrow icon

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const employeeData = {
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    date_of_birth: formData.get("date_of_birth"),
    job_title: formData.get("job_title"),
    department: formData.get("department"),
    salary: formData.get("salary"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  };

  const db = await getDB();
  await db.run(
    `INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(employeeData)
  );

  return redirect("/employees");
};

export default function NewEmployeePage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    await fetch("/employees/new", {
      method: "POST",
      body: formData,
    });
    navigate("/employees");
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Employee</h1>
        <EmployeeForm onSubmit={handleSubmit} />

        <hr className="my-6 border-gray-700" />

        <ul className="space-y-2">
          <li>
            <a
              href="/employees"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300"
            >
              <span>Employees</span>
              <FaArrowRight className="ml-2" />
            </a>
          </li>
          <li>
            <a
              href="/timesheets"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300"
            >
              <span>Go to Timesheets</span>
              <FaArrowRight className="ml-2" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
