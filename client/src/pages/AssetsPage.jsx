// ============================================
// Assets list & detail pages
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { assetAPI, userAPI } from '../api/endpoints.js';
import { Button } from '../components/ui/Button.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { PageHeader, EmptyState, LoadingScreen, Card } from '../components/ui/Common.jsx';
import { LifecycleBadge } from '../components/ui/StatusBadge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useAuthStore from '../stores/authStore.js';
import useUIStore from '../stores/uiStore.js';
import { fmtDate, fmtDateTime, fmtRelative, getErrMsg, canManageAssets, LIFECYCLE_META, ASSET_TRANSITIONS } from '../utils/helpers.js';

const ASSET_TYPES = [
  'laptop','desktop','monitor','keyboard','mouse','printer',
  'phone','tablet','server','network_device','software_license','other'
];
const LIFECYCLE_STATES = Object.keys(LIFECYCLE_META);

// ─── Asset list ───────────────────────────────────────────────────────────────
export function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', lifecycleStatus: '', search: '' });
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const canManage = canManageAssets(user?.role);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await assetAPI.getAll(params);
      setAssets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load assets', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Assets"
        subtitle={`${pagination.total} total assets`}
        actions={canManage && (
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
            Add Asset
          </Button>
        )}
      />

      {/* Filters */}
      <div className="card p-3 mb-4 flex flex-wrap gap-2">
        <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
          placeholder="Search assets…"
          className="h-8 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt transition-colors-fast w-48"
        />
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none">
          <option value="">All Types</option>
          {ASSET_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
        </select>
        <select value={filters.lifecycleStatus} onChange={(e) => setFilters({ ...filters, lifecycleStatus: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none">
          <option value="">All Status</option>
          {LIFECYCLE_STATES.map((s) => <option key={s} value={s}>{LIFECYCLE_META[s]?.label}</option>)}
        </select>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchAssets}>Refresh</Button>
      </div>

      {/* Table */}
      {loading ? <LoadingScreen /> : assets.length === 0 ? (
        <EmptyState icon={Monitor} title="No assets found" description="Add your first asset to get started."
          action={canManage && <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>Add Asset</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Tag</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Asset</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Type</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Assigned To</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Department</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Warranty</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Added</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => (
                <tr key={a._id} onClick={() => navigate(`/assets/${a._id}`)}
                  className="cursor-pointer hover:bg-slate-700/30 transition-colors-fast">
                  <td className="font-mono-data text-slate-400">{a.assetTag}</td>
                  <td>
                    <p className="text-sm text-slate-200">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.manufacturer} {a.model}</p>
                  </td>
                  <td className="text-sm text-slate-400 capitalize">{a.type?.replace('_', ' ')}</td>
                  <td><LifecycleBadge status={a.lifecycleStatus} /></td>
                  <td>
                    {a.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={a.assignedTo.name} size="xs" />
                        <span className="text-xs text-slate-400">{a.assignedTo.name}</span>
                      </div>
                    ) : <span className="text-xs text-slate-600">—</span>}
                  </td>
                  <td className="text-sm text-slate-400">{a.department || '—'}</td>
                  <td className="text-xs text-slate-400">{a.warrantyExpiry ? fmtDate(a.warrantyExpiry) : '—'}</td>
                  <td className="text-xs text-slate-500">{fmtRelative(a.createdAt)}</td>
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

      {createOpen && (
        <CreateAssetModal onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); fetchAssets(); }} />
      )}
    </div>
  );
}

// ─── Create Asset Modal ───────────────────────────────────────────────────────
function CreateAssetModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ type: '', name: '', manufacturer: '', model: '', serialNumber: '', department: '', location: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assetAPI.create(form);
      toast.success('Asset created');
      onCreated();
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add Asset" size="md"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={submit}>Create Asset</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type *" id="ast-type" value={form.type} onChange={f('type')} required>
            <option value="">Select type</option>
            {ASSET_TYPES.map((t) => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
          </Select>
          <Input label="Name *" id="ast-name" value={form.name} onChange={f('name')} placeholder="e.g. Dell Latitude 5540" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Manufacturer" id="ast-mfr" value={form.manufacturer} onChange={f('manufacturer')} placeholder="e.g. Dell" />
          <Input label="Model" id="ast-model" value={form.model} onChange={f('model')} placeholder="e.g. Latitude 5540" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Serial Number" id="ast-serial" value={form.serialNumber} onChange={f('serialNumber')} placeholder="SN-XXXX" />
          <Input label="Department" id="ast-dept" value={form.department} onChange={f('department')} placeholder="e.g. IT" />
        </div>
        <Input label="Location" id="ast-loc" value={form.location} onChange={f('location')} placeholder="e.g. Floor 3, Desk 42" />
      </form>
    </Modal>
  );
}

