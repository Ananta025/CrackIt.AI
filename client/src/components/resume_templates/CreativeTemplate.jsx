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

export default function CreativeTemplate({ data }) {
  return (
    <div className={`${styles.templateCreative} ${styles.previewContent}`}>
      <div className={styles.creativeHeader}>
        <h1 className={styles.creativeName}>
          {data.personal?.name || 'Your Name'}
        </h1>
        <div className={styles.creativeContact}>
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
        <div className={styles.creativeSection}> {/* Assuming creativeSection exists or is generic */}
          <h2 className={styles.creativeSectionTitle}>Professional Summary</h2>
          <div className={styles.creativeDescription}>{getSummaryText(data.summary)}</div>
        </div>
      )}
      
      {data.experience && data.experience.length > 0 && (
        <div className={styles.creativeSection}>
          <h2 className={styles.creativeSectionTitle}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className={styles.creativeExperienceItem}> {/* New class for creative experience item */}
              <div className={styles.creativeJobHeader}> {/* New class for creative job header */}
                <div className={styles.creativeJobTitle}>{exp.position || 'Position Title'}</div>
                <div className={styles.creativeJobCompany}>{exp.company || 'Company Name'}</div>
                <div className={styles.creativeJobDuration}>
                  {exp.startDate &&
                    `${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : exp.current ? ' - Present' : ''}`}
                </div>
              </div>
              {exp.description && (
                <div className={styles.creativeDescription}> {/* New class for creative description */}
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
        <div className={styles.creativeSection}>
          <h2 className={styles.creativeSectionTitle}>Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className={styles.creativeEducationItem}> {/* New class */}
              <div className={styles.creativeEducationHeader}> {/* New class */}
                <div className={styles.creativeDegree}>{edu.degree} {edu.field ? `in ${edu.field}` : ''}</div>
                <div className={styles.creativeInstitution}>{edu.institution || 'Institution Name'}</div>
                <div className={styles.creativeEducationDuration}>
                  {edu.startDate &&
                    `${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}`}
                </div>
              </div>
              {edu.description && (
                <div className={styles.creativeDescription}>
                  <div className={styles.bulletItem}>{edu.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div className={styles.creativeSection}>
          <h2 className={styles.creativeSectionTitle}>Skills</h2>
          <div className={styles.creativeSkillsList}> {/* New class */}
            {data.skills.map((skill, index) => (
              <span key={index} className={styles.creativeSkillItem}> {/* New class */}
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.projects && data.projects.length > 0 && (
        <div className={styles.creativeSection}>
          <h2 className={styles.creativeSectionTitle}>Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className={styles.creativeProjectItem}> {/* New class */}
              <div className={styles.creativeProjectHeader}> {/* New class */}
                <div className={styles.creativeProjectName}>{project.name || 'Project Name'}</div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className={styles.creativeProjectLink}> {/* New class */}
                    View Project
                  </a>
                )}
              </div>
              {project.technologies && <div className={styles.creativeProjectTechnologies}>{project.technologies}</div>}
              {project.description && (
                <div className={styles.creativeDescription}>
                  <div className={styles.bulletItem}>{project.description}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div className={styles.creativeSection}>
          <h2 className={styles.creativeSectionTitle}>Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className={styles.creativeCertificationItem}> {/* New class */}
              <div className={styles.creativeCertificationName}>{cert.name || 'Certification Name'}</div>
              <div className={styles.creativeCertificationDetails}>
                {cert.issuer || 'Issuing Organization'} - {cert.date || ''}
              </div>
              {cert.description && (
                <div className={styles.creativeDescription}>
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