import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { blogImages } from '../data/blogImages';

// Helper function to get API base URL
const getApiBaseUrl = () => {
  // If running on Netlify, use Cloudflare Workers URL
  if (window.location.hostname.includes('netlify.app')) {
    return 'https://emigration-pro.aiservices4biz.workers.dev';
  }
  // Otherwise use relative URL (works on Cloudflare Workers deployment)
  return '';
};

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

  // Image modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof blogImages>('local');
  const [isUploading, setIsUploading] = useState(false);

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
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/admin/blog/posts`, {
        headers: {
          'X-API-Key': 'admin#123'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch posts:', response.status, errorText);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        console.error('API returned error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - check if the server is accessible');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!formData.slug.trim()) {
      alert('Please enter a slug (or it will be auto-generated from the title)');
      setFormData({ ...formData, slug: generateSlug(formData.title) });
      return;
    }
    if (!formData.body.trim()) {
      alert('Please enter post content');
      return;
    }

    try {
      const apiBase = getApiBaseUrl();
      const url = editingPost
        ? `${apiBase}/api/admin/blog/posts/${editingPost.id}`
        : `${apiBase}/api/admin/blog/posts`;

      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'admin#123'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('API error response:', errorData);
        alert('Error: ' + (errorData.error || errorData.details || `HTTP ${response.status}`));
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert(editingPost ? 'Post updated successfully!' : 'Post created successfully!');
        resetForm();
        fetchAllPosts();
      } else {
        alert('Error: ' + (data.error || data.details || JSON.stringify(data)));
      }
    } catch (error) {
      console.error('Error saving post:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Failed to connect to server. Please check your connection and try again.');
      } else {
        alert('Failed to save post: ' + (error instanceof Error ? error.message : String(error)));
      }
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
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/admin/blog/posts/${id}`, {
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const apiBase = getApiBaseUrl();
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await fetch(`${apiBase}/api/admin/blog/upload-image`, {
        method: 'POST',
        headers: {
          'X-API-Key': 'admin#123'
        },
        body: uploadFormData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, featured_image: data.url });
        alert('Image uploaded successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      // Clear the input
      e.target.value = '';
    }
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
                  <div className="flex flex-col space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.featured_image}
                        onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter image URL or select from library"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImageModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center whitespace-nowrap"
                      >
                        🖼️ Browse Library
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className={`relative cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center whitespace-nowrap ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span>{isUploading ? '⌛ Uploading...' : '📤 Upload Custom Image'}</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                        />
                      </label>
                      <p className="text-xs text-gray-500">Max size: 5MB (JPG, PNG, WebP)</p>
                    </div>
                  </div>

                  {/* Image Selection Modal */}
                  {showImageModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                          <h3 className="text-xl font-bold text-gray-800">Select Featured Image</h3>
                          <button
                            onClick={() => setShowImageModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="p-4 border-b border-gray-200 flex space-x-4 overflow-x-auto">
                          {(['local', 'travel', 'moving', 'people', 'cities'] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {cat === 'local' && '📂 '}
                              {cat === 'travel' && '✈️ '}
                              {cat === 'moving' && '🏠 '}
                              {cat === 'people' && '👨‍👩‍👧‍👦 '}
                              {cat === 'cities' && '🌍 '}
                              {cat}
                            </button>
                          ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {blogImages[selectedCategory].map((img, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, featured_image: img });
                                  setShowImageModal(false);
                                }}
                                className="group relative aspect-video rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition"
                              >
                                <img
                                  src={img}
                                  alt={`${selectedCategory} ${index + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
                          <button
                            onClick={() => setShowImageModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
