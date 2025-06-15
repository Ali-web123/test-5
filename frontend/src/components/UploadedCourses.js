import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UploadedCourses = ({ userId, showTitle = true }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUploadedCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch courses created by the current user or specific user
        const endpoint = userId 
          ? `/api/courses/created/${userId}`
          : '/api/courses/created';
        
        const headers = userId ? {} : getAuthHeaders();
        
        const response = await fetch(`${BACKEND_URL}${endpoint}`, { 
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        });
        
        if (response.ok) {
          const coursesData = await response.json();
          setCourses(coursesData);
        } else if (response.status === 401) {
          // User not authenticated
          setCourses([]);
        } else {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(err.message);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    if (user || userId) {
      fetchUploadedCourses();
    } else {
      setLoading(false);
      setCourses([]);
    }
  }, [userId, user, getAuthHeaders]);

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
              <button 
                onClick={() => navigate('/upload-course')}
                className="mt-4 glass-button bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30"
              >
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
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold">{course.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  course.published 
                    ? 'bg-green-500/20 text-green-300 border border-green-400'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400'
                }`}>
                  {course.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{course.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{course.duration}</span>
                  <span>{course.views} views</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{course.level}</span>
                  <span className="capitalize">{course.category}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{course.sessions?.length || 0} sessions</span>
                  <span>{course.quiz?.questions?.length || 0} quiz questions</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {course.tags?.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => navigate(`/${course.category}/${course.id}`)}
                  className="flex-1 glass-button bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30 text-sm py-2"
                >
                  View
                </button>
                {!userId && (
                  <>
                    <button className="glass-button bg-gray-500/20 border-gray-400 text-gray-300 hover:bg-gray-500/30 text-sm py-2">
                      Edit
                    </button>
                    {!course.published && (
                      <button className="glass-button bg-green-500/20 border-green-400 text-green-300 hover:bg-green-500/30 text-sm py-2">
                        Publish
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadedCourses;