import React from 'react';
import styles from '../resume_page/ResumePreview.module.css'; // Adjust path

const getSummaryText = (summary) => {
  if (typeof summary === 'string') {
    return summary;
  } else if (summary && typeof summary === 'object') {
    return summary.text || summary.content || summary.value ||
           summary.summary || JSON.stringify(summary);
  }
  return '';
};

export default function ClassicTemplate({ data }) {
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
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Professional Summary</h2>
          <div className={styles.classicDescription}>{getSummaryText(data.summary)}</div> {/* Reusing classicDescription for summary */}
        </div>
      )}
      
      {data.experience && data.experience.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.classicExperience}>
              <div className={styles.classicCompanyHeader}>
                <div className="font-bold">{exp.position || 'Position Title'}</div> {/* No specific style in CSS for this, keeping inline */}
                <div className="text-sm">{exp.company || 'Company Name'}</div> {/* No specific style in CSS for this, keeping inline */}
                <div className="text-sm"> {/* No specific style in CSS for this, keeping inline */}
                  {exp.startDate &&
                    `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
                </div>
              </div>
              {exp.description && (
                <div className={styles.classicDescription}>
                  {Array.isArray(exp.description) ? (
                    exp.description.map((item, descIndex) => (
                      <div key={descIndex} className={styles.bulletItem}>
                        {item}
                      </div>
                    ))
                  ) : (
                    <div className={styles.bulletItem}>{exp.description}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {data.education && data.education.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.classicExperience}> {/* Reusing classicExperience for structure */}
              <div className={styles.classicCompanyHeader}>
                <div className="font-bold">{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                <div className="text-sm">{edu.institution || 'Institution Name'}</div>
                <div className="text-sm">
                  {edu.startDate &&
                    `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
                </div>
              </div>
              {edu.description && (
                <div className={styles.classicDescription}>
                  <div className={styles.bulletItem}>{edu.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Skills</h2>
          <div className={styles.classicSkills}>
            {data.skills.map((skill, index) => (
              <span key={index} className={styles.skillItem}> {/* Reusing skillItem, consider specific classicSkill if needed */}
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.classicExperience}> {/* Reusing classicExperience for structure */}
              <div className={styles.classicCompanyHeader}>
                <div className="font-bold">{project.name || 'Project Name'}</div>
                {project.technologies && <div className="text-sm">{project.technologies}</div>}
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs">
                    <i className="fa-solid fa-link mr-1"></i>
                    View Project
                  </a>
                )}
              </div>
              {project.description && (
                <div className={styles.classicDescription}>
                  <div className={styles.bulletItem}>{project.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className={styles.classicSection}>
          <h2 className={styles.classicSectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.classicExperience}> {/* Reusing classicExperience for structure */}
              <div className={styles.classicCompanyHeader}>
                <div className="font-bold">{cert.name || 'Certification Name'}</div>
                <div className="text-sm">
                  {cert.issuer || 'Issuing Organization'} - {cert.date || ''}
                </div>
              </div>
              {cert.description && (
                <div className={styles.classicDescription}>
                  <div className={styles.bulletItem}>{cert.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}