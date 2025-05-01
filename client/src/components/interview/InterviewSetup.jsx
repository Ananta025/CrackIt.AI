import React, { useState } from 'react'
import styles from './InterviewSetup.module.css'

export default function InterviewSetup({ startInterview, initialSettings, isLoading }) {
  const [settings, setSettings] = useState(initialSettings || {
    role: '',
    difficulty: 'medium',
    duration: 'medium',
    focus: []
  })
  const [focusInput, setFocusInput] = useState('')

  // Job roles for the dropdown
  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'QA Engineer',
    'Machine Learning Engineer',
    'Mobile Developer'
  ]
  
  // Interview durations
  const durations = [
    { id: 'short', label: 'Short (~5 mins, 3 questions)' },
    { id: 'medium', label: 'Medium (~10 mins, 5 questions)' },
    { id: 'long', label: 'Long (~20 mins, 10 questions)' }
  ]

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Add a focus area
  const addFocusArea = () => {
    if (!focusInput.trim()) return
    
    setSettings(prev => ({
      ...prev,
      focus: [...(prev.focus || []), focusInput.trim()]
    }))
    setFocusInput('')
  }

  // Remove a focus area
  const removeFocusArea = (index) => {
    setSettings(prev => ({
      ...prev,
      focus: prev.focus.filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    startInterview(settings)
  }

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <i className="fa-solid fa-briefcase text-white text-xl"></i>
      </div>
      
      <h1 className={styles.title}>Mock Interview Setup</h1>
      
      <p className={styles.subtitle}>
        Customize your interview settings to practice for your next job opportunity
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <i className="fa-solid fa-briefcase text-blue-400"></i>
            Interview Role
          </label>
          <div className="relative">
            <select 
              name="role" 
              value={settings.role} 
              onChange={handleChange}
              required
              className={styles.select}
            >
              <option value="">Select a role...</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <div className={styles.selectIcon}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Difficulty Level */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <i className="fa-solid fa-rocket text-blue-400"></i>
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map(level => (
              <button
                key={level}
                type="button"
                className={`flex flex-col items-center justify-center p-2 rounded-lg border ${
                  settings.difficulty === level 
                    ? level === 'easy' 
                      ? 'bg-green-900 bg-opacity-30 border-green-500 text-green-400' 
                      : level === 'medium'
                        ? 'bg-yellow-900 bg-opacity-30 border-yellow-500 text-yellow-400'
                        : 'bg-red-900 bg-opacity-30 border-red-500 text-red-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                } transition-colors`}
                onClick={() => setSettings(prev => ({ ...prev, difficulty: level }))}
              >
                <span className="capitalize font-medium">{level}</span>
                <span className="text-xs opacity-80">
                  {level === 'easy' ? 'Entry' : level === 'medium' ? 'Mid' : 'Senior'}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Interview Duration */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <i className="fa-solid fa-clock text-blue-400"></i>
            Interview Length
          </label>
          <div className="relative">
            <select 
              name="duration" 
              value={settings.duration} 
              onChange={handleChange}
              className={styles.select}
            >
              {durations.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
            <div className={styles.selectIcon}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Focus Areas */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <i className="fa-solid fa-target text-blue-400"></i>
            Focus Areas (Optional)
          </label>
          <div className="flex items-center">
            <input
              type="text"
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder="Add specific topics..."
              className={styles.input}
            />
            <button 
              type="button" 
              onClick={addFocusArea} 
              className="ml-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          
          {settings.focus && settings.focus.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {settings.focus.map((area, index) => (
                <span 
                  key={index} 
                  className="bg-blue-900 bg-opacity-30 text-blue-400 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {area}
                  <button 
                    type="button" 
                    onClick={() => removeFocusArea(index)} 
                    className="ml-2 text-blue-300 hover:text-blue-100"
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!settings.role || isLoading}
          className={
            isLoading ? styles.loadingButton :
            settings.role ? styles.activeSubmitButton : styles.inactiveSubmitButton
          }
        >
          {isLoading ? (
            <><i className="fa-solid fa-spinner fa-spin"></i><span>Starting...</span></>
          ) : (
            <><i className="fa-solid fa-play"></i><span>Start Interview</span></>
          )}
        </button>
        
        {!settings.role && !isLoading && (
          <p className="text-red-400 text-center text-sm mt-1">
            Please select a role to continue
          </p>
        )}
        
        {/* Simplified Info Card */}
        <div className="bg-gray-900 bg-opacity-50 border border-gray-800 rounded-lg p-3 mt-4 text-sm">
          <h3 className="text-blue-400 font-medium mb-1">What to expect</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
              <span>Role-specific technical and behavioral questions</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
              <span>AI-powered instant feedback on responses</span>
            </li>
          </ul>
        </div>
      </form>
    </div>
  )
}
