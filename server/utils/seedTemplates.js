import ResumeTemplate from '../models/resumeTemplateModel.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Basic template HTML structure
const createTemplateHTML = (templateName) => `
<!DOCTYPE html>
<html>
<head>
  <title>${templateName} Template</title>
</head>
<body>
  <div class="resume">
    <div class="header">
      <h1>{{header.name}}</h1>
      <div class="contact-info">
        {{#if header.email}}<div class="contact-item"><i class="email-icon"></i>{{header.email}}</div>{{/if}}
        {{#if header.phone}}<div class="contact-item"><i class="phone-icon"></i>{{header.phone}}</div>{{/if}}
        {{#if header.linkedin}}<div class="contact-item"><i class="linkedin-icon"></i>{{header.linkedin}}</div>{{/if}}
        {{#if header.location}}<div class="contact-item"><i class="location-icon"></i>{{header.location}}</div>{{/if}}
        {{#if header.portfolio}}<div class="contact-item"><i class="portfolio-icon"></i>{{header.portfolio}}</div>{{/if}}
      </div>
    </div>
    
    {{#if summary}}
    <div class="section">
      <h2>Professional Summary</h2>
      <div class="summary">{{summary}}</div>
    </div>
    {{/if}}
    
    {{#if experience.length}}
    <div class="section">
      <h2>Experience</h2>
      {{#each experience}}
      <div class="experience-item">
        <div class="job-header">
          <div class="job-title">{{this.title}}</div>
          <div class="job-company">{{this.company}}{{#if this.location}} - {{this.location}}{{/if}}</div>
          <div class="job-duration">
            {{#if this.startDate}}{{formatDate this.startDate}}{{/if}}
            {{#if this.endDate}} - {{formatDate this.endDate}}{{else}}{{#if this.current}} - Present{{/if}}{{/if}}
          </div>
        </div>
        <div class="job-description">
          {{#each this.description}}
          <div class="bullet-item">{{this}}</div>
          {{/each}}
        </div>
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    {{#if education.length}}
    <div class="section">
      <h2>Education</h2>
      {{#each education}}
      <div class="education-item">
        <div class="education-header">
          <div class="degree">{{this.degree}}{{#if this.field}} in {{this.field}}{{/if}}</div>
          <div class="institution">{{this.institution}}</div>
          <div class="education-duration">
            {{#if this.startDate}}{{formatDate this.startDate}}{{/if}}
            {{#if this.endDate}} - {{formatDate this.endDate}}{{/if}}
          </div>
        </div>
        {{#if this.description}}<div class="education-description">{{this.description}}</div>{{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    {{#if skills.length}}
    <div class="section">
      <h2>Skills</h2>
      <div class="skills-list">
        {{#each skills}}
        <div class="skill-item">{{this}}</div>
        {{/each}}
      </div>
    </div>
    {{/if}}
    
    {{#if projects.length}}
    <div class="section">
      <h2>Projects</h2>
      {{#each projects}}
      <div class="project-item">
        <div class="project-header">
          <div class="project-name">{{this.name}}</div>
          {{#if this.technologies}}<div class="project-technologies">{{this.technologies}}</div>{{/if}}
        </div>
        {{#if this.description}}<div class="project-description">{{this.description}}</div>{{/if}}
        {{#if this.link}}<div class="project-link"><a href="{{this.link}}">View Project</a></div>{{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
    
    {{#if certifications.length}}
    <div class="section">
      <h2>Certifications</h2>
      {{#each certifications}}
      <div class="certification-item">
        <div class="certification-name">{{this.name}}</div>
        <div class="certification-details">
          {{#if this.issuer}}{{this.issuer}}{{/if}}
          {{#if this.date}} - {{formatDate this.date}}{{/if}}
        </div>
        {{#if this.description}}<div class="certification-description">{{this.description}}</div>{{/if}}
      </div>
      {{/each}}
    </div>
    {{/if}}
  </div>
</body>
</html>
`;

