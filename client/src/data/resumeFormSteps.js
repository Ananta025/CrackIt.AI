const resumeFormSteps = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: 'fa-solid fa-user',
    description: 'Start with your basic contact details',
    fields: [
      {
        id: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'John Doe',
        required: true
      },
      {
        id: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'john.doe@example.com',
        required: true
      },
      {
        id: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: '(123) 456-7890'
      },
      {
        id: 'linkedin',
        label: 'LinkedIn Profile',
        type: 'text',
        placeholder: 'linkedin.com/in/johndoe'
      },
      {
        id: 'location',
        label: 'Location',
        type: 'text',
        placeholder: 'City, State'
      }
    ]
  },
  {
    id: 'summary',
    title: 'Professional Summary',
    icon: 'fa-solid fa-align-left',
    description: 'Write a brief overview of your professional background and goals',
    fields: [
      {
        id: 'summary',
        label: 'Summary',
        type: 'textarea',
        placeholder: 'Results-driven professional with experience in...',
        useAI: true,
        aiPrompt: 'Generate a professional summary based on my background in [field]'
      }
    ]
  },
  {
    id: 'experience',
    title: 'Work Experience',
    icon: 'fa-solid fa-briefcase',
    description: 'Add your work history, starting with your most recent position',
    isArray: true,
    fields: [
      {
        id: 'company',
        label: 'Company Name',
        type: 'text',
        placeholder: 'ABC Corporation',
        required: true
      },
      {
        id: 'position',
        label: 'Job Title',
        type: 'text',
        placeholder: 'Software Engineer',
        required: true
      },
      {
        id: 'startDate',
        label: 'Start Date',
        type: 'month',
        placeholder: ''
      },
      {
        id: 'endDate',
        label: 'End Date',
        type: 'month',
        placeholder: '',
        optional: true,
        hideIf: 'current'
      },
      {
        id: 'current',
        label: 'I currently work here',
        type: 'checkbox'
      },
      {
        id: 'description',
        label: 'Responsibilities and Achievements',
        type: 'textarea',
        placeholder: 'Describe your key responsibilities and quantifiable achievements...',
        useAI: true,
        aiPrompt: 'Generate professional bullet points for a [position] at [company]'
      }
    ]
  },
  {
    id: 'education',
    title: 'Education',
    icon: 'fa-solid fa-graduation-cap',
    description: 'Add your educational background',
    isArray: true,
    fields: [
      {
        id: 'institution',
        label: 'Institution',
        type: 'text',
        placeholder: 'University of California, Berkeley',
        required: true
      },
      {
        id: 'degree',
        label: 'Degree',
        type: 'text',
        placeholder: 'Bachelor of Science'
      },
      {
        id: 'field',
        label: 'Field of Study',
        type: 'text',
        placeholder: 'Computer Science'
      },
      {
        id: 'startDate',
        label: 'Start Date',
        type: 'month'
      },
      {
        id: 'endDate',
        label: 'End Date',
        type: 'month',
        optional: true
      }
    ]
  },
  {
    id: 'skills',
    title: 'Skills',
    icon: 'fa-solid fa-code',
    description: 'List your technical and professional skills',
    isTagInput: true,
    fields: [
      {
        id: 'skills',
        label: 'Skills',
        type: 'tags',
        placeholder: 'Add a skill and press Enter',
        useAI: true,
        aiPrompt: 'Suggest skills for a [position]'
      }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: 'fa-solid fa-diagram-project',
    description: 'Showcase projects you\'ve worked on',
    isArray: true,
    optional: true,
    fields: [
      {
        id: 'name',
        label: 'Project Name',
        type: 'text',
        placeholder: 'E-commerce Website'
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Describe the project and your contribution'
      },
      {
        id: 'technologies',
        label: 'Technologies Used',
        type: 'text',
        placeholder: 'React, Node.js, MongoDB'
      },
      {
        id: 'url',
        label: 'Project URL',
        type: 'text',
        placeholder: 'https://project.example.com',
        optional: true
      }
    ]
  },
  {
    id: 'certifications',
    title: 'Certifications',
    icon: 'fa-solid fa-certificate',
    description: 'Add any relevant certifications',
    isArray: true,
    optional: true,
    fields: [
      {
        id: 'name',
        label: 'Certification Name',
        type: 'text',
        placeholder: 'AWS Certified Solutions Architect'
      },
      {
        id: 'issuer',
        label: 'Issuing Organization',
        type: 'text',
        placeholder: 'Amazon Web Services (AWS)'
      },
      {
        id: 'date',
        label: 'Date Earned',
        type: 'month'
      }
    ]
  }
];

export default resumeFormSteps;
