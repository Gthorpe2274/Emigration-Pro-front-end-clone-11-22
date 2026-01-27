
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
        return <div className="p-4 bg-gray-50 rounded-lg animate-pulse">Loading index...</div>;
    }

    if (posts.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 sticky top-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Article Index
            </h3>
            <nav className="space-y-2">
                <ul className="list-none space-y-2">
                    {posts.map(post => (
                        <li key={post.id}>
                            <Link
                                to={`/blog/${post.slug}`}
                                className="block text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
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
