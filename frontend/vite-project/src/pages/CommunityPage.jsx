import { useEffect, useState } from "react";
import { Users, Plus, Heart, MessageCircle, Tag, X, Send } from "lucide-react";
import useAuthStore from "../store/authStore";
import api from "../utils/api";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const CATEGORIES = ["all", "question", "achievement", "resource", "discussion", "advice"];
const catColors = { question: "badge-blue", achievement: "badge-green", resource: "badge-purple", discussion: "badge-gray", advice: "badge-orange" };

function PostCard({ post, onLike, onComment }) {
  const { user } = useAuthStore();
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLiked = post.likes.includes(user?._id);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post._id, comment);
      setComment("");
      setShowComment(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card p-5 hover:border-dark-400 transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-dark-900 font-bold text-sm flex-shrink-0">
          {post.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-medium text-sm">{post.user?.name}</span>
            {post.user?.domain && <span className="text-text-muted text-xs">· {post.user.domain}</span>}
            <span className={catColors[post.category] || "badge-gray"}>{post.category}</span>
          </div>
          <h3 className="font-medium text-text-primary mb-2">{post.title}</h3>
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">{post.content}</p>
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-xs text-text-muted bg-dark-800 px-2 py-0.5 rounded">
                  <Tag size={10} />{tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-dark-500">
            <button onClick={() => onLike(post._id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? "text-red-400" : "text-text-muted hover:text-red-400"}`}>
              <Heart size={14} className={isLiked ? "fill-current" : ""} />
              {post.likes.length}
            </button>
            <button onClick={() => setShowComment(!showComment)}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-brand-400 transition-colors">
              <MessageCircle size={14} />
              {post.comments.length}
            </button>
            <span className="text-xs text-text-muted ml-auto">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>

          {/* Comments */}
          {post.comments.length > 0 && (
            <div className="mt-3 space-y-2">
              {post.comments.slice(-2).map((c) => (
                <div key={c._id} className="flex gap-2 bg-dark-800 rounded-lg p-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-text-secondary">{c.user?.name} · </span>
                    <span className="text-xs text-text-muted">{c.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showComment && (
            <div className="mt-3 flex gap-2">
              <input value={comment} onChange={(e) => setComment(e.target.value)}
                className="input-field flex-1 py-2 text-sm" placeholder="Write a comment..."
                onKeyDown={(e) => e.key === "Enter" && handleComment()} />
              <button onClick={handleComment} disabled={submitting} className="btn-primary py-2 px-3">
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "", category: "discussion" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = category !== "all" ? `?category=${category}` : "";
      const res = await api.get(`/community/posts${params}`);
      setPosts(res.data.posts);
    } catch (err) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) return toast.error("Title and content are required");
    setSubmitting(true);
    try {
      const res = await api.post("/community/posts", {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setPosts([res.data, ...posts]);
      setForm({ title: "", content: "", tags: "", category: "discussion" });
      setShowForm(false);
      toast.success("Post shared with the community!");
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.put(`/community/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => p._id === postId
        ? { ...p, likes: res.data.liked ? [...p.likes, user._id] : p.likes.filter((id) => id !== user._id) }
        : p
      ));
    } catch (err) {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const res = await api.post(`/community/posts/${postId}/comment`, { content });
      setPosts((prev) => prev.map((p) => p._id === postId ? { ...p, comments: [...p.comments, res.data] } : p));
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center">
            <Users size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Community</h1>
            <p className="text-text-muted text-sm">Learn, share, and grow together</p>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <Plus size={16} /> Post
        </button>
      </div>

      {/* Create Post Form */}
      {showForm && (
        <div className="card p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Share with Community</h2>
            <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field text-sm">
              {CATEGORIES.slice(1).map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field" placeholder="Post title..." />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field resize-none" rows={4} placeholder="Share your question, resource, or update..." />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="input-field text-sm" placeholder="Tags: react, nodejs, career (comma-separated)" />
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
                {submitting ? "Posting..." : "Share Post"}
              </button>
              <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-sm border whitespace-nowrap transition-all ${category === c ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-dark-500 text-text-muted hover:border-dark-400"}`}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="card h-32 shimmer" />)}</div>
      ) : posts.length === 0 ? (
        <div className="card p-10 text-center">
          <Users size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onLike={handleLike} onComment={handleComment} />
          ))}
        </div>
      )}
    </div>
  );
}