import React from 'react';
import styles from './ResumePreview.module.css';
import ResumeTemplate from './ResumeTemplate';

export default function ResumePreview({ data, template }) {
  // Prepare data with defaults for missing fields to ensure structure is maintained
  const resumeData = {
    personal: {
      name: data?.personal?.name || 'Your Name',
      email: data?.personal?.email || 'email@example.com',
      phone: data?.personal?.phone || '(123) 456-7890',
      linkedin: data?.personal?.linkedin || 'linkedin.com/in/yourprofile',
      location: data?.personal?.location || 'City, State'
    },
    summary: data?.summary || 'Professional summary will appear here. Add your career highlights, key skills, and professional objectives.',
    experience: data?.experience?.length > 0 ? data.experience : [
      {
        company: 'Company Name',
        position: 'Your Position',
        startDate: 'Start Date',
        endDate: 'End Date',
        description: 'Your responsibilities and achievements will appear here.'
      }
    ],
    education: data?.education?.length > 0 ? data.education : [
      {
        institution: 'University/Institution Name',
        degree: 'Degree',
        field: 'Field of Study',
        startDate: 'Start Date',
        endDate: 'End Date'
      }
    ],
    skills: data?.skills?.length > 0 ? data.skills : ['Skill 1', 'Skill 2', 'Skill 3'],
    projects: data?.projects?.length > 0 ? data.projects : [
      {
        name: 'Project Name',
        technologies: 'Technologies Used',
        description: 'Project description will appear here.'
      }
    ],
    certifications: data?.certifications?.length > 0 ? data.certifications : [
      {
        name: 'Certification Name',
        issuer: 'Issuing Organization',
        date: 'Issue Date'
      }
    ]
  };
  
  return (
    <div className={styles.previewContainer}>
      <ResumeTemplate data={resumeData} templateName={template} />
    </div>
  );
}
