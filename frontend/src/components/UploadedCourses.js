import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UploadedCourses = ({ userId, showTitle = true }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders } = useAuth();

  useEffect(() => {
    // For now, we'll show a placeholder since course creation isn't implemented yet
    // In a real implementation, this would fetch courses created by the user
    const fetchUploadedCourses = async () => {
      try {
        setLoading(true);
        // Placeholder - would typically be an API call like:
        // const response = await fetch(`${BACKEND_URL}/api/courses/created`, { headers: getAuthHeaders() });
        
        // Simulating an empty response for now
        setCourses([]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUploadedCourses();
  }, [userId, user]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="text-gray-300 mt-2">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400">Error loading courses: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-2">
            {userId ? 'Courses Created' : 'My Courses'}
          </h3>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <div className="glass-card inline-block p-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">No Courses Created</h3>
            <p className="text-gray-300 text-sm">
              {userId ? 'This user hasn\'t created any courses yet.' : 'You haven\'t created any courses yet.'}
            </p>
            {!userId && (
              <button className="mt-4 glass-button bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Create Your First Course
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="glass-card p-6 hover:bg-white/10 transition-all duration-300">
              <h4 className="text-white font-semibold mb-2">{course.title}</h4>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{course.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{course.duration}</span>
                <span>{course.students} students</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedCourses;