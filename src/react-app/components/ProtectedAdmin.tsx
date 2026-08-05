import { Navigate } from 'react-router-dom';
import BlogAdmin from '../pages/BlogAdmin';

export default function ProtectedAdmin() {
    const isAuthenticated = Boolean(sessionStorage.getItem('blogAdminToken'));
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    return <BlogAdmin />;
}
