// ============================================
// Users management page (admin/manager)
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../api/endpoints.js';
import { PageHeader, EmptyState, LoadingScreen, Card } from '../components/ui/Common.jsx';
import { RoleBadge } from '../components/ui/StatusBadge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Select } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { fmtDate, fmtRelative, getErrMsg } from '../utils/helpers.js';
import { Users, RefreshCw, Edit2 } from 'lucide-react';

const ROLES = ['admin','manager','technician','employee','asset_manager'];
const STATUSES = ['active','inactive','suspended'];

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const toast = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await userAPI.getAll(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load users', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Users" subtitle={`${pagination.total} registered users`} />

      {/* Filters */}
      <div className="card p-3 mb-4 flex flex-wrap gap-2">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          placeholder="Search by name or email…"
          className="h-8 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt w-52 transition-colors-fast"
        />
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none">
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchUsers}>Refresh</Button>
      </div>

      {loading ? <LoadingScreen /> : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">User</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Role</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Department</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Last Login</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Joined</th>
                <th className="text-xs font-semibold text-slate-400 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-700/20 transition-colors-fast">
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} src={u.avatar} size="sm" />
                      <div>
                        <p className="text-sm text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td className="text-sm text-slate-400">{u.department || '—'}</td>
                  <td>
                    <span className={`badge text-xs px-2 py-0.5 ${
                      u.status === 'active' ? 'bg-success/10 text-success' :
                      u.status === 'suspended' ? 'bg-danger/10 text-danger' : 'bg-slate-700 text-slate-400'
                    }`}>{u.status}</span>
                  </td>
                  <td className="text-xs text-slate-400">{u.lastLogin ? fmtRelative(u.lastLogin) : '—'}</td>
                  <td className="text-xs text-slate-500">{fmtDate(u.createdAt)}</td>
                  <td>
                    <Button variant="ghost" size="xs" icon={Edit2} onClick={() => setEditUser(u)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">Showing {(page-1)*20+1}–{Math.min(page*20, pagination.total)} of {pagination.total}</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="xs" disabled={page<=1} onClick={() => setPage((p) => p-1)}>Prev</Button>
                <Button variant="ghost" size="xs" disabled={page>=pagination.pages} onClick={() => setPage((p) => p+1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={() => { setEditUser(null); fetchUsers(); }} />
      )}
    </div>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ role: user.role, status: user.status, department: user.department || '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.update(user._id, form);
      toast.success('User updated');
      onSaved();
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit User" size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={save}>Save</Button></>}>
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
        <Avatar name={user.name} size="md" />
        <div>
          <p className="text-sm font-semibold text-slate-200">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <form onSubmit={save} className="space-y-4">
        <Select label="Role" id="eu-role" value={form.role} onChange={f('role')}>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace('_',' ')}</option>)}
        </Select>
        <Select label="Status" id="eu-status" value={form.status} onChange={f('status')}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </form>
    </Modal>
  );
}
