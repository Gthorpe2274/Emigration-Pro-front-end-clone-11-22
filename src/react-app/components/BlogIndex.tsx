import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface BlogIndexItem {
    id: number;
    title: string;
    slug: string;
}

export default function BlogIndex() {
    const [posts, setPosts] = useState<BlogIndexItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/blog/posts');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setPosts(data.posts);
                }
            }
        } catch (error) {
            console.error('Error fetching blog index:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-4 bg-brand-bg rounded-lg animate-pulse text-brand-muted text-sm font-medium">Loading index...</div>;
    }

    if (posts.length === 0) return null;

    return (
        <div className="mb-8 sticky top-4 font-brand-sans">
            <h3 className="font-brand-serif text-xl font-medium text-brand-ink mb-4 pb-2 border-b border-brand-border">
                Article Index
            </h3>
            <nav className="space-y-2">
                <ul className="list-none space-y-2">
                    {posts.map(post => (
                        <li key={post.id}>
                            <Link
                                to={`/blog/${post.slug}`}
                                className="block text-brand-muted hover:text-brand-ink hover:bg-brand-bg px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                {post.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
