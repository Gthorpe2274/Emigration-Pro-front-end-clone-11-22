import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  featured_image?: string;
  body: string;
  excerpt?: string;
  published_date?: string;
  is_published: boolean;
  allow_comments: boolean;
  author?: string;
  created_at: string;
}

export default function BlogAdmin() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('blogAdminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Blog admin states
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    featured_image: '',
    body: '',
    excerpt: '',
    published_date: '',
    is_published: false,
    allow_comments: true,
    author: ''
  });

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin#123') {
      sessionStorage.setItem('blogAdminAuth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('blogAdminAuth');
    setIsAuthenticated(false);
    setPassword('');
  };

  const insertTag = (startTag: string, endTag: string) => {
    const textarea = document.getElementById('post-body') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.body;

    const newText = text.substring(0, start) + startTag + text.substring(start, end) + endTag + text.substring(end);
    setFormData({ ...formData, body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, end + startTag.length);
    }, 0);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllPosts();
    }
  }, [isAuthenticated]);

  const fetchAllPosts = async () => {
    try {
      const response = await fetch('/api/admin/blog/posts', {
        headers: {
          'X-API-Key': 'admin#123'
        }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPost
        ? `/api/admin/blog/posts/${editingPost.id}`
        : '/api/admin/blog/posts';

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'admin#123'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
        resetForm();
        fetchAllPosts();
      } else {
        alert('Error: ' + (data.error || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      featured_image: post.featured_image || '',
      body: post.body,
      excerpt: post.excerpt || '',
      published_date: post.published_date || '',
      is_published: post.is_published,
      allow_comments: post.allow_comments,
      author: post.author || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
        headers: {
          'X-API-Key': 'admin#123'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Post deleted successfully');
        fetchAllPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      featured_image: '',
      body: '',
      excerpt: '',
      published_date: '',
      is_published: false,
      allow_comments: true,
      author: ''
    });
    setEditingPost(null);
    setShowForm(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Blog Admin</h1>
            <p className="text-gray-600">Enter password to access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter admin password"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main admin interface (shown after authentication)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Blog Management</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
            >
              {showForm ? 'Cancel' : '+ Create New Post'}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value)
                      });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter image URL or generate one"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const images = [
                            'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80', // Airplane wing
                            'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&q=80', // Airport terminal
                            'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80', // Suitcase
                            'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=800&q=80', // Woman with suitcase
                            'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80', // Passport
                            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80', // Travel planning
                            'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80', // Map
                          ];
                          setFormData(prev => ({ ...prev, featured_image: images[Math.floor(Math.random() * images.length)] }));
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition text-sm"
                      >
                        ✈️ Airport/Travel
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const images = [
                            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', // Moving boxes
                            'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80', // Keys/House
                            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80', // Modern home
                            'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80', // Unpacking
                            'https://images.unsplash.com/photo-1503594384566-461fe158e797?w=800&q=80', // Moving day
                            'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80', // Family moving
                          ];
                          setFormData(prev => ({ ...prev, featured_image: images[Math.floor(Math.random() * images.length)] }));
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm"
                      >
                        🏠 Moving/House
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const images = [
                            'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', // Diverse group
                            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', // Professional woman
                            'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80', // Family airport
                            'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&q=80', // Diverse crowd
                            'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', // Friends
                            'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80', // Portrait
                          ];
                          setFormData(prev => ({ ...prev, featured_image: images[Math.floor(Math.random() * images.length)] }));
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition text-sm"
                      >
                        👨‍👩‍👧‍👦 People/Family
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const images = [
                            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', // City street
                            'https://images.unsplash.com/photo-1449824913929-79aa4361e851?w=800&q=80', // Hong Kong
                            'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80', // Paris
                            'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&q=80', // New York
                            'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80', // Venice
                            'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80', // Street view
                          ];
                          setFormData(prev => ({ ...prev, featured_image: images[Math.floor(Math.random() * images.length)] }));
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg transition text-sm"
                      >
                        🌍 Foreign Cities
                      </button>
                    </div>
                  </div>
                  {formData.featured_image && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Preview:</p>
                      <img
                        src={formData.featured_image}
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).alt = '❌ Image failed to load. Check the URL.';
                          (e.target as HTMLImageElement).className = 'text-red-600 text-sm';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Body</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button type="button" onClick={() => insertTag('<b>', '</b>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold" title="Bold">B</button>
                    <button type="button" onClick={() => insertTag('<i>', '</i>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm italic" title="Italic">I</button>
                    <button type="button" onClick={() => insertTag('<u>', '</u>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm underline" title="Underline">U</button>
                    <button type="button" onClick={() => insertTag('<h2>', '</h2>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold" title="Heading 2">H2</button>
                    <button type="button" onClick={() => insertTag('<h3>', '</h3>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm font-bold" title="Heading 3">H3</button>
                    <button type="button" onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm" title="List">• List</button>
                    <button type="button" onClick={() => {
                      const url = window.prompt('Enter URL:');
                      if (url) insertTag(`<a href="${url}" class="text-blue-600 hover:underline">`, '</a>');
                    }} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm" title="Link">Link</button>
                  </div>
                  <textarea
                    id="post-body"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-64 font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Use the toolbar to format text. Newlines will be preserved as line breaks.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Published Date</label>
                  <input
                    type="date"
                    value={formData.published_date}
                    onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      className="mr-2"
                    />
                    Published
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.allow_comments}
                      onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                      className="mr-2"
                    />
                    Allow Comments
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6">All Posts</h2>

            {loading ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-gray-600">No posts yet. Create your first post!</p>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">Slug: {post.slug}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {post.is_published ? '✓ Published' : '✗ Draft'} |
                          Created: {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
