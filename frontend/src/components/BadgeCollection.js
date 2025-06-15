import React, { useState, useEffect } from 'react';
import Badge from './Badge';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BadgeCollection = ({ userId, showTitle = true, maxDisplay = null }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders } = useAuth();

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        
        // Determine which endpoint to use
        const endpoint = userId 
          ? `${BACKEND_URL}/api/badges/user/${userId}`
          : `${BACKEND_URL}/api/badges/me`;
        
        const headers = userId ? {} : getAuthHeaders();
        
        const response = await fetch(endpoint, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch badges');
        }
        
        const badgeData = await response.json();
        setBadges(badgeData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, [userId, user]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-300 mt-2">Loading badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400">Error loading badges: {error}</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="glass-card inline-block p-6">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <h3 className="text-white text-lg font-semibold mb-2">No Badges Yet</h3>
          <p className="text-gray-300 text-sm">
            {userId ? 'This user hasn\'t earned any badges yet.' : 'Complete courses to earn your first badge!'}
          </p>
        </div>
      </div>
    );
  }

  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {userId ? 'Skill Badges' : 'Your Badges'}
          </h3>
          <p className="text-gray-400 text-sm">
            Total Badges Earned: {badges.length}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
        {displayBadges.map((badge) => (
          <Badge
            key={badge.id}
            badge={badge}
            size="md"
            showTitle={true}
          />
        ))}
      </div>

      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Showing {maxDisplay} of {badges.length} badges
          </p>
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;