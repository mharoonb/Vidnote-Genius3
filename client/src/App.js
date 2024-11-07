import React, { useState } from 'react';
import VideoTranscript from './components/VideoTranscript';
import SuggestionsDialog from './components/SuggestionsDialog';

function App() {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  return (
    <div className="App">
      <div className="fixed top-4 right-4">
        <button
          onClick={() => setIsSuggestionsOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Suggestions
        </button>
      </div>

      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">How to Use Vid Note Genius</h2>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <div>
              <p className="font-semibold">Paste the YouTube Link</p>
              <p className="text-gray-600">Copy the link of the YouTube video you want to transcribe and paste it into the text box provided.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <div>
              <p className="font-semibold">Get the Transcript</p>
              <p className="text-gray-600">Click on the "Get Transcript" button to generate the video's transcript in English.</p>
              <p className="text-sm text-gray-500 italic">Tip: This may take a moment, depending on the video length.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <div>
              <p className="text-gray-600">Once the transcript is ready it will be shown below and also a .txt file will be downloaded.</p>
            </div>
          </div>

          <div className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <div>
              <p className="text-gray-600">If you want properly structured notes of the video then click on the "Get Notes" button</p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-bold">Note:</span> The accuracy of the transcript and summary depends on the audio quality and content of the video.
            </p>
          </div>
        </div>
      </div>

      <VideoTranscript />
      <SuggestionsDialog 
        isOpen={isSuggestionsOpen}
        setIsOpen={setIsSuggestionsOpen}
      />
    </div>
  );
}

export default App;
