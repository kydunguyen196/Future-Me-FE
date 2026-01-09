import React from 'react';

/**
 * Component for displaying student-produced response directions
 */
const StudentResponseDirections: React.FC = () => {
  return (
    <div className="student-response-directions p-4">
      <h3 className="text-xl font-semibold mb-6">Student-produced response directions</h3>
      
      <div className="space-y-4 text-base">
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">If you find more than one correct answer, <strong>enter only one answer</strong>.</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">You can enter up to <strong>5 characters</strong> for a <strong>positive</strong> answer and up to <strong>6 characters</strong> (including the negative sign) for a <strong>negative</strong> answer.</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">If your answer is a <strong>fraction</strong> that doesn't fit in the provided space, enter the <strong>decimal equivalent</strong>.</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">If your answer is a <strong>decimal</strong> that doesn't fit in the provided space, enter it by <strong>truncating or rounding at the fourth digit</strong>.</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">If your answer is a <strong>mixed number</strong> (such as 3½), enter it as an <strong>improper fraction</strong> (7/2) or its <strong>decimal equivalent</strong> (3.5).</span>
        </div>
        
        <div className="flex items-start">
          <span className="text-black mr-3">•</span>
          <span className="text-left">Don't enter <strong>symbols</strong> such as a percent sign, comma, or dollar sign.</span>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-center font-semibold mb-4 text-lg text-start">Examples</h4>
        <table className="w-full border border-gray-300 text-base">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-3 text-center font-semibold">Answer</th>
              <th className="border border-gray-300 p-3 text-center font-semibold">Acceptable ways to enter answer</th>
              <th className="border border-gray-300 p-3 text-center font-semibold">Unacceptable: will NOT receive credit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-3 text-center font-semibold">3.5</td>
              <td className="border border-gray-300 p-3 text-center">
                <div>3.5</div>
                <div>3.50</div>
                <div>7/2</div>
              </td>
              <td className="border border-gray-300 p-3 text-center text-red-600">
                <div>31/2</div>
                <div>3 1/2</div>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-3 text-center font-semibold">2/3</td>
              <td className="border border-gray-300 p-3 text-center">
                <div>2/3</div>
                <div>.6666</div>
                <div>.6667</div>
                <div>0.666</div>
                <div>0.667</div>
              </td>
              <td className="border border-gray-300 p-3 text-center text-red-600">
                <div>0.66</div>
                <div>.66</div>
                <div>0.67</div>
                <div>.67</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentResponseDirections; 