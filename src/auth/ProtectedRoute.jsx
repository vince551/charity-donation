import {Navigate,useLocation} from 'react-router-dom';
import {useAuth} from './AuthContext';
export default function ProtectedRoute({children,roles}){const {user,loading}=useAuth();const location=useLocation();if(loading)return <div className="route-loading">Loading KVD…</div>;if(!user)return <Navigate to="/login" state={{from:location}} replace/>;if(roles&&!roles.includes(user.role))return <Navigate to="/dashboard" replace/>;return children}
