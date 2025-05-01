import React, { useState } from 'react';
import styles from './ResumeFormStep.module.css';
import resumeService from '../../services/resumeService';

export default function ResumeFormStep({ step, data, onUpdate }) {
  const [aiGenerating, setAiGenerating] = useState({});
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState(null);

  // Handle changes for regular fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (step.isArray) {
      const [fieldId, index, subField] = name.split('-');
      const updatedArray = [...data];

      if (type === 'checkbox') {
        updatedArray[index] = {
          ...updatedArray[index],
          [subField]: checked
        };
      } else {
        updatedArray[index] = {
          ...updatedArray[index],
          [subField]: value
        };
      }

      onUpdate(updatedArray);
    } else if (step.isTagInput) {
      onUpdate(data);
    } else {
      onUpdate({
        ...data,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Add a new item to array fields
  const addArrayItem = () => {
    const emptyItem = {};
    step.fields.forEach(field => {
      emptyItem[field.id] = field.type === 'checkbox' ? false : '';
    });

    onUpdate([...data, emptyItem]);
  };

  // Remove an item from array fields
  const removeArrayItem = (index) => {
    const updatedArray = [...data];
    updatedArray.splice(index, 1);
    onUpdate(updatedArray);
  };

  // Handle AI-generated content
  const handleAiGenerate = async (fieldId, index = null) => {
    const generationKey = index !== null ? `${fieldId}-${index}` : fieldId;
    setAiGenerating(prev => ({ ...prev, [generationKey]: true }));
    setError(null);

    try {
      let userInput = {};

      if (index !== null && fieldId === 'description') {
        // For experience descriptions
        const item = data[index];
        userInput = {
          title: item.position || '',
          company: item.company || '',
          duration: `${item.startDate || ''} to ${item.endDate || 'Present'}`,
        };
      } else if (fieldId === 'skills') {
        // For skills section
        userInput = {
          role: 'Software Developer',
          industry: 'Technology',
          level: 'Mid-level',
          currentSkills: Array.isArray(data) ? data.join(', ') : ''
        };
      } else if (fieldId === 'summary') {
        // For summary section
        userInput = {
          role: 'Professional',
          experience: '5+ years',
          skills: 'relevant skills',
        };
      }

      const response = await resumeService.generateSection(fieldId, userInput);

      if (response.success) {
        let processedData;
        
        // Process the response data based on type
        if (typeof response.data === 'string') {
          processedData = response.data;
        } else if (Array.isArray(response.data)) {
          // For arrays, we could either join them or keep as array depending on the field
          if (fieldId === 'skills') {
            processedData = response.data;
          } else {
            // For description or other array fields, join with newlines
            processedData = response.data.join('\n');
          }
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Convert object to string if needed
          processedData = JSON.stringify(response.data);
        } else {
          processedData = String(response.data || '');
        }
        
        if (index !== null) {
          // For array items (experience entries)
          const updatedArray = [...data];
          updatedArray[index][fieldId] = processedData;
          onUpdate(updatedArray);
        } else if (fieldId === 'skills') {
          // For skills (array of strings)
          let newSkills;
          if (Array.isArray(response.data)) {
            newSkills = response.data;
          } else if (typeof processedData === 'string') {
            newSkills = processedData.split(',').map(s => s.trim());
          } else {
            newSkills = [];
          }
          onUpdate(newSkills.filter(Boolean));
        } else {
          // Make sure we're setting a string for simple fields like summary
          onUpdate({
            ...data,
            [fieldId]: processedData
          });
        }
      } else {
        setError(response.message || 'Failed to generate content');
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setAiGenerating(prev => ({ ...prev, [generationKey]: false }));
    }
  };

  // Handle adding new tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!data.includes(newTag.trim())) {
        onUpdate([...data, newTag.trim()]);
      }
      setNewTag('');
    }
  };

  // Handle removing tag
  const handleRemoveTag = (tagToRemove) => {
    onUpdate(data.filter(tag => tag !== tagToRemove));
  };

  // Render array fields (experience, education, projects, certifications)
  if (step.isArray) {
    return (
      <div className={styles.formStep}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-700"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <i className={step.icon}></i>
          </div>
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        </div>

        <div className={styles.arrayFieldContainer}>
          {data && data.length > 0 ? (
            data.map((item, index) => (
              <div key={index} className={styles.arrayFieldItem}>
                <div className={styles.arrayFieldHeader}>
                  <h3 className={styles.arrayFieldTitle}>
                    {item.position || item.degree || item.name || `${step.title.slice(0, -1)} ${index + 1}`}
                  </h3>
                  <button 
                    type="button" 
                    className={styles.removeButton}
                    onClick={() => removeArrayItem(index)}
                  >
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {step.fields.map((field) => {
                    if (field.hideIf && item[field.hideIf]) return null;

                    return (
                      <div 
                        key={field.id}
                        className={`${styles.fieldGroup} ${field.type === 'textarea' || field.id === 'description' ? 'md:col-span-2' : ''}`}
                      >
                        <label className={styles.fieldLabel}>
                          {field.label}
                          {field.required && <span className={styles.required}>*</span>}
                        </label>

                        {field.type === 'textarea' ? (
                          <div>
                            <textarea
                              name={`${step.id}-${index}-${field.id}`}
                              value={item[field.id] || ''}
                              onChange={handleChange}
                              placeholder={field.placeholder}
                              className={styles.textArea}
                              rows={5}
                            ></textarea>

                            {field.useAI && (
                              <button
                                type="button"
                                className={aiGenerating[`${field.id}-${index}`] ? `${styles.aiSuggestionButton} ${styles.generating}` : styles.aiSuggestionButton}
                                onClick={() => handleAiGenerate(field.id, index)}
                                disabled={aiGenerating[`${field.id}-${index}`]}
                              >
                                {aiGenerating[`${field.id}-${index}`] ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-magic"></i>
                                    Generate with AI
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        ) : field.type === 'checkbox' ? (
                          <div className={styles.checkboxGroup}>
                            <input
                              type="checkbox"
                              id={`${step.id}-${index}-${field.id}`}
                              name={`${step.id}-${index}-${field.id}`}
                              checked={item[field.id] || false}
                              onChange={handleChange}
                              className={styles.checkboxInput}
                            />
                            <label 
                              htmlFor={`${step.id}-${index}-${field.id}`}
                              className={styles.checkboxLabel}
                            >
                              {field.label}
                            </label>
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            name={`${step.id}-${index}-${field.id}`}
                            value={item[field.id] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required={field.required}
                            className={styles.fieldInput}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 my-4">No {step.title.toLowerCase()} added yet</p>
          )}

          <button
            type="button"
            className={styles.addButton}
            onClick={addArrayItem}
          >
            <i className="fa-solid fa-plus"></i>
            Add {step.title.slice(0, -1)}
          </button>
        </div>
      </div>
    );
  }

  // Render tag input (for skills)
  if (step.isTagInput) {
    return (
      <div className={styles.formStep}>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right text-red-700"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        )}
        <div className={styles.stepHeader}>
          <div className={styles.stepIcon}>
            <i className={step.icon}></i>
          </div>
          <div className={styles.stepContent}>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepDescription}>{step.description}</p>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            {step.fields[0].label}
          </label>

          <div className={styles.tagInput}>
            {Array.isArray(data) && data.map((tag, index) => (
              <div key={index} className={styles.tag}>
                <span>{tag}</span>
                <span 
                  className={styles.tagRemove}
                  onClick={() => handleRemoveTag(tag)}
                >
                  <i className="fa-solid fa-times"></i>
                </span>
              </div>
            ))}

            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={step.fields[0].placeholder}
              className={styles.tagInputField}
            />
          </div>

          <p className={styles.inputHelper}>Press Enter to add a skill</p>

          <button
            type="button"
            className={aiGenerating['skills'] ? `${styles.aiSuggestionButton} ${styles.generating}` : styles.aiSuggestionButton}
            onClick={() => handleAiGenerate('skills')}
            disabled={aiGenerating['skills']}
          >
            {aiGenerating['skills'] ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                Suggesting skills...
              </>
            ) : (
              <>
                <i className="fa-solid fa-magic"></i>
                Suggest skills with AI
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Render regular fields (personal, summary)
  return (
    <div className={styles.formStep}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <i className="fa-solid fa-circle-exclamation mr-2"></i>
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-700"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
      )}
      <div className={styles.stepHeader}>
        <div className={styles.stepIcon}>
          <i className={step.icon}></i>
        </div>
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>{step.title}</h2>
          <p className={styles.stepDescription}>{step.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {step.fields.map((field) => (
          <div 
            key={field.id}
            className={`${styles.fieldGroup} ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}
          >
            <label className={styles.fieldLabel}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>

            {field.type === 'textarea' ? (
              <div>
                <textarea
                  name={field.id}
                  value={data[field.id] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={styles.textArea}
                  required={field.required}
                  rows={5}
                ></textarea>

                {field.useAI && (
                  <button
                    type="button"
                    className={aiGenerating[field.id] ? `${styles.aiSuggestionButton} ${styles.generating}` : styles.aiSuggestionButton}
                    onClick={() => handleAiGenerate(field.id)}
                    disabled={aiGenerating[field.id]}
                  >
                    {aiGenerating[field.id] ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-magic"></i>
                        Generate with AI
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <input
                type={field.type}
                name={field.id}
                value={data[field.id] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className={styles.fieldInput}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
