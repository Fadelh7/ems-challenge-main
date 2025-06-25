import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfigPath = path.join(__dirname, '../database.yaml');
const dbConfig = yaml.load(fs.readFileSync(dbConfigPath, 'utf8'));

const {
  'sqlite_path': sqlitePath,
} = dbConfig;

const db = new sqlite3.Database(sqlitePath);

const employees = [
  {
    full_name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    date_of_birth: "1990-05-15",
    job_title: "Software Engineer",
    department: "Engineering",
    salary: 6000,
    start_date: "2022-01-10",
    end_date: null,
    photo_path: "/uploads/john_doe.jpg",
    document_path: "/uploads/john_doe_cv.pdf"
  },
  {
    full_name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "987-654-3210",
    date_of_birth: "1985-08-25",
    job_title: "HR Manager",
    department: "Human Resources",
    salary: 7000,
    start_date: "2021-06-15",
    end_date: null,
    photo_path: "/uploads/jane_smith.jpg",
    document_path: "/uploads/jane_smith_cv.pdf"
  }
];

const timesheets = [
  { 
    employee_id: 1, 
    start_time: "2024-02-01 09:00:00", 
    end_time: "2024-02-01 17:00:00", 
    work_summary: "Developed new feature X." 
  },
  { 
    employee_id: 2, 
    start_time: "2024-02-02 08:30:00", 
    end_time: "2024-02-02 16:30:00", 
    work_summary: "Conducted interviews and onboarding." 
  }
];

const insertData = (table, data) => {
  const columns = Object.keys(data[0]).join(', ');
  const placeholders = Object.keys(data[0]).map(() => '?').join(', ');

  const insertStmt = db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`);

  data.forEach(row => {
    insertStmt.run(Object.values(row));
  });

  insertStmt.finalize();
};

db.serialize(() => {
  db.run("DELETE FROM employees");
  db.run("DELETE FROM timesheets");

  insertData('employees', employees);
  insertData('timesheets', timesheets);
});

db.close(err => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Database seeded successfully.');
  }
});