
import { Navigate } from "react-router-dom";
import AuthPage from "../components/AuthPage";
import { useAuth } from "../context/AuthContext";

const Index = () => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/order" replace />;
  }

  return <AuthPage />;
};

export default Index;