// Template CSS based on template type
const getTemplateCSS = (templateType) => {
  switch(templateType) {
    case 'Modern':
      return `
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #333; }
        .resume { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 30px; margin-bottom: 20px; }
        h1 { margin: 0 0 10px 0; font-size: 28px; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 15px; }
        .contact-item { font-size: 14px; display: flex; align-items: center; }
        .section { margin-bottom: 25px; }
        h2 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px; margin-bottom: 15px; font-size: 18px; }
        .experience-item, .education-item, .project-item, .certification-item { margin-bottom: 15px; }
        .job-header, .education-header, .project-header { margin-bottom: 5px; }
        .job-title, .degree, .project-name { font-weight: bold; }
        .job-company, .institution, .project-technologies { font-style: italic; }
        .job-duration, .education-duration { color: #666; font-size: 14px; }
        .bullet-item { position: relative; padding-left: 15px; margin-bottom: 3px; }
        .bullet-item:before { content: "•"; position: absolute; left: 0; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-item { background-color: #e0e7ff; color: #4338ca; padding: 5px 10px; border-radius: 3px; font-size: 14px; }
      `;
    case 'Simple':
      return `
        body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; color: #333; line-height: 1.5; }
        .resume { max-width: 800px; margin: 0 auto; padding: 30px; }
        .header { text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #ddd; }
        h1 { margin: 0 0 10px 0; font-size: 26px; }
        .contact-info { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; font-size: 14px; }
        .section { margin-bottom: 25px; }
        h2 { font-size: 18px; margin-bottom: 10px; color: #333; }
        .experience-item, .education-item, .project-item, .certification-item { margin-bottom: 15px; }
        .job-header, .education-header, .project-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .job-title, .degree, .project-name { font-weight: bold; }
        .job-company, .institution, .project-technologies { font-style: italic; }
        .job-duration, .education-duration { color: #666; font-size: 14px; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-item { background-color: #f3f4f6; padding: 5px 10px; border-radius: 3px; font-size: 14px; }
      `;
    case 'Professional':
      return `
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; color: #111827; line-height: 1.6; }
        .resume { max-width: 800px; margin: 0 auto; padding: 30px; }
        .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 25px; }
        h1 { margin: 0 0 10px 0; font-size: 28px; color: #1e3a8a; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 15px; }
        .contact-item { font-size: 14px; }
        .section { margin-bottom: 30px; }
        h2 { color: #1e3a8a; font-size: 20px; margin-bottom: 15px; letter-spacing: 0.05em; text-transform: uppercase; }
        .experience-item, .education-item, .project-item, .certification-item { margin-bottom: 20px; }
        .job-header, .education-header, .project-header { margin-bottom: 10px; }
        .job-title, .degree, .project-name { font-weight: bold; font-size: 16px; }
        .job-company, .institution, .project-technologies { font-style: italic; }
        .job-duration, .education-duration { color: #4b5563; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-item { border: 1px solid #e5e7eb; padding: 5px 10px; border-radius: 3px; font-size: 14px; }
      `;
    case 'Creative':
      return `
        body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; color: #333; }
        .resume { max-width: 800px; margin: 0 auto; padding: 30px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        h1 { margin: 0 0 15px 0; font-size: 28px; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 15px; }
        .contact-item { font-size: 14px; display: flex; align-items: center; }
        .section { margin-bottom: 30px; }
        h2 { color: #8b5cf6; font-size: 22px; margin-bottom: 15px; position: relative; padding-bottom: 10px; }
        h2:after { content: ''; position: absolute; bottom: 0; left: 0; width: 50px; height: 3px; background: #8b5cf6; }
        .experience-item, .education-item, .project-item, .certification-item { margin-bottom: 20px; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .job-title, .degree, .project-name { font-weight: bold; color: #8b5cf6; }
        .job-company, .institution, .project-technologies { font-weight: 500; }
        .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill-item { background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: white; padding: 8px 15px; border-radius: 20px; font-size: 14px; }
      `;
    default:
      return `
        body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #333; }
        .resume { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { margin-bottom: 20px; }
        h1 { margin: 0 0 10px 0; }
        .contact-info { display: flex; flex-wrap: wrap; gap: 10px; }
        .section { margin-bottom: 20px; }
        h2 { margin-bottom: 10px; }
      `;
  }
};

// Array of templates to seed
const templates = [
  {
    name: 'Modern',
    category: 'Modern',
    description: 'Clean design with blue accents and focus on content hierarchy',
    previewImage: 'modern-template.png'
  },
  {
    name: 'Minimal',
    category: 'Simple',
    description: 'Minimalist layout with clean typography and subtle formatting',
    previewImage: 'minimal-template.png'
  },
  {
    name: 'Professional',
    category: 'Professional',
    description: 'Traditional format optimized for ATS with navy blue accents',
    previewImage: 'professional-template.png'
  },
  {
    name: 'Creative',
    category: 'Creative',
    description: 'Modern design with purple gradients for creative professionals',
    previewImage: 'creative-template.png'
  }
];

// Function to seed templates to database
export const seedTemplates = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoose.connection.readyState) {
      console.log('Connecting to MongoDB for template seeding');
      await mongoose.connect(mongoURI);
    }
    
    // Count existing templates
    const count = await ResumeTemplate.countDocuments();
    console.log(`Found ${count} existing templates`);
    
    if (count === 0) {
      console.log('No templates found, seeding initial templates...');
      
      // Generate template documents
      const templateDocs = templates.map(template => ({
        name: template.name,
        category: template.category,
        description: template.description,
        htmlTemplate: createTemplateHTML(template.name),
        css: getTemplateCSS(template.category),
        previewImage: template.previewImage,
        isActive: true
      }));
      
      // Insert all templates
      const result = await ResumeTemplate.insertMany(templateDocs);
      console.log(`Successfully seeded ${result.length} templates`);
      return result;
    } else {
      console.log('Templates already exist, skipping seed');
      return await ResumeTemplate.find();
    }
  } catch (error) {
    console.error('Error seeding templates:', error);
    throw error;
  }
};

// Function to run seed directly if script is executed
export const runSeed = async () => {
  try {
    await seedTemplates();
    console.log('Template seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Template seeding failed:', error);
    process.exit(1);
  }
};

// Run seed if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}
