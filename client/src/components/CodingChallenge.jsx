import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const CodingChallenge = ({ prompt, onClose }) => {
  const [code, setCode] = useState('// Write your code here\n');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      // Create a safe environment to run JavaScript code
      const originalConsoleLog = console.log;
      let capturedOutput = '';
      
      // Override console.log to capture output
      console.log = (...args) => {
        capturedOutput += args.join(' ') + '\n';
      };
      
      // Execute the code
      const result = eval(code);
      
      // Restore original console.log
      console.log = originalConsoleLog;
      
      // Show captured output or result
      if (capturedOutput) {
        setOutput(capturedOutput);
      } else if (result !== undefined) {
        setOutput(String(result));
      } else {
        setOutput('Code executed successfully (no output)');
      }
      
      toast.success('Code executed successfully!');
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast.error('Code execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const resetCode = () => {
    setCode('// Write your code here\n');
    setOutput('');
    toast.success('Code reset successfully');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{prompt.title}</h2>
            <p className="text-gray-600 mt-1">{prompt.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex">
          {/* Left Panel - Challenge Description */}
          <div className="w-1/3 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                prompt.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                prompt.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {prompt.difficulty}
              </span>
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {prompt.category}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Challenge</h3>
              <p className="text-gray-700 leading-relaxed">{prompt.prompt}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tips</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Write clean, readable code</li>
                <li>• Test your solution with different inputs</li>
                <li>• Use console.log() to debug</li>
                <li>• Consider edge cases</li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Code Editor and Output */}
          <div className="flex-1 flex flex-col">
            {/* Code Editor */}
            <div className="flex-1 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Code Editor</h3>
                <div className="space-x-2">
                  <button
                    onClick={resetCode}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors font-medium"
                  >
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                </div>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your JavaScript code here..."
                spellCheck={false}
              />
            </div>

            {/* Output Panel */}
            <div className="border-t border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Output</h3>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm min-h-24 max-h-32 overflow-y-auto">
                {output || 'Run your code to see the output here...'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingChallenge;
