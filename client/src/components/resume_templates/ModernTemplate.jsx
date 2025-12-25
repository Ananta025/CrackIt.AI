import React from 'react';
import styles from '../resume_page/ResumePreview.module.css'; // Adjust path based on your exact structure

const getSummaryText = (summary) => {
  if (typeof summary === 'string') {
    return summary;
  } else if (summary && typeof summary === 'object') {
    return summary.text || summary.content || summary.value ||
           summary.summary || JSON.stringify(summary);
  }
  return '';
};

export default function ModernTemplate({ data }) {
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
                  {/* Assuming description can be an array of strings for bullet points */}
                  {Array.isArray(exp.description) ? (
                    exp.description.map((item, descIndex) => (
                      <div key={descIndex} className={styles.bulletItem}>
                        {item}
                      </div>
                    ))
                  ) : (
                    // Fallback for single string description
                    <div className={styles.bulletItem}>{exp.description}</div>
                  )}
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
            <div key={index} className={styles.modernExperience}> {/* Reusing modernExperience for structure */}
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {edu.institution || 'Institution Name'}
                </div>
                <div className={styles.modernDate}>
                  {edu.startDate &&
                    `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
                </div>
              </div>
              <div className={styles.modernPosition}> {/* Reusing modernPosition for degree/field */}
                {edu.degree} {edu.field ? `in ${edu.field}` : ''}
              </div>
              {edu.description && (
                <div className={styles.modernDescription}> {/* Reusing modernDescription for education description */}
                  <div className={styles.bulletItem}>{edu.description}</div>
                </div>
              )}
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
            <div key={index} className={styles.modernExperience}> {/* Reusing modernExperience for structure */}
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {project.name || 'Project Name'}
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs"> {/* Tailwind class, might want to move to CSS module */}
                    <i className="fa-solid fa-link mr-1"></i>
                    View Project
                  </a>
                )}
              </div>
              {project.technologies && (
                <div className={styles.modernPosition}> {/* Reusing modernPosition for technologies */}
                  {project.technologies}
                </div>
              )}
              {project.description && (
                <div className={styles.modernDescription}> {/* Reusing modernDescription for project description */}
                  <div className={styles.bulletItem}>{project.description}</div>
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
            <div key={index} className={styles.modernExperience}> {/* Reusing modernExperience for structure */}
              <div className={styles.modernCompanyHeader}>
                <div className={styles.modernCompanyName}>
                  {cert.name || 'Certification Name'}
                </div>
                <div className={styles.modernDate}>
                  {cert.date || ''}
                </div>
              </div>
              <div className={styles.modernPosition}> {/* Reusing modernPosition for issuer */}
                {cert.issuer || 'Issuing Organization'}
              </div>
              {cert.description && (
                <div className={styles.modernDescription}> {/* Reusing modernDescription for cert description */}
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