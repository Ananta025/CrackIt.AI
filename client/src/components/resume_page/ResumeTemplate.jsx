import React from 'react';
import styles from './ResumePreview.module.css';
import resumeTemplates from '../../utils/resumeTemplates';

export default function ResumeTemplate({ data, templateName = 'modern' }) {
  const template = resumeTemplates[templateName] || resumeTemplates.modern;
  
  // Select the appropriate rendering function based on template
  switch(templateName) {
    case 'classic':
      return renderClassicTemplate(data);
    case 'creative':
      return renderCreativeTemplate(data);
    case 'minimal':
      return renderMinimalTemplate(data);
    case 'executive':
      return renderExecutiveTemplate(data);
    case 'modern':
    default:
      return renderModernTemplate(data);
  }
}

function renderModernTemplate(data) {
  // Helper function to safely get summary text
  const getSummaryText = (summary) => {
    if (typeof summary === 'string') {
      return summary;
    } else if (summary && typeof summary === 'object') {
      // If summary is an object, try to extract text from common properties
      return summary.text || summary.content || summary.value || 
             summary.summary || JSON.stringify(summary);
    }
    return '';
  };
  
  return (
    <div className={`${styles.templateModern} ${styles.previewContent}`}>
      <div className={styles.modernHeader}>
        <h1 className={styles.modernName}>
          {data.personal?.name || 'Your Name'}
        </h1>
        <div className={styles.modernContact}>
          {data.personal?.email && (
            <span>
              <i className="fa-regular fa-envelope"></i>
              {data.personal.email}
            </span>
          )}
          {data.personal?.phone && (
            <span>
              <i className="fa-solid fa-phone"></i>
              {data.personal.phone}
            </span>
          )}
          {data.personal?.linkedin && (
            <span>
              <i className="fa-brands fa-linkedin"></i>
              {data.personal.linkedin}
            </span>
          )}
          {data.personal?.location && (
            <span>
              <i className="fa-solid fa-location-dot"></i>
              {data.personal.location}
            </span>
          )}
        </div>
      </div>
      
      {data.summary && (
        <div className={styles.modernSummary}>
          {getSummaryText(data.summary)}
        </div>
      )}
      
      {data.experience && data.experience.length > 0 && (
        <div className={styles.modernSection}>
          <h2 className={styles.modernSectionTitle}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.modernExperience}>
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {exp.company || 'Company Name'}
                </div>
                <div className={styles.modernDate}>
                  {exp.startDate && 
                    `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
                </div>
              </div>
              <div className={styles.modernPosition}>
                {exp.position || 'Position Title'}
              </div>
              {exp.description && (
                <div className={styles.modernDescription}>
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {data.education && data.education.length > 0 && (
        <div className={styles.modernSection}>
          <h2 className={styles.modernSectionTitle}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.modernExperience}>
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {edu.institution || 'Institution Name'}
                </div>
                <div className={styles.modernDate}>
                  {edu.startDate && 
                    `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
                </div>
              </div>
              <div className={styles.modernPosition}>
                {edu.degree} {edu.field ? `in ${edu.field}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {data.skills && data.skills.length > 0 && (
        <div className={styles.modernSection}>
          <h2 className={styles.modernSectionTitle}>Skills</h2>
          <div className={styles.modernSkills}>
            {data.skills.map((skill, index) => (
              <span key={index} className={styles.modernSkill}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.projects && data.projects.length > 0 && (
        <div className={styles.modernSection}>
          <h2 className={styles.modernSectionTitle}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.modernExperience}>
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {project.name || 'Project Name'}
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">
                    <i className="fa-solid fa-link mr-1"></i>
                    View Project
                  </a>
                )}
              </div>
              {project.technologies && (
                <div className={styles.modernPosition}>
                  {project.technologies}
                </div>
              )}
              {project.description && (
                <div className={styles.modernDescription}>
                  {project.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {data.certifications && data.certifications.length > 0 && (
        <div className={styles.modernSection}>
          <h2 className={styles.modernSectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.modernExperience}>
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {cert.name || 'Certification Name'}
                </div>
                <div className={styles.modernDate}>
                  {cert.date || ''}
                </div>
              </div>
              <div className={styles.modernPosition}>
                {cert.issuer || 'Issuing Organization'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderClassicTemplate(data) {
  // Helper function to safely get summary text
  const getSummaryText = (summary) => {
    if (typeof summary === 'string') {
      return summary;
    } else if (summary && typeof summary === 'object') {
      return summary.text || summary.content || summary.value || 
             summary.summary || JSON.stringify(summary);
    }
    return '';
  };
  
  return (
    <div className={`${styles.templateClassic} ${styles.previewContent}`}>
      <div className={styles.classicHeader}>
        <h1 className={styles.classicName}>
          {data.personal?.name || 'Your Name'}
        </h1>
        <div className={styles.classicContact}>
          {data.personal?.email && (
            <span>{data.personal.email}</span>
          )}
          {data.personal?.phone && (
            <span>{data.personal.phone}</span>
          )}
          {data.personal?.linkedin && (
            <span>{data.personal.linkedin}</span>
          )}
          {data.personal?.location && (
            <span>{data.personal.location}</span>
          )}
        </div>
      </div>
      
      {data.summary && (
        <>
          <h2 className={styles.classicSectionTitle}>Professional Summary</h2>
          <div className="mb-4">{getSummaryText(data.summary)}</div>
        </>
      )}
      
      {data.experience && data.experience.length > 0 && (
        <>
          <h2 className={styles.classicSectionTitle}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="font-bold">{exp.position || 'Position Title'}</div>
              <div className="flex justify-between text-sm">
                <span>{exp.company || 'Company Name'}</span>
                <span>
                  {exp.startDate && 
                    `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
                </span>
              </div>
              {exp.description && (
                <div className="text-sm mt-1 whitespace-pre-line">{exp.description}</div>
              )}
            </div>
          ))}
        </>
      )}
      
      {/* Additional sections would follow similar patterns */}
    </div>
  );
}

function renderCreativeTemplate(data) {
  // Helper function to safely get summary text
  const getSummaryText = (summary) => {
    if (typeof summary === 'string') {
      return summary;
    } else if (summary && typeof summary === 'object') {
      return summary.text || summary.content || summary.value || 
             summary.summary || JSON.stringify(summary);
    }
    return '';
  };
  
  return (
    <div className={styles.previewContent}>
      <h1>Creative Template</h1>
      <p>Creative template implementation would go here</p>
      {data.summary && <p>{getSummaryText(data.summary)}</p>}
    </div>
  );
}

function renderMinimalTemplate(data) {
  return (
    <div className={styles.previewContent}>
      <h1>Minimal Template</h1>
      <p>Minimal template implementation would go here</p>
    </div>
  );
}

function renderExecutiveTemplate(data) {
  return (
    <div className={styles.previewContent}>
      <h1>Executive Template</h1>
      <p>Executive template implementation would go here</p>
    </div>
  );
}
