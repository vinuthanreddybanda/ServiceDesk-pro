// ============================================
// Settings page — categories, priorities, SLA
// ============================================
import { useState, useEffect } from 'react';
import { categoryAPI, priorityAPI, slaAPI } from '../api/endpoints.js';
import { PageHeader, Card, LoadingScreen, EmptyState } from '../components/ui/Common.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useUIStore from '../stores/uiStore.js';
import { getErrMsg } from '../utils/helpers.js';
import { Plus, Edit2, Trash2, Settings, Tag, AlertCircle, Clock } from 'lucide-react';

const TABS = [
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'priorities',  label: 'Priorities',  icon: AlertCircle },
  { key: 'sla',         label: 'SLA Policies', icon: Clock },
];

export function SettingsPage() {
  const [tab, setTab] = useState('categories');
  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage categories, priorities, and SLA policies" />
      <div className="flex gap-1 mb-5 border-b border-slate-700">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors-fast ${
              tab === key ? 'border-amber-burnt text-amber-burnt' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'priorities' && <PrioritiesPanel />}
      {tab === 'sla' && <SLAPanel />}
    </div>
  );
}

// ─── Categories ───────────────────────────────────────────────────────────────
function CategoriesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { showConfirm } = useUIStore();
  const toast = useToast();

  const fetch = () => categoryAPI.getAll().then(({ data }) => { setItems(data.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const del = async (id, name) => {
    const ok = await showConfirm({ title: 'Delete Category', message: `Delete '${name}'?`, confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try { await categoryAPI.delete(id); toast.success('Deleted'); fetch(); } catch (err) { toast.error('Failed', getErrMsg(err)); }
  };

  if (loading) return <LoadingScreen />;
  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>Add Category</Button>
      </div>
      <Card padding={false}>
        {items.length === 0 ? <EmptyState icon={Tag} title="No categories yet" /> : (
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Description</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Default Priority</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c._id} className="hover:bg-slate-700/20 transition-colors-fast">
                  <td className="text-sm text-slate-200 font-medium">{c.name}</td>
                  <td className="text-sm text-slate-400">{c.description || '—'}</td>
                  <td className="text-sm text-slate-400">{c.defaultPriority?.label || '—'}</td>
                  <td>
                    <span className={`badge text-xs px-2 py-0.5 ${c.isActive ? 'bg-success/10 text-success' : 'bg-slate-700 text-slate-400'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="xs" icon={Edit2} onClick={() => setEditItem(c)} />
                      <Button variant="ghost" size="xs" icon={Trash2} onClick={() => del(c._id, c.name)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {createOpen && <CategoryModal onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); fetch(); }} />}
      {editItem && <CategoryModal item={editItem} onClose={() => setEditItem(null)} onSaved={() => { setEditItem(null); fetch(); }} />}
    </div>
  );
}

function CategoryModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ name: item?.name || '', description: item?.description || '', isActive: item?.isActive ?? true });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      item ? await categoryAPI.update(item._id, form) : await categoryAPI.create(form);
      toast.success(item ? 'Category updated' : 'Category created');
      onSaved();
    } catch (err) { toast.error('Failed', getErrMsg(err)); } finally { setLoading(false); }
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Category' : 'New Category'} size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={save}>Save</Button></>}>
      <form onSubmit={save} className="space-y-4">
        <Input label="Name *" id="cat-name" value={form.name} onChange={f('name')} required />
        <Input label="Description" id="cat-desc" value={form.description} onChange={f('description')} />
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="accent-amber-burnt" />
          Active
        </label>
      </form>
    </Modal>
  );
}

// ─── Priorities ───────────────────────────────────────────────────────────────
function PrioritiesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const { showConfirm } = useUIStore();
  const toast = useToast();

  const fetch = () => priorityAPI.getAll().then(({ data }) => { setItems(data.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);
  const del = async (id, name) => {
    const ok = await showConfirm({ title: 'Delete Priority', message: `Delete '${name}'?`, confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try { await priorityAPI.delete(id); toast.success('Deleted'); fetch(); } catch (err) { toast.error('Failed', getErrMsg(err)); }
  };

  if (loading) return <LoadingScreen />;
  return (
    <div>
      <Card padding={false}>
        {items.length === 0 ? <EmptyState icon={AlertCircle} title="No priorities" /> : (
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Label</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Weight</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Color</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Response (min)</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Resolution (min)</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="hover:bg-slate-700/20 transition-colors-fast">
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-slate-200 font-medium">{p.label}</span>
                    </div>
                  </td>
                  <td className="text-sm text-slate-400">{p.weight}</td>
                  <td><code className="font-mono-data text-slate-400">{p.color}</code></td>
                  <td className="text-sm text-slate-400">{p.slaResponseMins}</td>
                  <td className="text-sm text-slate-400">{p.slaResolutionMins}</td>
                  <td>
                    <Button variant="ghost" size="xs" icon={Edit2} onClick={() => setEditItem(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {editItem && <PriorityModal item={editItem} onClose={() => setEditItem(null)} onSaved={() => { setEditItem(null); fetch(); }} />}
    </div>
  );
}

function PriorityModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ label: item?.label || '', weight: item?.weight || 1, color: item?.color || '#888888', slaResponseMins: item?.slaResponseMins || 60, slaResolutionMins: item?.slaResolutionMins || 240 });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      item ? await priorityAPI.update(item._id, form) : await priorityAPI.create(form);
      toast.success('Saved'); onSaved();
    } catch (err) { toast.error('Failed', getErrMsg(err)); } finally { setLoading(false); }
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit Priority' : 'New Priority'} size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={save}>Save</Button></>}>
      <form onSubmit={save} className="space-y-4">
        <Input label="Label *" id="pri-label" value={form.label} onChange={f('label')} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Weight (1–4)" id="pri-weight" type="number" min={1} max={4} value={form.weight} onChange={f('weight')} required />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-300">Color</label>
            <input type="color" value={form.color} onChange={f('color')} className="h-9 w-full rounded border border-slate-700 bg-slate-800 cursor-pointer px-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Response (min)" id="pri-resp" type="number" min={1} value={form.slaResponseMins} onChange={f('slaResponseMins')} required />
          <Input label="Resolution (min)" id="pri-res" type="number" min={1} value={form.slaResolutionMins} onChange={f('slaResolutionMins')} required />
        </div>
      </form>
    </Modal>
  );
}

// ─── SLA Policies ─────────────────────────────────────────────────────────────
function SLAPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { showConfirm } = useUIStore();
  const toast = useToast();

  const fetch = () => slaAPI.getAll().then(({ data }) => { setItems(data.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);
  const del = async (id, name) => {
    const ok = await showConfirm({ title: 'Delete SLA Policy', message: `Delete '${name}'?`, confirmLabel: 'Delete', variant: 'danger' });
    if (!ok) return;
    try { await slaAPI.delete(id); toast.success('Deleted'); fetch(); } catch (err) { toast.error('Failed', getErrMsg(err)); }
  };

  if (loading) return <LoadingScreen />;
  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>Add SLA Policy</Button>
      </div>
      <Card padding={false}>
        {items.length === 0 ? <EmptyState icon={Clock} title="No SLA policies" /> : (
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Priority</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Response (min)</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Resolution (min)</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Active</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s._id} className="hover:bg-slate-700/20 transition-colors-fast">
                  <td className="text-sm text-slate-200 font-medium">{s.name}</td>
                  <td>
                    {s.priority && (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.priority.color }} />
                        <span className="text-sm text-slate-300">{s.priority.label}</span>
                      </div>
                    )}
                  </td>
                  <td className="text-sm text-slate-400">{s.responseTime}</td>
                  <td className="text-sm text-slate-400">{s.resolutionTime}</td>
                  <td>
                    <span className={`badge text-xs px-2 py-0.5 ${s.isActive ? 'bg-success/10 text-success' : 'bg-slate-700 text-slate-400'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="xs" icon={Edit2} onClick={() => setEditItem(s)} />
                      <Button variant="ghost" size="xs" icon={Trash2} onClick={() => del(s._id, s.name)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {createOpen && <SLAModal priorities={[]} onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); fetch(); }} />}
      {editItem && <SLAModal item={editItem} priorities={[]} onClose={() => setEditItem(null)} onSaved={() => { setEditItem(null); fetch(); }} />}
    </div>
  );
}

function SLAModal({ item, onClose, onSaved }) {
  const [form, setForm] = useState({ name: item?.name || '', priority: item?.priority?._id || '', responseTime: item?.responseTime || 30, resolutionTime: item?.resolutionTime || 240, isActive: item?.isActive ?? true });
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  useEffect(() => { priorityAPI.getAll().then(({ data }) => setPriorities(data.data)); }, []);
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const save = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      item ? await slaAPI.update(item._id, form) : await slaAPI.create(form);
      toast.success('Saved'); onSaved();
    } catch (err) { toast.error('Failed', getErrMsg(err)); } finally { setLoading(false); }
  };
  return (
    <Modal open onClose={onClose} title={item ? 'Edit SLA Policy' : 'New SLA Policy'} size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={save}>Save</Button></>}>
      <form onSubmit={save} className="space-y-4">
        <Input label="Name *" id="sla-name" value={form.name} onChange={f('name')} required />
        <Select label="Priority *" id="sla-pri" value={form.priority} onChange={f('priority')} required>
          <option value="">Select priority</option>
          {priorities.map((p) => <option key={p._id} value={p._id}>{p.label}</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Response (min)" id="sla-resp" type="number" min={1} value={form.responseTime} onChange={f('responseTime')} required />
          <Input label="Resolution (min)" id="sla-res" type="number" min={1} value={form.resolutionTime} onChange={f('resolutionTime')} required />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={f('isActive')} className="accent-amber-burnt" />
          Active
        </label>
      </form>
    </Modal>
  );
}
