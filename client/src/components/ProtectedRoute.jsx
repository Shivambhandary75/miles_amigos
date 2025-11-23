import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('authToken');
    console.log('ProtectedRoute check - token:', token ? 'exists' : 'missing');

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
