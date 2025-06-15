import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CourseUpload = () => {
  const { getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    category: 'masterclasses',
    tags: [],
    sessions: [
      {
        id: 1,
        title: '',
        duration: '',
        description: '',
        video_url: ''
      }
    ],
    quiz: {
      questions: [
        {
          question: '',
          options: ['', '', '', ''],
          correct: 0
        }
      ]
    }
  });
  
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !courseData.tags.includes(currentTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSessionChange = (index, field, value) => {
    setCourseData(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) =>
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const handleAddSession = () => {
    setCourseData(prev => ({
      ...prev,
      sessions: [
        ...prev.sessions,
        {
          id: prev.sessions.length + 1,
          title: '',
          duration: '',
          description: '',
          video_url: ''
        }
      ]
    }));
  };

  const handleRemoveSession = (index) => {
    if (courseData.sessions.length > 1) {
      setCourseData(prev => ({
        ...prev,
        sessions: prev.sessions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleQuizQuestionChange = (qIndex, field, value) => {
    setCourseData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map((question, i) =>
          i === qIndex ? { ...question, [field]: value } : question
        )
      }
    }));
  };

  const handleQuizOptionChange = (qIndex, oIndex, value) => {
    setCourseData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: prev.quiz.questions.map((question, i) =>
          i === qIndex ? {
            ...question,
            options: question.options.map((option, j) =>
              j === oIndex ? value : option
            )
          } : question
        )
      }
    }));
  };

  const handleAddQuizQuestion = () => {
    setCourseData(prev => ({
      ...prev,
      quiz: {
        ...prev.quiz,
        questions: [
          ...prev.quiz.questions,
          {
            question: '',
            options: ['', '', '', ''],
            correct: 0
          }
        ]
      }
    }));
  };

  const handleRemoveQuizQuestion = (index) => {
    if (courseData.quiz.questions.length > 1) {
      setCourseData(prev => ({
        ...prev,
        quiz: {
          ...prev.quiz,
          questions: prev.quiz.questions.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const validateForm = () => {
    if (!courseData.title.trim()) {
      alert('Course title is required');
      return false;
    }
    if (!courseData.description.trim()) {
      alert('Course description is required');
      return false;
    }
    if (!courseData.duration.trim()) {
      alert('Course duration is required');
      return false;
    }
    if (courseData.sessions.some(session => !session.title.trim() || !session.duration.trim())) {
      alert('All sessions must have a title and duration');
      return false;
    }
    if (courseData.quiz.questions.some(q => !q.question.trim() || q.options.some(o => !o.trim()))) {
      alert('All quiz questions and options must be filled');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        const newCourse = await response.json();
        alert('Course created successfully!');
        navigate('/profile');
      } else {
        const error = await response.json();
        alert(`Failed to create course: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="glass-button inline-flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Back
            </button>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2">Create New Course</h1>
          <p className="text-gray-300">Share your knowledge with the world by creating a comprehensive learning experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="grid gap-6">
              {/* Title */}
              <div>
                <label className="block text-white font-semibold mb-2">Course Title *</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  placeholder="Enter course title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white font-semibold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40 resize-vertical"
                  placeholder="Describe what students will learn in this course"
                  required
                />
              </div>

              {/* Duration and Level */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Total Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseData.duration}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="e.g., 2h 30m"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Difficulty Level *</label>
                  <select
                    name="level"
                    value={courseData.level}
                    onChange={handleInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-white font-semibold mb-2">Category *</label>
                <select
                  name="category"
                  value={courseData.category}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/40"
                >
                  <option value="masterclasses">Masterclasses</option>
                  <option value="careerpaths">Career Paths</option>
                  <option value="crashcourses">Crash Courses</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-white font-semibold mb-2">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="glass-button"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Course Sessions */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Course Sessions</h2>
              <button
                type="button"
                onClick={handleAddSession}
                className="glass-button bg-green-500/20 border-green-400 text-green-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Session
              </button>
            </div>

            <div className="space-y-6">
              {courseData.sessions.map((session, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Session {index + 1}</h3>
                    {courseData.sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Session Title *</label>
                        <input
                          type="text"
                          value={session.title}
                          onChange={(e) => handleSessionChange(index, 'title', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                          placeholder="Session title"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Duration *</label>
                        <input
                          type="text"
                          value={session.duration}
                          onChange={(e) => handleSessionChange(index, 'duration', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                          placeholder="e.g., 25m"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Description</label>
                      <textarea
                        value={session.description}
                        onChange={(e) => handleSessionChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        placeholder="Brief description of what this session covers"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Video URL</label>
                      <input
                        type="url"
                        value={session.video_url}
                        onChange={(e) => handleSessionChange(index, 'video_url', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        placeholder="https://example.com/video"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiz Section */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Course Quiz</h2>
              <button
                type="button"
                onClick={handleAddQuizQuestion}
                className="glass-button bg-purple-500/20 border-purple-400 text-purple-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Add Question
              </button>
            </div>

            <div className="space-y-6">
              {courseData.quiz.questions.map((question, qIndex) => (
                <div key={qIndex} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-white font-semibold">Question {qIndex + 1}</h3>
                    {courseData.quiz.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuizQuestion(qIndex)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white font-medium mb-2">Question *</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuizQuestionChange(qIndex, 'question', e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                        placeholder="Enter your question"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Answer Options *</label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correct === oIndex}
                            onChange={() => handleQuizQuestionChange(qIndex, 'correct', oIndex)}
                            className="text-green-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleQuizOptionChange(qIndex, oIndex, e.target.value)}
                            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                            placeholder={`Option ${oIndex + 1}`}
                            required
                          />
                          <span className="text-gray-400 text-sm w-16">
                            {question.correct === oIndex ? 'Correct' : ''}
                          </span>
                        </div>
                      ))}
                      <p className="text-gray-400 text-sm mt-2">Select the radio button next to the correct answer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="glass-card p-6">
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="glass-button bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 px-8 py-3 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Course...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseUpload;