import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  featured_image?: string;
  excerpt?: string;
  published_date: string;
  author?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog/posts');
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
            Emigration Insights & Resources
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Expert advice, destination guides, and relocation tips for your journey abroad
          </p>

          <div className="text-center mb-12">
            <a
              href="https://report.emigrationpro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
            >
              Get Your Report
            </a>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <p className="text-gray-600 text-lg">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Link to={`/blog/${post.slug}`} className="block">
                    {post.featured_image && (
                      <div className="relative h-64 overflow-hidden bg-gray-100">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-8">
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <time dateTime={post.published_date}>
                          {formatDate(post.published_date)}
                        </time>
                        {post.author && (
                          <>
                            <span className="mx-2">•</span>
                            <span>By {post.author}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-gray-600 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center">
                        Read more
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Footer Links - Below Footer */}
      <div className="text-center py-4 bg-gray-50 border-t border-gray-200">
        <a 
          href="/admin/blog"
          className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Site Health
        </a>
        <span className="mx-2 text-xs text-gray-400">•</span>
        <a 
          href="/admin/crm"
          className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium"
        >
          Server
        </a>
      </div>
    </div>
  );
}
