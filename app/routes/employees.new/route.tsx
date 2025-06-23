import { Form, redirect, type ActionFunction, useActionData } from "react-router";
import { getDB } from "~/db/getDB";
import { useState } from "react";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const action: ActionFunction = async ({ request }) => {
  // Use formidable for file upload
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
    // File paths
    const photo_path = files.photo && files.photo[0] ? `/uploads/${path.basename(files.photo[0].filepath)}` : null;
    const cv_path = files.cv && files.cv[0] ? `/uploads/${path.basename(files.cv[0].filepath)}` : null;

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
    const db = await getDB();
    await db.run(
      `INSERT INTO employees (full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, cv_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, date_of_birth, job_title, department, salary, start_date, end_date, photo_path, cv_path]
    );
    return redirect("/employees");
  }
  // fallback for non-multipart
  return { error: 'Form must be multipart/form-data' };
};

export default function NewEmployeePage() {
  const errors = useActionData() as any;
  return (
    <div className="container">
      <h1>Create New Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
          {errors?.full_name && <div className="error">{errors.full_name}</div>}
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" required />
          {errors?.email && <div className="error">{errors.email}</div>}
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input type="tel" name="phone" id="phone" />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of Birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" required />
          {errors?.date_of_birth && <div className="error">{errors.date_of_birth}</div>}
        </div>
        <div>
          <label htmlFor="job_title">Job Title</label>
          <input type="text" name="job_title" id="job_title" required />
          {errors?.job_title && <div className="error">{errors.job_title}</div>}
        </div>
        <div>
          <label htmlFor="department">Department</label>
          <input type="text" name="department" id="department" required />
          {errors?.department && <div className="error">{errors.department}</div>}
        </div>
        <div>
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" required min="10000" />
          {errors?.salary && <div className="error">{errors.salary}</div>}
        </div>
        <div>
          <label htmlFor="start_date">Start Date</label>
          <input type="date" name="start_date" id="start_date" required />
          {errors?.start_date && <div className="error">{errors.start_date}</div>}
        </div>
        <div>
          <label htmlFor="end_date">End Date</label>
          <input type="date" name="end_date" id="end_date" />
        </div>
        <div>
          <label htmlFor="photo">Photo</label>
          <input type="file" name="photo" id="photo" accept="image/*" />
        </div>
        <div>
          <label htmlFor="cv">CV</label>
          <input type="file" name="cv" id="cv" accept="application/pdf,.doc,.docx" />
        </div>
        <button type="submit" className="button">Create Employee</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/timesheets">Timesheets</a></li>
      </ul>
    </div>
  );
}
