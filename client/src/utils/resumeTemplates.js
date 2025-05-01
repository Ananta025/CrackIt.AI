const resumeTemplates = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and professional design with accent colors',
    thumbnail: '/images/templates/modern.jpg',
    primaryColor: '#2563eb',
    fontFamily: "'Inter', sans-serif",
    sections: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional resume layout with timeless appeal',
    thumbnail: '/images/templates/classic.jpg',
    primaryColor: '#111827',
    fontFamily: "'Merriweather', serif",
    sections: ['summary', 'experience', 'education', 'skills', 'certifications', 'projects'],
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Modern design with creative elements for standing out',
    thumbnail: '/images/templates/creative.jpg',
    primaryColor: '#8b5cf6',
    fontFamily: "'Poppins', sans-serif",
    sections: ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'],
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple and elegant design focused on content',
    thumbnail: '/images/templates/minimal.jpg',
    primaryColor: '#4b5563',
    fontFamily: "'Roboto', sans-serif",
    sections: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior professionals',
    thumbnail: '/images/templates/executive.jpg',
    primaryColor: '#1e3a8a',
    fontFamily: "'Playfair Display', serif",
    sections: ['summary', 'experience', 'education', 'skills', 'certifications'],
  }
};

export default resumeTemplates;
