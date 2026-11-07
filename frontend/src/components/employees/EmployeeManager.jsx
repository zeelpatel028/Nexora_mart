import React, { useState, useEffect, useCallback } from 'react';
import { employeeService } from '../../services';
import { Button } from '../common/Button';

export const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Cashier');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [salary, setSalary] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await employeeService.getEmployees();
      setEmployees(data || []);
    } catch (err) {
      setErrorMsg('Failed to load store employees');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openAddModal = () => {
    setEditingEmployee(null);
    setName('');
    setRole('Cashier');
    setPhone('');
    setEmail('');
    setSalary('');
    setHireDate(new Date().toISOString().split('T')[0]);
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setName(emp.name || '');
    setRole(emp.role || 'Cashier');
    setPhone(emp.phone || '');
    setEmail(emp.email || '');
    setSalary(emp.salary ? String(emp.salary) : '');
    setHireDate(emp.hire_date || '');
    setIsActive(emp.is_active !== false);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Employee name is required');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        salary: salary ? Number(salary) : 0,
        hire_date: hireDate || undefined,
        is_active: isActive
      };

      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, payload);
        setSuccessMsg(`Employee "${name}" updated successfully.`);
      } else {
        await employeeService.createEmployee(payload);
        setSuccessMsg(`Employee "${name}" added to store staff.`);
      }
      setShowModal(false);
      await loadEmployees();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save employee.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, empName) => {
    if (!window.confirm(`Deactivate staff profile for "${empName}"?`)) return;
    try {
      await employeeService.deleteEmployee(id);
      setSuccessMsg(`Employee "${empName}" deactivated.`);
      await loadEmployees();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to deactivate employee.');
    }
  };

  const totalPayroll = employees.reduce((sum, e) => sum + (e.is_active ? Number(e.salary || 0) : 0), 0);
  const activeStaffCount = employees.filter((e) => e.is_active).length;

  const filteredEmployees = employees.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (e.name && e.name.toLowerCase().includes(q)) ||
      (e.role && e.role.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="employee-manager-container">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">Staff & Employee Management</h4>
          <p className="text-muted small mb-0">
            Manage store team members, cashier shifts, managers, and monthly payroll.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={openAddModal}
            style={{ borderRadius: '9999px', backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
          >
            + Add Staff Member
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 small mb-3">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-primary">
            <span className="small text-secondary fw-semibold">Active Staff</span>
            <div className="h3 fw-bold text-dark my-1">
              {activeStaffCount}
            </div>
            <span className="small text-muted">{employees.length} total team members</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-success">
            <span className="small text-secondary fw-semibold">Total Monthly Payroll</span>
            <div className="h3 fw-bold text-success my-1">
              ₹ {totalPayroll.toLocaleString()}
            </div>
            <span className="small text-muted">Active staff compensation</span>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="p-3 bg-white rounded-3 border shadow-sm h-100 border-start border-4 border-info">
            <span className="small text-secondary fw-semibold">Roles Configured</span>
            <div className="h3 fw-bold text-info my-1">
              {new Set(employees.map((e) => e.role)).size || 1}
            </div>
            <span className="small text-muted">Managers, cashiers, inventory clerks</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3 p-3 border shadow-sm mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by staff name, role, phone, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ borderRadius: '12px', height: '42px' }}
        />
      </div>

      {/* Employees Grid */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
          <p className="small mb-0">Loading store staff profiles...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-3 border p-4">
          <div style={{ fontSize: '42px' }}>🧑‍💼</div>
          <h5 className="fw-bold mt-2">No Employees Registered</h5>
          <p className="text-muted small mb-3">Add store employees, cashiers, and managers to manage access.</p>
          <Button variant="primary" onClick={openAddModal}>
            + Add First Staff Member
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {filteredEmployees.map((emp) => (
            <div key={emp.id} className="col-12 col-md-6 col-xl-4">
              <div className="card h-100 p-3 border shadow-sm rounded-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      color: '#3B82F6',
                      fontWeight: 'bold',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {emp.name ? emp.name.charAt(0).toUpperCase() : 'E'}
                  </div>

                  <div className="flex-grow-1 min-w-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="fw-bold mb-0 text-dark text-truncate" title={emp.name}>
                        {emp.name}
                      </h6>
                      <span className={`badge ${emp.is_active ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-secondary-subtle text-secondary'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="badge bg-primary-subtle text-primary border border-primary-subtle small mt-1">
                      {emp.role}
                    </div>

                    {emp.phone && <div className="small text-secondary mt-1">📞 {emp.phone}</div>}
                    {emp.email && <div className="small text-muted text-truncate">✉️ {emp.email}</div>}
                  </div>
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="small text-muted" style={{ fontSize: '11px' }}>Monthly Salary</div>
                    <div className="h6 fw-bold mb-0 text-dark">
                      ₹ {Number(emp.salary || 0).toLocaleString()}
                    </div>
                  </div>

                  {emp.hire_date && (
                    <div className="text-end">
                      <div className="small text-muted" style={{ fontSize: '11px' }}>Hired On</div>
                      <div className="small text-muted font-monospace">{emp.hire_date}</div>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2 mt-3 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-grow-1 rounded-pill"
                    onClick={() => openEditModal(emp)}
                  >
                    ✏️ Edit Profile
                  </button>
                  {emp.is_active && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-pill px-3"
                      onClick={() => handleDelete(emp.id, emp.name)}
                      title="Deactivate employee"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)', zIndex: 1070 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0 p-3 rounded-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="fw-bold mb-1">
                    {editingEmployee ? 'Edit Staff Profile' : 'Add New Staff Member'}
                  </h5>
                  <p className="text-muted small mb-0">Store employee profile & role assignment</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Store Role *</label>
                    <select
                      className="form-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    >
                      <option value="Cashier">Cashier</option>
                      <option value="Store Manager">Store Manager</option>
                      <option value="Inventory Manager">Inventory Manager</option>
                      <option value="Sales Associate">Sales Associate</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Delivery Associate">Delivery Associate</option>
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-secondary">Monthly Salary (₹)</label>
                      <input
                        type="number"
                        step="500"
                        min="0"
                        className="form-control"
                        placeholder="e.g. 18000"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        style={{ borderRadius: '12px' }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="staff@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Hire Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={hireDate}
                      onChange={(e) => setHireDate(e.target.value)}
                      style={{ borderRadius: '12px' }}
                    />
                  </div>

                  {editingEmployee && (
                    <div className="form-check form-switch mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="staffActiveSwitch"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <label className="form-check-label small fw-semibold text-secondary" htmlFor="staffActiveSwitch">
                        Active Employment Status
                      </label>
                    </div>
                  )}
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={submitting}
                    style={{ backgroundColor: '#FF6A1A', borderColor: '#FF6A1A' }}
                  >
                    {submitting ? 'Saving...' : editingEmployee ? 'Update Profile' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;