// ─── Asset Detail Page ────────────────────────────────────────────────────────
export function AssetDetailPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [transitioning, setTransitioning] = useState(false);
  const { user } = useAuthStore();
  const { showConfirm } = useUIStore();
  const toast = useToast();
  const navigate = useNavigate();
  const canManage = canManageAssets(user?.role);

  const fetchAsset = async () => {
    try {
      const { data } = await assetAPI.getById(id);
      setAsset(data.data);
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
    userAPI.getAgents().then(({ data }) => setAgents(data.data));
  }, [id]);

  const handleTransition = async (toStatus) => {
    const confirmed = await showConfirm({
      title: 'Lifecycle Transition',
      message: `Move asset from '${asset.lifecycleStatus}' to '${toStatus}'?`,
      confirmLabel: 'Confirm',
    });
    if (!confirmed) return;
    setTransitioning(true);
    try {
      const { data } = await assetAPI.transition(id, { toStatus });
      setAsset(data.data);
      toast.success('Transitioned', `Asset is now '${toStatus}'`);
    } catch (err) {
      toast.error('Transition failed', getErrMsg(err));
    } finally {
      setTransitioning(false);
    }
  };

  const handleAssign = async (userId) => {
    try {
      const { data } = await assetAPI.assign(id, { userId: userId || null });
      setAsset(data.data);
      toast.success('Assignment updated');
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    }
  };

  if (loading) return <LoadingScreen />;
  if (!asset) return <EmptyState title="Asset not found" />;

  const validTransitions = ASSET_TRANSITIONS[asset.lifecycleStatus] || [];

  return (
    <div className="animate-fade-in max-w-4xl">
      <button onClick={() => navigate('/assets')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors-fast">
        <ArrowLeft size={14} /> Back to assets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono-data text-slate-500 text-xs mb-1">{asset.assetTag}</p>
                <h2 className="text-base font-semibold text-slate-100">{asset.name}</h2>
                <p className="text-sm text-slate-400 mt-0.5">{asset.manufacturer} {asset.model}</p>
              </div>
              <LifecycleBadge status={asset.lifecycleStatus} />
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              {[
                { label: 'Type', value: asset.type?.replace('_',' ') },
                { label: 'Serial', value: asset.serialNumber || '—' },
                { label: 'Department', value: asset.department || '—' },
                { label: 'Location', value: asset.location || '—' },
                { label: 'Purchase Date', value: asset.purchaseDate ? fmtDate(asset.purchaseDate) : '—' },
                { label: 'Purchase Cost', value: asset.purchaseCost ? `$${asset.purchaseCost.toLocaleString()}` : '—' },
                { label: 'Warranty Expiry', value: asset.warrantyExpiry ? fmtDate(asset.warrantyExpiry) : '—' },
                { label: 'Vendor', value: asset.vendor?.name || '—' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between gap-4">
                  <span className="text-xs text-slate-500">{r.label}</span>
                  <span className="text-xs text-slate-300 capitalize">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* History timeline */}
          {asset.history?.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">History</p>
              <div className="space-y-3">
                {asset.history.map((h, i) => (
                  <div key={h._id} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowRight size={10} className="text-amber-burnt" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 font-medium">{h.action}</p>
                      {h.notes && <p className="text-xs text-slate-500 mt-0.5">{h.notes}</p>}
                      <p className="text-xs text-slate-600 mt-0.5">
                        {h.performedBy?.name && `${h.performedBy.name} · `}{fmtRelative(h.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Actions panel */}
        <div className="space-y-4">
          {/* Assignment */}
          {canManage && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Assignment</p>
              <div className="flex items-center gap-2 mb-3">
                {asset.assignedTo ? (
                  <>
                    <Avatar name={asset.assignedTo.name} size="sm" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{asset.assignedTo.name}</p>
                      <p className="text-xs text-slate-500">{asset.assignedTo.email}</p>
                    </div>
                  </>
                ) : <p className="text-xs text-slate-500">Not assigned</p>}
              </div>
              <select
                value={asset.assignedTo?._id || ''}
                onChange={(e) => handleAssign(e.target.value)}
                className="w-full h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
              >
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </Card>
          )}

          {/* Lifecycle transitions */}
          {canManage && validTransitions.length > 0 && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Lifecycle</p>
              <p className="text-xs text-slate-500 mb-3">
                Current: <span className="text-slate-300 font-medium capitalize">{asset.lifecycleStatus}</span>
              </p>
              <div className="space-y-2">
                {validTransitions.map((t) => (
                  <Button key={t} variant="secondary" size="sm" className="w-full justify-start"
                    loading={transitioning} onClick={() => handleTransition(t)}>
                    <ArrowRight size={12} className="text-amber-burnt" />
                    Move to <span className="capitalize ml-1">{t}</span>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Notes */}
          {asset.notes && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-xs text-slate-400 leading-relaxed">{asset.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
