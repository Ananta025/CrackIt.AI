import ResumeReview from '../components/ResumeReview';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center py-10 px-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Resume Review</h1>
        <p className="text-lg mb-8 text-center text-gray-200 max-w-2xl mx-auto">
          Upload your resume to get AI-powered feedback and suggestions on how to improve it.
        </p>

        {/* Resume Review Component */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl mb-10">
          <ResumeReview />
        </div>

        {/* Resume Tips Section (Optional) */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Resume Building Tips</h2>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <ul className="list-disc list-inside space-y-2 text-gray-200">
              <li>Keep your resume concise and relevant to the job you're applying for</li>
              <li>Use action verbs and quantify your achievements whenever possible</li>
              <li>Ensure proper formatting and consistent styling throughout</li>
              <li>Tailor your skills section to match the job description</li>
              <li>Proofread carefully for spelling and grammar errors</li>
            </ul>
            
            <div className="mt-6 pt-4 border-t border-gray-700">
              <h3 className="text-xl font-medium mb-2">Helpful Resources</h3>
              <div className="flex flex-wrap gap-3">
                <a href="#" className="text-blue-400 hover:text-blue-300 transition">Resume Templates</a>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition">Industry Examples</a>
                <a href="#" className="text-blue-400 hover:text-blue-300 transition">Career Advice</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
