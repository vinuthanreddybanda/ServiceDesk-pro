// ============================================
// Tickets list & detail pages
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { Plus, Filter, RefreshCw, Send, Lock, Paperclip, ArrowLeft, ChevronDown, Sparkles } from 'lucide-react';
import { ticketAPI, categoryAPI, priorityAPI, userAPI } from '../api/endpoints.js';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea, Select } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { PageHeader, EmptyState, LoadingScreen, Card } from '../components/ui/Common.jsx';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge.jsx';
import { SLATimer } from '../components/ui/SLATimer.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useAuthStore from '../stores/authStore.js';
import useUIStore from '../stores/uiStore.js';
import { fmtDateTime, fmtRelative, getErrMsg, canManageTickets, isAdminOrManager, TICKET_STATUS_OPTIONS, STATUS_META } from '../utils/helpers.js';

// ─── Ticket list ──────────────────────────────────────────────────────────────
const STATUS_OPTS = ['open','in_progress','pending','resolved','closed','escalated'];

export function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '', search: '' });
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Initial search from URL
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setFilters((f) => ({ ...f, search: q }));
  }, []);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data));
    priorityAPI.getAll().then(({ data }) => setPriorities(data.data));
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const { data } = await ticketAPI.getAll(params);
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error('Failed to load tickets', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tickets"
        subtitle={`${pagination.total} total tickets`}
        actions={
          <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>
            New Ticket
          </Button>
        }
      />

      {/* Filters */}
      <div className="card p-3 mb-4 flex flex-wrap gap-2 items-center">
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
          placeholder="Search tickets…"
          className="h-8 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt transition-colors-fast w-52"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
        >
          <option value="">All Status</option>
          {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>)}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
        >
          <option value="">All Priority</option>
          {priorities.map((p) => <option key={p._id} value={p._id}>{p.label}</option>)}
        </select>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchTickets}>Refresh</Button>
      </div>

      {/* Table */}
      {loading ? <LoadingScreen /> : tickets.length === 0 ? (
        <EmptyState icon={Filter} title="No tickets found" description="Try adjusting your filters or create a new ticket."
          action={<Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>New Ticket</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <table className="table-dense w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">ID</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Subject</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Requester</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Priority</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">SLA</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Assignee</th>
                <th className="text-left text-xs font-semibold text-slate-400 px-4 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => navigate(`/tickets/${t._id}`)}
                  className="cursor-pointer hover:bg-slate-700/30 transition-colors-fast"
                >
                  <td className="font-mono-data text-slate-400">{t.ticketId}</td>
                  <td>
                    <p className="text-sm text-slate-200 truncate max-w-[280px]">{t.subject}</p>
                    {t.category && <p className="text-xs text-slate-500">{t.category.name}</p>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Avatar name={t.requester?.name} size="xs" />
                      <span className="text-sm text-slate-300 truncate max-w-[100px]">{t.requester?.name}</span>
                    </div>
                  </td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td><SLATimer slaDueAt={t.slaDueAt} slaBreached={t.slaBreached} resolved={['resolved','closed'].includes(t.status)} /></td>
                  <td>
                    {t.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar name={t.assignee.name} size="xs" />
                        <span className="text-xs text-slate-400 truncate max-w-[80px]">{t.assignee.name}</span>
                      </div>
                    ) : <span className="text-xs text-slate-600">Unassigned</span>}
                  </td>
                  <td className="text-xs text-slate-500">{fmtRelative(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-6 h-6 text-xs rounded transition-default ${page === p ? 'bg-amber-burnt text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                    {p}
                  </button>
                ))}
                <Button variant="ghost" size="xs" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {createOpen && (
        <CreateTicketModal
          categories={categories}
          priorities={priorities}
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); fetchTickets(); }}
        />
      )}
    </div>
  );
}

