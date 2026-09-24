// ============================================
// Knowledge Base page
// ============================================
import { useState, useEffect, useCallback } from 'react';
import { knowledgeAPI, categoryAPI } from '../api/endpoints.js';
import { PageHeader, EmptyState, LoadingScreen, Card } from '../components/ui/Common.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useAuthStore from '../stores/authStore.js';
import { fmtRelative, getErrMsg, canManageTickets } from '../utils/helpers.js';
import { BookOpen, Plus, ThumbsUp, Eye, Search, ArrowLeft } from 'lucide-react';

// ─── Article List ─────────────────────────────────────────────────────────────
export function KnowledgePage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const { user } = useAuthStore();
  const toast = useToast();
  const isStaff = canManageTickets(user?.role);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const { data } = await knowledgeAPI.getAll(params);
      setArticles(data.data);
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => {
    categoryAPI.getAll().then(({ data }) => setCategories(data.data));
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const markHelpful = async (id) => {
    await knowledgeAPI.markHelpful(id);
    setArticles((a) => a.map((x) => x._id === id ? { ...x, helpfulCount: x.helpfulCount + 1 } : x));
  };

  return (
    <div className="animate-fade-in">
      {selected ? (
        <ArticleView article={selected} onBack={() => setSelected(null)} onHelpful={() => markHelpful(selected._id)} />
      ) : (
        <>
          <PageHeader title="Knowledge Base" subtitle="Self-service IT support articles"
            actions={isStaff && (
              <Button variant="primary" icon={Plus} size="sm" onClick={() => setCreateOpen(true)}>New Article</Button>
            )}
          />

          {/* Search */}
          <div className="flex gap-2 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchArticles()}
                placeholder="Search articles…"
                className="w-full h-9 pl-8 pr-3 bg-slate-800 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-burnt transition-colors-fast"
              />
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="h-9 bg-slate-800 border border-slate-700 rounded px-3 text-sm text-slate-200 focus:outline-none focus:border-amber-burnt appearance-none">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? <LoadingScreen /> : articles.length === 0 ? (
            <EmptyState icon={BookOpen} title="No articles found" description="Be the first to create a knowledge base article." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {articles.map((a) => (
                <button key={a._id} onClick={() => setSelected(a)}
                  className="card p-4 text-left hover:border-amber-burnt/40 transition-default hover:bg-slate-800/80 group">
                  {a.category && (
                    <span className="text-xs font-medium text-amber-burnt">{a.category.name}</span>
                  )}
                  <h3 className="text-sm font-semibold text-slate-200 mt-1 mb-2 group-hover:text-amber-muted transition-colors-fast line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {a.content?.replace(/#{1,6} /g, '').replace(/\*\*/g, '').slice(0, 120)}…
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Eye size={11} /> {a.viewCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {a.helpfulCount}</span>
                    <span className="ml-auto">{fmtRelative(a.updatedAt)}</span>
                  </div>
                  {a.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs bg-slate-700 text-slate-400 rounded px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {createOpen && (
            <CreateArticleModal categories={categories} onClose={() => setCreateOpen(false)}
              onCreated={() => { setCreateOpen(false); fetchArticles(); }} />
          )}
        </>
      )}
    </div>
  );
}

// ─── Article Viewer ───────────────────────────────────────────────────────────
function ArticleView({ article, onBack, onHelpful }) {
  return (
    <div className="max-w-3xl animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 mb-5 transition-colors-fast">
        <ArrowLeft size={14} /> Back to knowledge base
      </button>
      <Card>
        {article.category && (
          <span className="text-xs font-medium text-amber-burnt">{article.category.name}</span>
        )}
        <h1 className="text-xl font-bold text-slate-100 mt-1 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Avatar name={article.author?.name} size="sm" />
            <div>
              <p className="text-xs font-medium text-slate-300">{article.author?.name}</p>
              <p className="text-xs text-slate-500">Updated {fmtRelative(article.updatedAt)}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Eye size={11} /> {article.viewCount} views</span>
            <button onClick={onHelpful}
              className="flex items-center gap-1 text-success hover:text-success-light transition-colors-fast">
              <ThumbsUp size={11} /> {article.helpfulCount} helpful
            </button>
          </div>
        </div>
        {/* Content rendered as pre-formatted markdown-like text */}
        <div className="prose-dark text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6 pt-4 border-t border-slate-700">
            {article.tags.map((t) => (
              <span key={t} className="text-xs bg-slate-700 text-slate-400 rounded px-2 py-0.5">{t}</span>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Create Article Modal ─────────────────────────────────────────────────────
function CreateArticleModal({ categories, onClose, onCreated }) {
  const [form, setForm] = useState({ title: '', content: '', category: '', tags: '', status: 'published' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await knowledgeAPI.create({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        category: form.category || undefined,
      });
      toast.success('Article created');
      onCreated();
    } catch (err) {
      toast.error('Failed', getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="New KB Article" size="lg"
      footer={<><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button variant="primary" size="sm" loading={loading} onClick={submit}>Publish</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Title *" id="kb-title" value={form.title} onChange={f('title')} placeholder="Article title" required />
        <div className="grid grid-cols-3 gap-3">
          <Select label="Category" id="kb-cat" value={form.category} onChange={f('category')}>
            <option value="">No category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </Select>
          <Select label="Status" id="kb-status" value={form.status} onChange={f('status')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          <Input label="Tags (comma-separated)" id="kb-tags" value={form.tags} onChange={f('tags')} placeholder="vpn, password, email" />
        </div>
        <Textarea label="Content *" id="kb-content" value={form.content} onChange={f('content')}
          placeholder="Write your article content here. Markdown formatting is supported." rows={12} required />
      </form>
    </Modal>
  );
}
