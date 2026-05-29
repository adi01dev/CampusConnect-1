import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
  ];

  pathnames.forEach((pathname, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = pathname
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbItems.push({ label, href });
  });

  return (
    <motion.nav 
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <motion.div 
            key={item.href || item.label}
            className="flex items-center"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
            )}
            {index === 0 && <Home className="w-4 h-4 mr-2" />}
            {isLast ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link 
                to={item.href!} 
                className="hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </motion.div>
        );
      })}
    </motion.nav>
  );
};