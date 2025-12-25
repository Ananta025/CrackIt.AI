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

export default function MinimalTemplate({ data }) {
  return (
    <div className={`${styles.templateMinimal} ${styles.previewContent}`}>
      <div className={styles.minimalHeader}> {/* New class */}
        <h1 className={styles.minimalName}> {/* New class */}
          {data.personal?.name || 'Your Name'}
        </h1>
        <div className={styles.minimalContact}> {/* New class */}
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
        <div className={styles.minimalSection}> {/* New class */}
          <h2 className={styles.minimalSectionTitle}>Summary</h2> {/* New class */}
          <p className={styles.minimalDescription}>{getSummaryText(data.summary)}</p> {/* New class */}
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
        <div className={styles.minimalSection}>
          <h2 className={styles.minimalSectionTitle}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.minimalExperienceItem}> {/* New class */}
              <h3 className={styles.minimalJobTitle}>{exp.position || 'Position'} at {exp.company || 'Company'}</h3> {/* New classes */}
              <p className={styles.minimalDate}>
                {exp.startDate && `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
              </p>
              {exp.description && <p className={styles.minimalDescription}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.education && data.education.length > 0 && (
        <div className={styles.minimalSection}>
          <h2 className={styles.minimalSectionTitle}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.minimalEducationItem}> {/* New class */}
              <h3 className={styles.minimalDegree}>{edu.degree} {edu.field ? `in ${edu.field}` : ''} from {edu.institution || 'Institution'}</h3> {/* New classes */}
              <p className={styles.minimalDate}>
                {edu.startDate && `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
              </p>
              {edu.description && <p className={styles.minimalDescription}>{edu.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className={styles.minimalSection}>
          <h2 className={styles.minimalSectionTitle}>Skills</h2>
          <p className={styles.minimalSkillsList}>{data.skills.join(', ')}</p> {/* New class */}
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div className={styles.minimalSection}>
          <h2 className={styles.minimalSectionTitle}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.minimalProjectItem}> {/* New class */}
              <h3 className={styles.minimalProjectName}>{project.name || 'Project Name'}</h3> {/* New class */}
              {project.technologies && <p className={styles.minimalProjectTech}>Technologies: {project.technologies}</p>} {/* New class */}
              {project.description && <p className={styles.minimalDescription}>{project.description}</p>}
              {project.url && <p><a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.minimalProjectLink}>View Project</a></p>} {/* New class */}
            </div>
          ))}
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className={styles.minimalSection}>
          <h2 className={styles.minimalSectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.minimalCertificationItem}> {/* New class */}
              <h3 className={styles.minimalCertName}>{cert.name || 'Certification'} by {cert.issuer || 'Issuer'}</h3> {/* New classes */}
              <p className={styles.minimalDate}>{cert.date || ''}</p>
              {cert.description && <p className={styles.minimalDescription}>{cert.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}