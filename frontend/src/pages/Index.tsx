import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      navigate(`/dashboard/${userData.role.toLowerCase()}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen academic-pattern flex items-center justify-center p-4">
      <div className="text-center max-w-2xl animate-fade-in-up">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-primary p-6 rounded-3xl shadow-glow animate-pulse-glow">
            <GraduationCap className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-6">
          CampusConnect
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
          A comprehensive Educational Excellence Management System designed for modern institutions.
          <br />
          Empowering Principals, Faculty, Students, and Staff with seamless digital solutions.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/login')}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-4 text-lg rounded-xl shadow-elegant transition-all duration-300 hover:shadow-glow"
          >
            Access Your Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
        </div>
      </div>
    </div>
  );
};

export default Index;
