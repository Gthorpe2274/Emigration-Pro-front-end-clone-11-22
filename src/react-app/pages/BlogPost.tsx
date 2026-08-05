import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import BlogIndex from '../components/BlogIndex';
import EmailCaptureModal from '@/react-app/components/EmailCaptureModal';
import { useSEO } from '../hooks/useSEO';

interface BlogPostType {
  id: number;
  title: string;
  slug: string;
  featured_image?: string;
  featured_image_credit?: string;
  featured_image_credit_url?: string;
  featured_image_source_url?: string;
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

  useSEO({
    title: post ? post.title : 'Loading Post...',
    description: post ? (post.body.substring(0, 160).replace(/<[^>]*>?/gm, '')) : undefined
  });

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
      <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent mx-auto"></div>
          <p className="text-brand-muted mt-4 font-medium">Loading post...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
        <Navigation />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="font-brand-serif text-4xl font-medium text-brand-ink mb-4">Post Not Found</h1>
          <p className="text-brand-muted mb-8 text-lg">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3 bg-brand-btn text-brand-btn-ink rounded-lg font-semibold hover:bg-brand-ink-2 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg font-brand-sans text-brand-ink">
      <Navigation />
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={handleEmailSubmit}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <div className="lg:w-1/4 shrink-0">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted hover:text-brand-accent transition-colors mb-8"
            >
              <span className="text-lg leading-none">&larr;</span>
              Back to Blog
            </Link>
            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border">
              {/* Dynamically imported or standard import */}
              <BlogIndex />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <article className="bg-brand-surface border border-brand-border rounded-xl overflow-hidden">
              {post.featured_image && (
                <div className="relative h-[400px] overflow-hidden bg-brand-bg border-b border-brand-border">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    style={{ filter: 'saturate(0.9)' }}
                    onError={(e) => {
                      console.error('Image failed to load:', post.featured_image);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
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

              <div className="p-8 md:p-12">
                <div className="flex items-center text-xs font-semibold text-brand-muted uppercase tracking-wide mb-6">
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

                <h1 className="font-brand-serif font-medium text-4xl md:text-5xl leading-tight text-brand-ink mb-10">
                  {post.title}
                </h1>

                {(() => {
                  const { styles, body } = extractStyles(post.body);

                  const processedBody = body
                    .replace(/>\s*\n\s*</g, '><')
                    .replace(/\n{2,}/g, '<br /><br />')
                    .replace(/\n/g, '<br />');

                  return (
                    <>
                      {styles && <style>{styles}</style>}
                      <div className="overflow-x-auto text-base leading-relaxed text-brand-muted">
                        <div
                          className="max-w-none prose prose-lg prose-headings:font-brand-serif prose-headings:font-medium prose-headings:text-brand-ink prose-p:text-brand-muted prose-a:text-brand-accent hover:prose-a:text-brand-ink prose-strong:text-brand-ink prose-table:mt-4 prose-table:mb-4 prose-table:border-collapse prose-table:w-full prose-thead:bg-brand-surface prose-th:text-left prose-th:border prose-th:border-brand-border prose-th:px-4 prose-th:py-2 prose-td:border prose-td:border-brand-border prose-td:px-4 prose-td:py-2 whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: processedBody }}
                        />
                      </div>
                    </>
                  );
                })()}

                {post.allow_comments && (
                  <div className="mt-16 pt-10 border-t border-brand-border">
                    <h3 className="font-brand-serif font-medium text-2xl text-brand-ink mb-4">Comments</h3>
                    <p className="text-brand-muted text-sm">Comments feature coming soon...</p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* Get a Professional Report Section */}
      <section className="bg-brand-ink text-white py-16 md:py-24 border-t border-brand-border">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-3 gap-10 items-center">
            {/* Left Image */}
            <div className="hidden md:block">
              <div className="aspect-square rounded-xl overflow-hidden bg-brand-surface border border-brand-border/30 p-2">
                <div className="w-full h-full rounded-lg overflow-hidden relative">
                  <img
                    src="/images/blk-couple-sq.png"
                    alt="Couple reviewing emigration documents"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ filter: 'saturate(0.9)' }}
                  />
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="text-center">
              <div className="text-xs font-semibold text-brand-accent-2 uppercase tracking-wide mb-4">Professional Report</div>
              <h3 className="font-brand-serif font-medium text-3xl md:text-4xl leading-tight text-white mb-6">
                Ready for the <span className="italic text-brand-accent-2">details?</span>
              </h3>

              <div className="mb-8">
                <div className="inline-flex items-center gap-3 bg-brand-bg/10 border border-brand-border/20 px-5 py-3 rounded-lg">
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-accent-2 bg-brand-accent-2/20 px-2 py-1 rounded">Limited Offer</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-brand-muted line-through">$99.99</span>
                    <span className="text-xl font-brand-serif font-medium text-white">$69.99</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEmailModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-accent-2 text-brand-accent-ink rounded-lg font-semibold text-base hover:brightness-95 transition-all"
              >
                Get Your Report
                <span className="text-lg leading-none">&rarr;</span>
              </button>
            </div>

            {/* Right Image */}
            <div className="hidden md:block">
              <div className="aspect-square rounded-xl overflow-hidden bg-brand-surface border border-brand-border/30 p-2">
                <div className="w-full h-full rounded-lg overflow-hidden relative">
                  <img
                    src="/images/old-couple.png"
                    alt="Couple reviewing emigration report"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    style={{ filter: 'saturate(0.9)' }}
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
