import { Form, useLoaderData, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export async function loader({ params }: any) {
  const db = await getDB();
  const employee = await db.get("SELECT * FROM employees WHERE id = ?", [params.employeeId]);
  return { employee };
}

export const action = async ({ request, params }: any) => {
  if (request.headers.get('content-type')?.includes('multipart/form-data')) {
    const form = formidable({ multiples: false, uploadDir: path.join(process.cwd(), 'public/uploads'), keepExtensions: true });
    const result = await new Promise((resolve, reject) => {
      form.parse(request as any, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });
    const [fields, files]: [any, any] = result as [any, any];
    const full_name = fields.full_name?.[0];
    const email = fields.email?.[0];
    const phone = fields.phone?.[0];
    const date_of_birth = fields.date_of_birth?.[0];
    const job_title = fields.job_title?.[0];
    const department = fields.department?.[0];
    const salary = fields.salary?.[0];
    const start_date = fields.start_date?.[0];
    const end_date = fields.end_date?.[0];
    // Get current employee for existing file paths
    const db = await getDB();
    const current = await db.get("SELECT photo_path, cv_path FROM employees WHERE id = ?", [params.employeeId]);
    // File paths: use new if uploaded, else keep old
    const photo_path = files.photo && files.photo[0] && files.photo[0].size > 0 ? `/uploads/${path.basename(files.photo[0].filepath)}` : current.photo_path;
    const cv_path = files.cv && files.cv[0] && files.cv[0].size > 0 ? `/uploads/${path.basename(files.cv[0].filepath)}` : current.cv_path;
    // Validation
    const errors: any = {};
    if (!full_name) errors.full_name = "Full name is required";
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email as string)) errors.email = "Valid email is required";
    if (!date_of_birth) errors.date_of_birth = "Date of birth is required";
    if (!job_title) errors.job_title = "Job title is required";
    if (!department) errors.department = "Department is required";
    if (!salary || isNaN(Number(salary)) || Number(salary) < 10000) errors.salary = "Salary must be at least 10000";
    if (!start_date) errors.start_date = "Start date is required";
    if (date_of_birth) {
      const dob = new Date(date_of_birth as string);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) errors.date_of_birth = "Employee must be at least 18 years old";
    }
    if (Object.keys(errors).length > 0) {
      return errors;
    }
    await db.run(
      `UPDATE employees SET full_name=?, email=?, phone=?, date_of_birth=?, job_title=?, department=?, salary=?, start_date=?, end_date=?, photo_path=?, cv_path=? WHERE id=?`,
      [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, cv_path, params.employeeId]
    );
    return redirect("/employees");
  }
  return { error: 'Form must be multipart/form-data' };
};

export default function EmployeePage() {
  const { employee } = useLoaderData() as any;
  const errors = useActionData() as any;
  if (!employee) return <div>Employee not found</div>;
  return (
    <div className="container">
      <h1>Edit Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" defaultValue={employee.full_name} required />
          {errors?.full_name && <div className="error">{errors.full_name}</div>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" defaultValue={employee.email} required />
          {errors?.email && <div className="error">{errors.email}</div>}
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input type="tel" name="phone" id="phone" defaultValue={employee.phone || ''} />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of Birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" defaultValue={employee.date_of_birth} required />
          {errors?.date_of_birth && <div className="error">{errors.date_of_birth}</div>}
        </div>
        <div>
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" defaultValue={employee.job_title} required />
          {errors?.job_title && <div className="error">{errors.job_title}</div>}
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" defaultValue={employee.department} required />
          {errors?.department && <div className="error">{errors.department}</div>}
        </div>
        <div>
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" defaultValue={employee.salary} required min="10000" />
          {errors?.salary && <div className="error">{errors.salary}</div>}
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" defaultValue={employee.start_date} required />
          {errors?.start_date && <div className="error">{errors.start_date}</div>}
        </div>
        <div>
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" defaultValue={employee.end_date || ''} />
        </div>
    <div>
          <label htmlFor="photo">Photo</label>
          <input type="file" name="photo" id="photo" accept="image/*" />
          {employee.photo_path && <a href={employee.photo_path} target="_blank" rel="noopener noreferrer" style={{marginLeft:8}}>View current photo</a>}
        </div>
      <div>
          <label htmlFor="cv">CV</label>
          <input type="file" name="cv" id="cv" accept="application/pdf,.doc,.docx" />
          {employee.cv_path && <a href={employee.cv_path} target="_blank" rel="noopener noreferrer" style={{marginLeft:8}}>View current CV</a>}
      </div>
        <button type="submit" className="button">Update Employee</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  );
}
