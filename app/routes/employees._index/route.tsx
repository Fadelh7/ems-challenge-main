import { useLoaderData, useSearchParams, Link } from "react-router"
import { FaSearch, FaUserPlus, FaClock, FaEdit } from "react-icons/fa"
import { getDB } from "~/db/getDB"

function getQueryParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "full_name",
    order: searchParams.get("order") || "asc",
    department: searchParams.get("department") || "",
    page: parseInt(searchParams.get("page") || "1", 10),
  };
}

export async function loader({ request }: any) {
  const url = new URL(request.url)
  const { search, sort, order, department, page } = getQueryParams(url.searchParams)
  const db = await getDB()
  let where = []
  let params: any[] = []
  if (search) {
    where.push("(full_name LIKE ? OR email LIKE ? OR job_title LIKE ? OR department LIKE ?)")
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`)
  }
  if (department) {
    where.push("department = ?")
    params.push(department)
  }
  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : ""
  const countRow = await db.get(`SELECT COUNT(*) as count FROM employees ${whereClause}`, params)
  const total = countRow.count
  const pageSize = 5
  const offset = (page - 1) * pageSize
  const employees = await db.all(
    `SELECT * FROM employees ${whereClause} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  )
  const departments = await db.all('SELECT DISTINCT department FROM employees')
  return { employees, total, page, pageSize, search, sort, order, department, departments: departments.map((d:any)=>d.department) }
}

export default function EmployeesPage() {
  const { employees, total, page, pageSize, search, sort, order, department, departments } = useLoaderData() as any
  const [searchParams, setSearchParams] = useSearchParams()
  const totalPages = Math.ceil(total / pageSize)

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    if (key !== "page") params.set("page", "1") // reset page on filter/sort/search
    setSearchParams(params)
  }

  function handleSort(col: string) {
    if (sort === col) {
      setParam("order", order === "asc" ? "desc" : "asc")
    } else {
      setParam("sort", col)
      setParam("order", "asc")
    }
  }

  return (
    <div className="container">
      <h1>Employees</h1>
      <div className="flex gap-2 mb-2" style={{alignItems:'center'}}>
        <div style={{position:'relative', flex:1}}>
          <FaSearch style={{position:'absolute', left:12, top: '50%', transform: 'translateY(-50%)', color:'#94a3b8'}} />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setParam("search", e.target.value)}
            style={{
              paddingLeft: '2.2em',
              borderRadius: '999px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              border: '1px solid #cbd5e1',
              background: '#f9fafb',
              height: '2.5em',
              width: '100%'
            }}
          />
        </div>
        <select value={department} onChange={e => setParam("department", e.target.value)} style={{borderRadius:'999px',height:'2.5em',padding:'0 1em',background:'#f9fafb',border:'1px solid #cbd5e1'}}>
          <option value="">All Departments</option>
          {departments.map((d: string) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th style={{cursor:'pointer'}} onClick={()=>handleSort('full_name')}>Full Name {sort==='full_name' ? (order==='asc'?'▲':'▼') : ''}</th>
            <th style={{cursor:'pointer'}} onClick={()=>handleSort('email')}>Email {sort==='email' ? (order==='asc'?'▲':'▼') : ''}</th>
            <th style={{cursor:'pointer'}} onClick={()=>handleSort('job_title')}>Job Title {sort==='job_title' ? (order==='asc'?'▲':'▼') : ''}</th>
            <th style={{cursor:'pointer'}} onClick={()=>handleSort('department')}>Department {sort==='department' ? (order==='asc'?'▲':'▼') : ''}</th>
            <th style={{cursor:'pointer'}} onClick={()=>handleSort('salary')}>Salary {sort==='salary' ? (order==='asc'?'▲':'▼') : ''}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee: any) => (
            <tr key={employee.id}>
              <td>{employee.full_name}</td>
              <td>{employee.email}</td>
              <td>{employee.job_title}</td>
              <td>{employee.department}</td>
              <td>{employee.salary}</td>
              <td>
                <Link to={`/employees/${employee.id}`} className="button" style={{display:'inline-flex',alignItems:'center',gap:4,padding:'0.3em 0.8em',fontSize:'0.95em'}}><FaEdit style={{marginRight:4}} />View/Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mt-2">
        {Array.from({length: totalPages}, (_, i) => (
          <button
            key={i+1}
            onClick={()=>setParam("page", String(i+1))}
            disabled={page === i+1}
            className="button"
          >{i+1}</button>
        ))}
      </div>
      <ul className="flex gap-2 mt-2">
        <li><Link to="/employees/new" className="button" style={{display:'inline-flex',alignItems:'center',gap:4}}><FaUserPlus style={{marginRight:4}} />New Employee</Link></li>
        <li><Link to="/timesheets/" className="button" style={{display:'inline-flex',alignItems:'center',gap:4}}><FaClock style={{marginRight:4}} />Timesheets</Link></li>
      </ul>
    </div>
  )
}
