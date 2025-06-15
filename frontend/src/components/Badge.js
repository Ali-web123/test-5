import React from 'react';
import { useNavigate } from 'react-router-dom';

const Badge = ({ badge, onClick, size = 'md' }) => {
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

  const getBadgeColor = () => {
    if (badge.quiz_score >= 90) return 'from-yellow-400 to-yellow-600'; // Gold
    if (badge.quiz_score >= 80) return 'from-gray-300 to-gray-500'; // Silver
    if (badge.quiz_score >= 70) return 'from-amber-600 to-amber-800'; // Bronze
    return 'from-blue-400 to-blue-600'; // Default blue
  };

  const getBadgeIcon = () => {
    if (badge.quiz_score >= 90) return '🏆'; // Trophy for gold
    if (badge.quiz_score >= 80) return '🥈'; // Silver medal
    if (badge.quiz_score >= 70) return '🥉'; // Bronze medal
    return '🎖️'; // Default medal
  };

  return (
    <div
      onClick={handleClick}
      className={`${getSizeClasses()} relative cursor-pointer group transition-all duration-300 hover:scale-110`}
      title={`${badge.badge_name} - ${badge.course_title} (${badge.quiz_score}%)`}
    >
      {/* Badge Circle */}
      <div className={`w-full h-full rounded-full bg-gradient-to-br ${getBadgeColor()} flex items-center justify-center shadow-lg border-2 border-white/20`}>
        <span className="text-white font-bold">
          {getBadgeIcon()}
        </span>
      </div>
      
      {/* Badge Shine Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Score Badge */}
      <div className="absolute -top-1 -right-1 bg-white text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-gray-200">
        {badge.quiz_score}
      </div>
    </div>
  );
};

export default Badge;