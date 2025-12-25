import React, { Suspense, lazy } from 'react';
import styles from './ResumePreview.module.css';
// No longer need: import resumeTemplates from '../../utils/resumeTemplates';

// Dynamically import each template rendering component
const ClassicTemplate = lazy(() => import('../resume_templates/ClassicTemplate.jsx'));
const CreativeTemplate = lazy(() => import('../resume_templates/CreativeTemplate.jsx'));
const MinimalTemplate = lazy(() => import('../resume_templates/MinimalTemplate.jsx'));
const ExecutiveTemplate = lazy(() => import('../resume_templates/ExecutiveTemplate.jsx'));
const ModernTemplate = lazy(() => import('../resume_templates/ModernTemplate.jsx')); // Your existing modern template

export default function ResumeTemplate({ data, templateName = 'modern' }) {
  let TemplateComponent;

  // Select the appropriate rendering component based on templateName
  switch (templateName) {
    case 'classic':
      TemplateComponent = ClassicTemplate;
      break;
    case 'creative':
      TemplateComponent = CreativeTemplate;
      break;
    case 'minimal':
      TemplateComponent = MinimalTemplate;
      break;
    case 'executive':
      TemplateComponent = ExecutiveTemplate;
      break;
    case 'modern':
    default:
      TemplateComponent = ModernTemplate;
      break;
  }

  return (
    <Suspense fallback={<div className={styles.loadingMessage}>Loading Template...</div>}>
      <TemplateComponent data={data} />
    </Suspense>
  );
}

// Remove all the individual render functions (renderModernTemplate, renderClassicTemplate, etc.)
// from this file, as they are now in their dedicated component files.