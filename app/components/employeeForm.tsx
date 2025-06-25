// EmployeeForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Employee {
    full_name?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    job_title?: string;
    department?: string;
    salary?: number;
    start_date?: string;
    end_date?: string;
}

interface EmployeeFormProps {
    employee?: Employee;
    onSubmit: (formData: FormData) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, onSubmit }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Employee & { photo: File | null; document: File | null }>({
        full_name: employee?.full_name || "",
        email: employee?.email || "",
        phone: employee?.phone || "",
        date_of_birth: employee?.date_of_birth || "",
        job_title: employee?.job_title || "",
        department: employee?.department || "",
        salary: employee?.salary || 0,
        start_date: employee?.start_date || "",
        end_date: employee?.end_date || "",
        photo: null,
        document: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files.length > 0) {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                if (value instanceof File) {
                    if (value.size > 0) {
                        data.append(key, value);
                    }
                } else {
                    data.append(key, value.toString());
                }
            }
        });
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
            {/* Personal Information */}
            <div className="space-y-2">
                <label className="text-gray-300">Full Name *</label>
                <input
                    type="text"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Email *</label>
                <input
                    type="email"
                    name="email"
                    placeholder="john.doe@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Phone *</label>
                <input
                    type="tel"
                    name="phone"
                    placeholder="+1 234 567 890"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Date of Birth *</label>
                <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            {/* Employment Details */}
            <div className="space-y-2">
                <label className="text-gray-300">Job Title *</label>
                <input
                    type="text"
                    name="job_title"
                    placeholder="Software Engineer"
                    value={formData.job_title}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Department *</label>
                <input
                    type="text"
                    name="department"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Salary (USD) *</label>
                <input
                    type="number"
                    name="salary"
                    placeholder="50000"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    min="500"
                    step="100"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Start Date *</label>
                <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">End Date</label>
                <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
            </div>

            {/* File Uploads */}
            <div className="space-y-2">
                <label className="text-gray-300">Profile Photo (JPEG/PNG)</label>
                <div className="relative">
                    <input
                        type="file"
                        name="photo"
                        accept="image/png, image/jpeg"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-500 file:text-white
                            hover:file:bg-blue-600"
                    />
                    {formData.photo && (
                        <span className="text-sm text-gray-400 mt-1 block">
                            Selected: {formData.photo.name}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-gray-300">Employment Document (PDF)</label>
                <div className="relative">
                    <input
                        type="file"
                        name="document"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-500 file:text-white
                            hover:file:bg-blue-600"
                    />
                    {formData.document && (
                        <span className="text-sm text-gray-400 mt-1 block">
                            Selected: {formData.document.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Form Actions */}
            <div className="col-span-full flex gap-4 mt-6">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center gap-2"
                >
                    <span>Save Employee</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/employees")}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition duration-300 flex items-center gap-2"
                >
                    <span>Cancel</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;