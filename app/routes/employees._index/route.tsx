import { useLoaderData, Link, useSearchParams } from "react-router-dom";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import type { LoaderFunctionArgs } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

interface Employee {
  id: number;
  full_name: string;
  job_title: string;
  department: string;
  salary: number;
}

interface Department {
  department: string;
}

interface LoaderData {
  employees: Employee[];
  searchQuery: string;
  sortField: string;
  sortOrder: string;
  departmentFilter: string;
  departments: Department[];
  page: number;
  pageSize: number;
  totalEmployees: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const db = await getDB();
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("search") || "";
  const sortField = url.searchParams.get("sort") || "full_name";
  const sortOrder = url.searchParams.get("order") || "asc";
  const departmentFilter = url.searchParams.get("department") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const pageSize = parseInt(url.searchParams.get("pageSize") || "3");
  const offset = (page - 1) * pageSize;

  let query = "SELECT id, full_name, job_title, department, salary FROM employees WHERE 1=1";
  let queryParams: (string | number)[] = [];

  if (searchQuery) {
    query += " AND full_name LIKE ?";
    queryParams.push(`%${searchQuery}%`);
  }

  if (departmentFilter) {
    query += " AND department = ?";
    queryParams.push(departmentFilter);
  }

  query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  const employees = await db.all(query, queryParams);
  const departments = await db.all("SELECT DISTINCT department FROM employees");
  const totalEmployees = await db.get("SELECT COUNT(*) as count FROM employees");

  return {
    employees,
    searchQuery,
    sortField,
    sortOrder,
    departmentFilter,
    departments,
    page,
    pageSize,
    totalEmployees: totalEmployees.count,
  };
};

export default function EmployeeListPage() {
  const {
    employees,
    searchQuery,
    sortField,
    sortOrder,
    departmentFilter,
    departments,
    page,
    pageSize,
    totalEmployees,
  } = useLoaderData() as LoaderData;

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [department, setDepartment] = useState(departmentFilter);

  const totalPages = Math.ceil(totalEmployees / pageSize);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ search, department, sort: sortField, order: sortOrder, page: "1" });
  };

  const handleSort = (field: string) => {
    const newOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSearchParams({ search, department, sort: field, order: newOrder, page: page.toString() });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ search, department, sort: sortField, order: sortOrder, page: newPage.toString() });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 to-black min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Employees</h1>
        <Link
          to="/employees/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Add Employee
        </Link>
      </div>
  
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-700 rounded-lg flex-grow bg-gray-800 text-white placeholder-gray-400"
          />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="p-2 border border-gray-700 rounded-lg bg-gray-800 text-white"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.department} value={dept.department}>
                {dept.department}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Filter
          </button>
        </div>
      </form>
  
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("full_name")}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("job_title")}
              >
                Job Title
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("department")}
              >
                Department
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("salary")}
              >
                Salary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-gray-750 transition duration-200">
                <td className="px-6 py-4 text-sm text-white">{employee.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{employee.job_title}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{employee.department}</td>
                <td className="px-6 py-4 text-sm text-gray-300">${employee.salary}</td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    to={`/employees/${employee.id}`}
                    className="text-blue-400 hover:text-blue-300 transition duration-300"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="mt-6 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => handlePageChange(page - 1)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 disabled:bg-gray-500"
        >
          Previous
        </button>
        <span className="text-sm text-gray-300">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => handlePageChange(page + 1)}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 disabled:bg-gray-500"
        >
          Next
        </button>
      </div>
  
      <div className="mt-6">
      <a
              href="/timesheets"
              className="inline-flex items-center text-blue-400 hover:text-blue-300 transition duration-300"
            >
              <span>Go to Timesheets</span>
              <FaArrowRight className="ml-2" />
            </a>
</div>
    </div>
  </div>
  );
}