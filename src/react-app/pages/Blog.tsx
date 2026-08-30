import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { useSEO } from '../hooks/useSEO';
import { PAGE_SEO } from '@/shared/page-seo';
import { getBlogImageAlt } from '../utils/blogImageAlt';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  featured_image?: string;
  featured_image_credit?: string;
  featured_image_credit_url?: string;
  featured_image_source_url?: string;
  excerpt?: string;
  published_date: string;
  author?: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useSEO({
    title: PAGE_SEO['/blog'].title,
    description: PAGE_SEO['/blog'].description,
    canonicalPath: '/blog',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': 'https://emigrationpro.com/blog#blog',
      name: 'Emigration Pro Blog',
      description: PAGE_SEO['/blog'].description,
      url: 'https://emigrationpro.com/blog',
      publisher: { '@id': 'https://emigrationpro.com/#organization' },
      inLanguage: 'en-US',
      blogPost: posts.slice(0, 20).map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `https://emigrationpro.com/blog/${p.slug}`,
        datePublished: p.published_date,
        author: { '@type': 'Person', name: p.author || 'Emigration Pro' },
      })),
    },
  });

  const handleEmailSubmit = () => {
    // Email is already stored by the modal component
    // Redirect will be handled by EmailCaptureModal after email is saved to CRM
  };

  useEffect(() => {
    fetchPosts();

    // Add an event listener for visibility change to refresh posts when tab becomes active
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPosts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchPosts = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog/posts');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        throw new Error(data.error || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);

      // Automatic retry once after 1 second if it's a fetch error
      if (retryCount < 1) {
        setTimeout(() => fetchPosts(retryCount + 1), 1000);
      }
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
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-surface border border-brand-border rounded-full text-xs font-semibold text-brand-ink-2 uppercase tracking-wide mb-7">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />
              Latest Articles
            </div>
            <h1 className="font-brand-serif font-medium text-5xl md:text-6xl leading-[1.05] tracking-tight text-brand-ink mb-6">
              Emigration Insights & Resources
            </h1>
            <p className="text-lg leading-relaxed text-brand-muted max-w-2xl mx-auto mb-10">
              Expert advice, destination guides, and relocation tips for your journey abroad.
            </p>

            <button
              onClick={() => setShowEmailModal(true)}
              className="inline-flex items-center gap-2 px-7 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
            >
              Get Your Full Report
              <span className="text-lg leading-none">&rarr;</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
              <p className="text-brand-muted mt-4 font-medium">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-brand-surface border border-brand-border rounded-xl">
              <p className="text-brand-muted text-lg">No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden hover:border-brand-accent transition-colors"
                >
                  {post.featured_image && (
                    <div className="relative bg-brand-bg border-b border-brand-border">
                      <Link to={`/blog/${post.slug}`} className="block h-64 md:h-80 overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={getBlogImageAlt(post.title, post.slug)}
                          className="w-full h-full object-cover"
                          style={{ filter: 'saturate(0.9)' }}
                        />
                      </Link>
                      {post.featured_image_credit && (
                        <div className="absolute bottom-0 right-0 bg-black/70 px-3 py-1.5 text-[11px] text-white">
                          Photo by{' '}
                          <a
                            href={post.featured_image_credit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200"
                          >
                            {post.featured_image_credit}
                          </a>{' '}
                          on{' '}
                          <a
                            href={post.featured_image_source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-blue-200"
                          >
                            Unsplash
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="p-8 md:p-10">
                      <div className="flex items-center text-xs font-semibold text-brand-muted uppercase tracking-wide mb-4">
                        <time dateTime={post.published_date}>
                          {formatDate(post.published_date)}
                        </time>
                        {post.author && (
                          <>
                            <span className="mx-3 text-brand-border-strong">•</span>
                            <span>By {post.author}</span>
                          </>
                        )}
                      </div>
                      <h2 className="font-brand-serif text-3xl font-medium text-brand-ink mb-4 hover:text-brand-accent transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-base leading-relaxed text-brand-muted mb-6">
                          {post.excerpt}
                        </p>
                      )}
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-ink transition-colors">
                        Read more
                        <span className="text-lg leading-none">&rarr;</span>
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
      <div className="text-center py-4 bg-brand-surface border-t border-brand-border">
        <a
          href="/admin/blog"
          className="text-[10px] text-brand-muted hover:text-brand-ink transition-colors font-medium"
        >
          Site Health
        </a>
        <span className="mx-2 text-[10px] text-brand-border-strong">•</span>
        <a
          href="/admin/crm"
          className="text-[10px] text-brand-muted hover:text-brand-ink transition-colors font-medium"
        >
          Server
        </a>
        <span className="mx-2 text-[10px] text-brand-border-strong">•</span>
        <a
          href="/test-reports"
          className="text-[10px] text-brand-muted hover:text-brand-ink transition-colors font-medium"
        >
          Site Health
        </a>
      </div>
    </div>
  );
}
