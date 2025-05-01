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
  const [currentStep, setCurrentStep] = useState(1)

  // Job roles for the dropdown
  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI/UX Designer',
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

  // Navigation between steps
  const nextStep = () => {
    if (settings.role) {
      setCurrentStep(2)
    }
  }

  const prevStep = () => {
    setCurrentStep(1)
  }

  return (
    <div className={styles.container}>
      {/* Main panel - Interview Setup Form */}
      <div className={styles.mainPanel}>
        <div className={styles.stepIndicator}>
          <div className={`${styles.stepDot} ${currentStep >= 1 ? styles.activeStep : ''}`}>1</div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.stepDot} ${currentStep >= 2 ? styles.activeStep : ''}`}>2</div>
        </div>
        
        <h1 className={styles.title}>Mock Interview Setup</h1>
        
        <p className={styles.subtitle}>
          {currentStep === 1 ? 'Select your role and difficulty' : 'Customize your interview'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            // Step 1: Role and Difficulty
            <>
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
                <div className="grid grid-cols-3 gap-2">
                  {['easy', 'medium', 'hard'].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-xs ${
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
              
              {/* Next Button */}
              <button
                type="button"
                disabled={!settings.role}
                onClick={nextStep}
                className={settings.role ? styles.activeStepButton : styles.inactiveStepButton}
              >
                <span>Next</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              
              {!settings.role && (
                <p className="text-red-400 text-center text-xs mt-1">
                  Please select a role to continue
                </p>
              )}
            </>
          ) : (
            // Step 2: Duration and Focus Areas
            <>
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
                    className="ml-2 bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
                
                {settings.focus && settings.focus.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {settings.focus.map((area, index) => (
                      <span 
                        key={index} 
                        className="bg-blue-900 bg-opacity-30 text-blue-400 px-2 py-0.5 rounded-md text-xs flex items-center"
                      >
                        {area}
                        <button 
                          type="button" 
                          onClick={() => removeFocusArea(index)} 
                          className="ml-1.5 text-blue-300 hover:text-blue-100"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.buttonGroup}>
                {/* Back Button */}
                <button
                  type="button"
                  onClick={prevStep}
                  className={styles.backButton}
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  <span>Back</span>
                </button>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={isLoading ? styles.loadingButton : styles.activeSubmitButton}
                >
                  {isLoading ? (
                    <><i className="fa-solid fa-spinner fa-spin"></i><span>Starting...</span></>
                  ) : (
                    <><i className="fa-solid fa-play"></i><span>Start</span></>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
      
      {/* Side panel - Info */}
      <div className="space-y-6">
        {/* Setup info card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-blue-900">
          <h3 className="text-blue-400 font-medium mb-3">Interview Settings</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Role:</span>
              <span className="text-white font-medium">{settings.role || 'Not selected'}</span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Difficulty:</span>
              <span className={`font-medium capitalize ${
                settings.difficulty === 'easy' ? 'text-green-400' :
                settings.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {settings.difficulty}
              </span>
            </div>
            
            <div className="flex justify-between items-center pb-2 border-b border-gray-700">
              <span className="text-gray-300">Duration:</span>
              <span className="text-white font-medium">
                {settings.duration === 'short' ? 'Short (~5 mins)' : 
                 settings.duration === 'medium' ? 'Medium (~10 mins)' : 'Long (~20 mins)'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Tips card */}
        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md rounded-xl shadow-lg p-5 border border-yellow-900">
          <div className="flex items-center mb-3">
            <h3 className="text-yellow-400 font-medium flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb"></i>
              <span>Interview Tips</span>
            </h3>
          </div>
          
          <div className="text-gray-300 text-sm space-y-2">
            <p>• Select a role that matches your career goals</p>
            <p>• Choose difficulty based on your experience level</p>
            <p>• Add focus areas to customize your questions</p>
            <p>• Prepare a quiet space before starting</p>
          </div>
        </div>
      </div>
    </div>
  )
}
