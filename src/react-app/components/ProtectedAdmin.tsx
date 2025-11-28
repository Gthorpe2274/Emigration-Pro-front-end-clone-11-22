import { Navigate } from 'react-router-dom';
import BlogAdmin from '../pages/BlogAdmin';

export default function ProtectedAdmin() {
    const isAuthenticated = sessionStorage.getItem('blogAdminAuth') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return <BlogAdmin />;
}
