import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BlogIndex from '../components/BlogIndex';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';

interface BlogPostType {
  id: number;
  title: string;
  slug: string;
  featured_image?: string;
  body: string;
  published_date: string;
  author?: string;
  allow_comments: boolean;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
    // Redirects to Stripe Checkout (buy.stripe.com)
  };

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.post);
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const extractStyles = (html: string): { styles: string; body: string } => {
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styles = '';
    let body = html;

    let match;
    while ((match = styleRegex.exec(html)) !== null) {
      styles += match[1] + '\n';
    }

    // Remove all style tags from body
    body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    return { styles, body };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link
              to="/blog"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            <div className="hidden lg:block">
              {/* Dynamically imported or standard import */}
              <BlogIndex />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">


            <article className="bg-white rounded-2xl shadow-lg overflow-hidden">


              {post.featured_image && (
                <div className="relative h-96 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', post.featured_image);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-8 md:p-12">
                <div className="flex items-center text-sm text-gray-500 mb-4">
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

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                  {post.title}
                </h1>

                {(() => {
                  const { styles, body } = extractStyles(post.body);
                  
                  // Detect if the content contains block-level HTML tags
                  const hasBlockTags = /<(p|div|table|section|article|ul|ol|h[1-6]|style)/i.test(body);
                  
                  // Only auto-insert <br /> if no block-level HTML tags are present
                  // This prevents breaking complex HTML structures like tables
                  const processedBody = hasBlockTags 
                    ? body 
                    : body.replace(/\n/g, '<br />');

                  return (
                    <>
                      {styles && <style>{styles}</style>}
                      <div className="overflow-x-auto">
                        <div
                        className="max-w-none prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-table:mt-4 prose-table:mb-4 prose-table:border-collapse prose-table:w-full prose-thead:bg-gray-50 prose-th:text-left prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2"
                          dangerouslySetInnerHTML={{ __html: processedBody }}
                        />
                      </div>
                    </>
                  );
                })()}

                {post.allow_comments && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Comments</h3>
                    <p className="text-gray-600">Comments feature coming soon...</p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Get a Professional Report Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Left Image */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden aspect-square flex items-center justify-center border-4 border-white">
                  <img
                    src="/images/blk-couple-sq.png"
                    alt="Couple reviewing emigration documents"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Center Content */}
              <div className="text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Get a Professional Report</h3>

                <div className="mb-6">
                  <div className="inline-block bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold uppercase tracking-wide">Limited Time Sale</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold line-through opacity-75">$69.99</span>
                        <span className="text-2xl font-extrabold animate-pulse">now $49.99</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowEmailModal(true)}
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <span className="mr-2">📋</span>
                  Get Your Report
                </button>
              </div>

              {/* Right Image */}
              <div className="hidden md:block">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden aspect-square flex items-center justify-center border-4 border-white">
                  <img
                    src="/images/old-couple.png"
                    alt="Couple reviewing emigration report"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
