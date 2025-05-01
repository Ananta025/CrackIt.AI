import React from 'react';
import styles from './TemplateSelector.module.css';
import resumeTemplates from '../../utils/resumeTemplates';

export default function TemplateSelector({ activeTemplate, setActiveTemplate }) {
  return (
    <div className={styles.templateGrid}>
      {Object.values(resumeTemplates).map((template) => (
        <div 
          key={template.id}
          className={`${styles.templateCard} ${activeTemplate === template.id ? styles.activeTemplate : ''}`}
          onClick={() => setActiveTemplate(template.id)}
        >
          <div className={styles.templatePreview}>
            {/* In a real implementation, you would use actual template thumbnails */}
            <div 
              className={styles.templateImage}
              style={{ 
                backgroundColor: 'white',
                backgroundImage: template.id === 'modern' 
                  ? 'linear-gradient(to bottom, #2563eb 100px, white 100px)'
                  : template.id === 'creative'
                  ? 'linear-gradient(135deg, #8b5cf6 100px, white 100px)'
                  : 'none',
                padding: '1rem'
              }}
            >
              <div style={{ 
                borderTop: template.id === 'classic' ? `2px solid ${template.primaryColor}` : 'none',
                borderLeft: template.id === 'minimal' ? `4px solid ${template.primaryColor}` : 'none',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  height: '15%', 
                  borderBottom: '1px solid rgba(0,0,0,0.1)'
                }}></div>
                <div style={{ display: 'flex', height: '85%' }}>
                  <div style={{ 
                    width: template.id === 'executive' ? '30%' : '100%', 
                    padding: '0.5rem',
                    backgroundColor: template.id === 'executive' ? '#f8f9fa' : 'transparent'
                  }}>
                    <div style={{ 
                      width: '100%', 
                      height: '5px', 
                      backgroundColor: template.primaryColor,
                      marginBottom: '0.5rem'
                    }}></div>
                    
                    {/* Content lines */}
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ 
                        width: '100%', 
                        height: '2px', 
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        marginBottom: '0.25rem'
                      }}></div>
                    ))}
                  </div>
                  {template.id === 'executive' && (
                    <div style={{ width: '70%', padding: '0.5rem' }}>
                      {[...Array(8)].map((_, i) => (
                        <div key={i} style={{ 
                          width: '100%', 
                          height: '2px', 
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          marginBottom: '0.25rem'
                        }}></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.templateInfo}>
            <h3 className={styles.templateName}>{template.name}</h3>
            <p className={styles.templateDescription}>{template.description}</p>
          </div>
          
          <div className={styles.checkIcon}>
            <i className="fa-solid fa-check"></i>
          </div>
        </div>
      ))}
    </div>
  );
}