// ─── Create Ticket Modal ──────────────────────────────────────────────────────
function CreateTicketModal({ categories, priorities, onClose, onCreated }) {
  const [form, setForm] = useState({ subject: '', description: '', category: '', priority: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ticketAPI.create({ ...form, category: form.category || undefined, priority: form.priority || undefined });
      toast.success('Ticket created', 'Your ticket has been submitted.');
      onCreated();
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Create Ticket" size="md"
      footer={<>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" loading={loading} onClick={submit}>Submit Ticket</Button>
      </>}
    >
      <form onSubmit={submit} className="space-y-4">
        <Input label="Subject *" id="new-subject" value={form.subject} onChange={f('subject')} placeholder="Brief description of the issue" required />
        <Textarea label="Description *" id="new-desc" value={form.description} onChange={f('description')}
          placeholder="Please provide detailed information about the issue…" rows={5} required />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Category" id="new-cat" value={form.category} onChange={f('category')}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Select label="Priority" id="new-prio" value={form.priority} onChange={f('priority')}>
            <option value="">Select priority</option>
            {priorities.map((p) => <option key={p._id} value={p._id}>{p.label}</option>)}
          </Select>
        </div>
      </form>
    </Modal>
  );
}

// ─── Ticket Detail Page ───────────────────────────────────────────────────────
export function TicketDetailPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [comment, setComment] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('comments'); // comments | notes | history
  const { user } = useAuthStore();
  const toast = useToast();
  const navigate = useNavigate();
  const isStaff = canManageTickets(user?.role);

  const fetchTicket = async () => {
    try {
      const { data } = await ticketAPI.getById(id);
      setTicket(data.data);
    } catch (err) {
      toast.error('Failed to load ticket', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    if (isStaff) {
      userAPI.getAgents().then(({ data }) => setAgents(data.data));
      priorityAPI.getAll().then(({ data }) => setPriorities(data.data));
    }
  }, [id]);

  const updateField = async (field, value) => {
    try {
      const { data } = await ticketAPI.update(id, { [field]: value || null });
      setTicket(data.data);
      toast.success('Updated', `Ticket ${field} updated`);
    } catch (err) {
      toast.error('Update failed', getErrMsg(err));
    }
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await ticketAPI.addComment(id, { content: comment });
      setComment('');
      fetchTicket();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  const postNote = async () => {
    if (!note.trim()) return;
    setSubmitting(true);
    try {
      await ticketAPI.addNote(id, { content: note });
      setNote('');
      fetchTicket();
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!ticket) return <EmptyState title="Ticket not found" description="This ticket doesn't exist or you don't have access." />;

  const resolved = ['resolved', 'closed'].includes(ticket.status);

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Back */}
      <button onClick={() => navigate('/tickets')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors-fast">
        <ArrowLeft size={14} /> Back to tickets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-mono-data text-slate-500 text-xs mb-1">{ticket.ticketId}</p>
                <h2 className="text-base font-semibold text-slate-100 leading-snug">{ticket.subject}</h2>
              </div>
              <div className="flex gap-2 shrink-0">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>

            {/* AI suggestion */}
            {ticket.aiClassification && !ticket.aiClassification.accepted && (
              <div className="mt-4 p-3 bg-amber-burnt/5 border border-amber-burnt/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={13} className="text-amber-burnt" />
                  <p className="text-xs font-semibold text-amber-burnt">AI Classification</p>
                  <span className="text-xs text-slate-500 ml-auto">{Math.round((ticket.aiClassification.confidence || 0) * 100)}% confidence</span>
                </div>
                <p className="text-xs text-slate-400">{ticket.aiClassification.probableIssue}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Suggested: <span className="text-slate-300">{ticket.aiClassification.suggestedCategory}</span> · <span className="text-slate-300">{ticket.aiClassification.suggestedPriority}</span>
                </p>
              </div>
            )}

            {/* Attachments */}
            {ticket.attachments?.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-medium text-slate-400">Attachments</p>
                {ticket.attachments.map((a) => (
                  <a key={a._id} href={a.cloudinaryUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-info hover:text-info-light">
                    <Paperclip size={11} /> {a.fileName}
                  </a>
                ))}
              </div>
            )}
          </Card>

          {/* Tabs */}
          <Card padding={false}>
            <div className="flex border-b border-slate-700">
              {[
                { key: 'comments', label: `Comments (${ticket.comments?.length || 0})` },
                ...(isStaff ? [{ key: 'notes', label: `Notes (${ticket.internalNotes?.length || 0})` }] : []),
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors-fast ${
                    activeTab === tab.key
                      ? 'border-amber-burnt text-amber-burnt'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Comments */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {(ticket.comments || []).map((c) => (
                    <div key={c._id} className="flex gap-3">
                      <Avatar name={c.author?.name} src={c.author?.avatar} size="sm" />
                      <div className="flex-1 bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-slate-200">{c.author?.name}</span>
                          <span className="text-xs text-slate-500">{fmtRelative(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  {!resolved && (
                    <div className="flex gap-3 mt-4">
                      <Avatar name={user?.name} size="sm" />
                      <div className="flex-1">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment…"
                          rows={3}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-amber-burnt transition-colors-fast"
                        />
                        <div className="flex justify-end mt-2">
                          <Button variant="primary" size="sm" icon={Send} loading={submitting} onClick={postComment}>
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Internal notes (staff only) */}
              {activeTab === 'notes' && isStaff && (
                <div className="space-y-4">
                  {(ticket.internalNotes || []).map((n) => (
                    <div key={n._id} className="flex gap-3">
                      <Avatar name={n.author?.name} size="sm" />
                      <div className="flex-1 bg-amber-burnt/5 border border-amber-burnt/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lock size={11} className="text-amber-burnt" />
                          <span className="text-xs font-semibold text-slate-200">{n.author?.name}</span>
                          <span className="text-xs text-slate-500">{fmtRelative(n.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{n.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 mt-4">
                    <Avatar name={user?.name} size="sm" />
                    <div className="flex-1">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add an internal note (only visible to staff)…"
                        rows={3}
                        className="w-full bg-slate-800 border border-amber-burnt/20 rounded px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-amber-burnt transition-colors-fast"
                      />
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm" icon={Lock} loading={submitting} onClick={postNote}>
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar panel */}
        <div className="space-y-4">
          {/* Actions (staff) */}
          {isStaff && (
            <Card>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
                  >
                    {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_META[s]?.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Assignee</label>
                  <select
                    value={ticket.assignee?._id || ''}
                    onChange={(e) => updateField('assignee', e.target.value)}
                    className="w-full h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Priority</label>
                  <select
                    value={ticket.priority?._id || ''}
                    onChange={(e) => updateField('priority', e.target.value)}
                    className="w-full h-8 bg-slate-800 border border-slate-700 rounded px-2 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none"
                  >
                    <option value="">No priority</option>
                    {priorities.map((p) => <option key={p._id} value={p._id}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Info */}
          <Card>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</p>
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Requester', value: ticket.requester?.name, avatar: ticket.requester },
                { label: 'Category', value: ticket.category?.name || '—' },
                { label: 'Department', value: ticket.department || '—' },
                { label: 'Created', value: fmtDateTime(ticket.createdAt) },
                { label: 'Updated', value: fmtRelative(ticket.updatedAt) },
                ...(ticket.resolvedAt ? [{ label: 'Resolved', value: fmtDateTime(ticket.resolvedAt) }] : []),
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="text-xs text-slate-500">{row.label}</span>
                  {row.avatar ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar name={row.avatar.name} size="xs" />
                      <span className="text-xs text-slate-300">{row.avatar.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300 text-right">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* SLA */}
          <Card>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">SLA</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Due</span>
                <span className="text-xs text-slate-300">{ticket.slaDueAt ? fmtDateTime(ticket.slaDueAt) : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Remaining</span>
                <SLATimer slaDueAt={ticket.slaDueAt} slaBreached={ticket.slaBreached} resolved={resolved} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
