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
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    date_of_birth: '1990-01-01',
    job_title: 'Software Engineer',
    department: 'Engineering',
    salary: 80000,
    start_date: '2020-01-15',
    end_date: null,
    photo_path: null,
    cv_path: null
  },
  {
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '234-567-8901',
    date_of_birth: '1985-05-20',
    job_title: 'Product Manager',
    department: 'Product',
    salary: 95000,
    start_date: '2018-03-10',
    end_date: null,
    photo_path: null,
    cv_path: null
  },
  {
    full_name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '345-678-9012',
    date_of_birth: '1992-09-12',
    job_title: 'Designer',
    department: 'Design',
    salary: 70000,
    start_date: '2021-07-01',
    end_date: null,
    photo_path: null,
    cv_path: null
  },
];

const timesheets = [
  {
    employee_id: 1,
    start_time: '2025-02-10 08:00:00',
    end_time: '2025-02-10 17:00:00',
    summary: 'Worked on frontend features.'
  },
  {
    employee_id: 2,
    start_time: '2025-02-11 12:00:00',
    end_time: '2025-02-11 17:00:00',
    summary: 'Product planning and meetings.'
  },
  {
    employee_id: 3,
    start_time: '2025-02-12 07:00:00',
    end_time: '2025-02-12 16:00:00',
    summary: 'Created new design mockups.'
  },
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

