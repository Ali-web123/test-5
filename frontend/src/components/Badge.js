import React from 'react';
import { useNavigate } from 'react-router-dom';

const Badge = ({ badge, onClick, size = 'md', showTitle = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to the course that awarded this badge
      navigate(`/${badge.course_category}/${badge.course_id}`);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-xs';
      case 'lg':
        return 'w-20 h-20 text-sm';
      default:
        return 'w-16 h-16 text-sm';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={handleClick}
        className={`${getSizeClasses()} relative cursor-pointer group transition-all duration-300 hover:scale-110`}
        title={`${badge.badge_name} - ${badge.course_title}`}
      >
        {/* Badge Circle - Uniform blue design */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg border-2 border-white/20">
          <span className="text-white font-bold text-2xl">
            🎖️
          </span>
        </div>
        
        {/* Badge Shine Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Course Title */}
      {showTitle && (
        <div className="mt-2 text-center">
          <p className="text-white text-xs font-medium leading-tight max-w-20 break-words">
            {badge.course_title}
          </p>
        </div>
      )}
    </div>
  );
};

export default Badge;