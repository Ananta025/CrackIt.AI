import mongoose from 'mongoose';
import ResumeTemplate from '../models/resumeTemplateModel.js';
import config from '../config/config.js';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';

dotenv.config();

// Basic templates to seed
const templates = [
  {
    name: 'Modern',
    category: 'Modern',
    description: 'A clean, modern resume template with a sidebar for contact information.',
    htmlTemplate: `
      <div class="resume-modern">
        <div class="sidebar">
          <div class="profile">
            <h1>{{header.name}}</h1>
            <p class="title">{{header.title}}</p>
          </div>
          <div class="contact-info">
            {{#if header.email}}<p><i class="icon">email</i> {{header.email}}</p>{{/if}}
            {{#if header.phone}}<p><i class="icon">phone</i> {{header.phone}}</p>{{/if}}
            {{#if header.location}}<p><i class="icon">location</i> {{header.location}}</p>{{/if}}
            {{#if header.linkedin}}<p><i class="icon">linkedin</i> {{header.linkedin}}</p>{{/if}}
            {{#if header.portfolio}}<p><i class="icon">web</i> {{header.portfolio}}</p>{{/if}}
          </div>
          <div class="skills-section">
            <h2>Skills</h2>
            <div class="skills-list">
              {{#each skills}}
                <span class="skill-tag">{{this}}</span>
              {{/each}}
            </div>
          </div>
        </div>
        <div class="main-content">
          {{#if summary}}
          <div class="section">
            <h2>Professional Summary</h2>
            <p>{{summary}}</p>
          </div>
          {{/if}}
          
          {{#if experience.length}}
          <div class="section">
            <h2>Experience</h2>
            {{#each experience}}
            <div class="experience-item">
              <div class="header">
                <h3>{{title}}</h3>
                <p class="company">{{company}}</p>
                <p class="date">{{formatDate startDate}} - {{#if current}}Present{{else}}{{formatDate endDate}}{{/if}}</p>
              </div>
              <ul class="description">
                {{#each description}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </div>
            {{/each}}
          </div>
          {{/if}}
          
          {{#if education.length}}
          <div class="section">
            <h2>Education</h2>
            {{#each education}}
            <div class="education-item">
              <h3>{{degree}} {{#if field}}in {{field}}{{/if}}</h3>
              <p class="institution">{{institution}}</p>
              <p class="date">{{formatDate startDate}} - {{formatDate endDate}}</p>
              {{#if description}}<p>{{description}}</p>{{/if}}
            </div>
            {{/each}}
          </div>
          {{/if}}
          
          {{#if projects.length}}
          <div class="section">
            <h2>Projects</h2>
            {{#each projects}}
            <div class="project-item">
              <h3>{{name}}</h3>
              <p>{{description}}</p>
              {{#if technologies.length}}<p class="technologies">{{technologies}}</p>{{/if}}
              {{#if link}}<p class="link"><a href="{{link}}">{{link}}</a></p>{{/if}}
            </div>
            {{/each}}
          </div>
          {{/if}}
          
          {{#if certifications.length}}
          <div class="section">
            <h2>Certifications</h2>
            {{#each certifications}}
            <div class="certification-item">
              <h3>{{name}}</h3>
              <p class="issuer">{{issuer}}</p>
              {{#if date}}<p class="date">{{formatDate date}}</p>{{/if}}
              {{#if description}}<p>{{description}}</p>{{/if}}
            </div>
            {{/each}}
          </div>
          {{/if}}
        </div>
      </div>
    `,
    css: `
      body { 
        font-family: 'Roboto', sans-serif; 
        margin: 0;
        color: #333;
        line-height: 1.5;
      }
      .resume-modern {
        display: flex;
        max-width: 1000px;
        margin: 0 auto;
      }
      .sidebar {
        width: 30%;
        background: #2c3e50;
        color: #fff;
        padding: 20px;
      }
      .main-content {
        width: 70%;
        padding: 20px;
        background: #fff;
      }
      h1, h2, h3 {
        margin-top: 0;
      }
      h1 {
        font-size: 24px;
        font-weight: 500;
      }
      h2 {
        font-size: 18px;
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
        margin-bottom: 15px;
      }
      .sidebar h2 {
        color: #fff;
        border-bottom-color: #fff;
      }
      .skills-list {
        display: flex;
        flex-wrap: wrap;
      }
      .skill-tag {
        background: rgba(255,255,255,0.2);
        padding: 5px 10px;
        border-radius: 3px;
        margin: 0 5px 5px 0;
        font-size: 12px;
      }
      .section {
        margin-bottom: 20px;
      }
      .experience-item, .education-item, .project-item, .certification-item {
        margin-bottom: 15px;
      }
      .header {
        display: flex;
        flex-direction: column;
      }
      .header h3 {
        margin-bottom: 0;
      }
      ul.description {
        margin-top: 8px;
        padding-left: 20px;
      }
      .date, .company, .institution, .issuer {
        color: #7f8c8d;
        font-size: 14px;
      }
    `,
    previewImage: '/images/templates/modern-template.png',
  },
  {
    name: 'Simple',
    category: 'Simple',
    description: 'A minimalist resume template that focuses on your experience and skills.',
    htmlTemplate: `
      <div class="resume-simple">
        <header class="resume-header">
          <h1>{{header.name}}</h1>
          <div class="contact-info">
            {{#if header.email}}<span>{{header.email}}</span>{{/if}}
            {{#if header.phone}}<span>{{header.phone}}</span>{{/if}}
            {{#if header.location}}<span>{{header.location}}</span>{{/if}}
            {{#if header.linkedin}}<span>{{header.linkedin}}</span>{{/if}}
          </div>
        </header>
        
        {{#if summary}}
        <section class="summary-section">
          <p>{{summary}}</p>
        </section>
        {{/if}}
        
        {{#if experience.length}}
        <section class="section">
          <h2>Professional Experience</h2>
          {{#each experience}}
          <div class="entry">
            <div class="entry-header">
              <div class="title-company">
                <h3>{{title}}</h3>
                <p class="company">{{company}}</p>
              </div>
              <div class="date">
                <p>{{formatDate startDate}} - {{#if current}}Present{{else}}{{formatDate endDate}}{{/if}}</p>
              </div>
            </div>
            <ul>
              {{#each description}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if education.length}}
        <section class="section">
          <h2>Education</h2>
          {{#each education}}
          <div class="entry">
            <div class="entry-header">
              <div class="title-company">
                <h3>{{institution}}</h3>
                <p>{{degree}} {{#if field}}in {{field}}{{/if}}</p>
              </div>
              <div class="date">
                <p>{{formatDate startDate}} - {{formatDate endDate}}</p>
              </div>
            </div>
            {{#if description}}<p>{{description}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if skills.length}}
        <section class="section">
          <h2>Skills</h2>
          <div class="skills">
            {{#each skills}}
            <span class="skill">{{this}}</span>
            {{/each}}
          </div>
        </section>
        {{/if}}
        
        {{#if projects.length}}
        <section class="section">
          <h2>Projects</h2>
          {{#each projects}}
          <div class="entry">
            <h3>{{name}}</h3>
            <p>{{description}}</p>
            {{#if technologies.length}}<p class="technologies">{{technologies}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
        
        {{#if certifications.length}}
        <section class="section">
          <h2>Certifications</h2>
          {{#each certifications}}
          <div class="entry">
            <div class="entry-header">
              <div class="title-company">
                <h3>{{name}}</h3>
                <p>{{issuer}}</p>
              </div>
              {{#if date}}
              <div class="date">
                <p>{{formatDate date}}</p>
              </div>
              {{/if}}
            </div>
            {{#if description}}<p>{{description}}</p>{{/if}}
          </div>
          {{/each}}
        </section>
        {{/if}}
      </div>
    `,
    css: `
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .resume-simple {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
      }
      .resume-header {
        text-align: center;
        margin-bottom: 20px;
      }
      h1 {
        margin: 0;
        font-size: 28px;
      }
      .contact-info {
        margin-top: 10px;
      }
      .contact-info span {
        margin: 0 10px;
      }
      .section {
        margin-bottom: 20px;
      }
      h2 {
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
        font-size: 18px;
      }
      .entry {
        margin-bottom: 15px;
      }
      .entry-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      h3 {
        margin: 0;
        font-size: 16px;
      }
      .title-company p {
        margin: 5px 0 0;
        font-style: italic;
      }
      .date p {
        margin: 0;
        color: #666;
      }
      ul {
        margin-top: 10px;
      }
      .skills {
        display: flex;
        flex-wrap: wrap;
      }
      .skill {
        background-color: #f0f0f0;
        padding: 5px 10px;
        margin: 0 5px 5px 0;
        border-radius: 3px;
        font-size: 14px;
      }
      .summary-section {
        margin-bottom: 20px;
      }
    `,
    previewImage: '/images/templates/simple-template.png',
  }
];

// Function to seed resume templates
async function seedResumeTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.url);
    console.log('Connected to MongoDB');

    // Delete existing templates
    await ResumeTemplate.deleteMany({});
    console.log('Deleted existing resume templates');

    // Create new templates
    const createdTemplates = await ResumeTemplate.create(templates);
    console.log(`Created ${createdTemplates.length} resume templates`);

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding resume templates:', error);
    process.exit(1);
  }
}

// Run seeder
seedResumeTemplates();
