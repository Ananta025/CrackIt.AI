import React from 'react';
import PropTypes from 'prop-types';

const FeedbackCard = ({ mainFeedback, suggestions }) => {
  return (
    <div className="bg-gray-800 text-white p-6 m-4 border-l-4 border-blue-500 rounded-r shadow-lg">
      <h3 className="text-xl font-bold text-blue-400 mb-4">AI Feedback</h3>
      
      <div className="mb-4">
        <h4 className="font-bold mb-2">Main Feedback:</h4>
        <p className="text-gray-100">{mainFeedback}</p>
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <div>
          <h4 className="font-bold mb-2">Suggestions:</h4>
          <ul className="list-disc ml-6">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="mb-1 text-gray-100">{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

FeedbackCard.propTypes = {
  mainFeedback: PropTypes.string.isRequired,
  suggestions: PropTypes.arrayOf(PropTypes.string)
};

FeedbackCard.defaultProps = {
  suggestions: []
};

export default FeedbackCard;
