import { useState } from 'react';

const ResumeReview = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    setIsLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      setFeedback("Your resume looks great! Consider adding more quantifiable achievements and tailoring your skills section to match the job descriptions you're applying for. Also, make sure your most recent experience is highlighted prominently.");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Resume Review</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="resume" className="block text-sm font-medium text-gray-100">
              Upload Your Resume
            </label>
            <input
              type="file"
              id="resume"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-400">Supported formats: PDF, DOCX</p>
          </div>
          
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors duration-200"
          >
            {isLoading ? 'Analyzing...' : 'Submit for Review'}
          </button>
        </form>
        
        {isLoading && (
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {feedback && (
          <div className="mt-6 bg-gray-800 border-l-4 border-blue-500 p-4 rounded-r-md">
            <h3 className="text-lg font-semibold text-white mb-2">AI Feedback</h3>
            <p className="text-gray-100">{feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeReview;
