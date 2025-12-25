import React from 'react';
import styles from '../resume_page/ResumePreview.module.css';  // Adjust path

const getSummaryText = (summary) => {
  if (typeof summary === 'string') {
    return summary;
  } else if (summary && typeof summary === 'object') {
    return summary.text || summary.content || summary.value ||
           summary.summary || JSON.stringify(summary);
  }
  return '';
};

export default function ExecutiveTemplate({ data }) {
  return (
    <div className={`${styles.templateExecutive} ${styles.previewContent}`}>
      <div className={styles.executiveHeader}> {/* New class */}
        <h1 className={styles.executiveName}> {/* New class */}
          {data.personal?.name || 'Your Name'}
        </h1>
        <div className={styles.executiveContact}> {/* New class */}
          {data.personal?.email && (
            <span>Email: {data.personal.email}</span>
          )}
          {data.personal?.phone && (
            <span>Phone: {data.personal.phone}</span>
          )}
          {data.personal?.linkedin && (
            <span>LinkedIn: {data.personal.linkedin}</span>
          )}
          {data.personal?.location && (
            <span>Location: {data.personal.location}</span>
          )}
        </div>
      </div>
      
      {data.summary && (
        <div className={styles.executiveSection}> {/* New class */}
          <h2 className={styles.executiveSectionTitle}>Executive Summary</h2> {/* New class */}
          <p className={styles.executiveSummaryText}>{getSummaryText(data.summary)}</p> {/* New class */}
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className={styles.executiveSection}>
          <h2 className={styles.executiveSectionTitle}>Professional Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.executiveExperienceItem}> {/* New class */}
              <h3 className={styles.executiveJobTitle}>{exp.position || 'Position'} at {exp.company || 'Company'}</h3> {/* New classes */}
              <p className={styles.executiveDate}>
                {exp.startDate && `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
              </p>
              {exp.description && <p className={styles.executiveDescription}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className={styles.executiveSection}>
          <h2 className={styles.executiveSectionTitle}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.executiveEducationItem}> {/* New class */}
              <h3 className={styles.executiveDegree}>{edu.degree} {edu.field ? `in ${edu.field}` : ''} from {edu.institution || 'Institution'}</h3> {/* New classes */}
              <p className={styles.executiveDate}>
                {edu.startDate && `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
              </p>
              {edu.description && <p className={styles.executiveDescription}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className={styles.executiveSection}>
          <h2 className={styles.executiveSectionTitle}>Key Skills</h2>
          <p className={styles.executiveSkillsList}>{data.skills.join(' | ')}</p> {/* New class */}
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div className={styles.executiveSection}>
          <h2 className={styles.executiveSectionTitle}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.executiveProjectItem}> {/* New class */}
              <h3 className={styles.executiveProjectName}>{project.name || 'Project Name'}</h3> {/* New class */}
              {project.technologies && <p className={styles.executiveProjectTech}>Technologies: {project.technologies}</p>} {/* New class */}
              {project.description && <p className={styles.executiveDescription}>{project.description}</p>}
              {project.url && <p><a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.executiveProjectLink}>View Project</a></p>} {/* New class */}
            </div>
          ))}
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className={styles.executiveSection}>
          <h2 className={styles.executiveSectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.executiveCertificationItem}> {/* New class */}
              <h3 className={styles.executiveCertName}>{cert.name || 'Certification'} ({cert.issuer || 'Issuer'})</h3> {/* New classes */}
              <p className={styles.executiveDate}>{cert.date || ''}</p>
              {cert.description && <p className={styles.executiveDescription}>{cert.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}