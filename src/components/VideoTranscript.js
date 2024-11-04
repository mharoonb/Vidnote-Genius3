import React, { useState, useEffect, useCallback } from 'react';
import { generateTranscript } from '../utils/transcriptGenerator';
import { generateNotes } from '../utils/notesGenerator';

const VideoTranscript = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [error, setError] = useState('');
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState(0);

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const destroyPlayer = () => {
    if (player) {
      player.destroy();
      setPlayer(null);
    }
  };

  const loadVideo = useCallback(() => {
    if (videoId && window.YT) {
      // First destroy existing player if any
      destroyPlayer();

      try {
        // Create a new div for the player
        const playerDiv = document.createElement('div');
        playerDiv.id = 'youtube-player';
        const container = document.getElementById('player-container');
        if (container) {
          container.innerHTML = ''; // Clear previous content
          container.appendChild(playerDiv);
        }

        const newPlayer = new window.YT.Player('youtube-player', {
          height: '360',
          width: '640',
          videoId: videoId,
          playerVars: {
            playsinline: 1,
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0
          },
          events: {
            onError: onPlayerError,
          }
        });
        setPlayer(newPlayer);
      } catch (err) {
        console.error('Error initializing YouTube player:', err);
        setError(`Failed to load the video: ${err.message}. Please check the URL and try again.`);
      }
    }
  }, [videoId]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = loadVideo;
      } else {
        loadVideo();
      }
    };

    loadYouTubeAPI();

    // Cleanup function
    return () => {
      destroyPlayer();
    };
  }, [loadVideo]);

  const onPlayerError = (event) => {
    console.error('YouTube player error:', event.data);
    let errorMessage = 'An error occurred while loading the video.';
    switch(event.data) {
      case 2:
        errorMessage += ' The video ID is invalid.';
        break;
      case 5:
        errorMessage += ' The requested content cannot be played in an HTML5 player.';
        break;
      case 100:
        errorMessage += ' The video has been removed or marked as private.';
        break;
      case 101:
      case 150:
        errorMessage += ' The owner of the requested video does not allow it to be played in embedded players.';
        break;
      default:
        errorMessage += ' Please check the URL and try again.';
    }
    setError(errorMessage);
  };

  const handleUrlChange = (e) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    const extractedVideoId = extractVideoId(inputUrl);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      setError('');
    } else {
      setVideoId('');
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
    }
  };

  const simulateProgress = (duration) => {
    let elapsed = 0;
    const interval = 100;
    const timer = setInterval(() => {
      elapsed += interval;
      const newProgress = Math.min((elapsed / duration) * 100, 99);
      setProgress(newProgress);
      if (elapsed >= duration) {
        clearInterval(timer);
      }
    }, interval);
    return timer;
  };

  const handleGetTranscript = async () => {
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    setIsLoading(true);
    setError('');
    setProgress(0);
    const progressTimer = simulateProgress(15000);

    try {
      const generatedTranscript = await generateTranscript(url);
      clearInterval(progressTimer);
      setProgress(100);
      setTranscript(generatedTranscript);
      const blob = new Blob([generatedTranscript], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'transcript.txt';
      link.click();
    } catch (err) {
      clearInterval(progressTimer);
      setError(`Failed to generate transcript: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const handleGetNotes = async () => {
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video URL.');
      return;
    }

    setIsGeneratingNotes(true);
    setError('');
    setProgress(0);
    const progressTimer = simulateProgress(25000);

    try {
      const generatedTranscript = await generateTranscript(url);
      console.log('Transcript generated successfully. Length:', generatedTranscript.length);
      const generatedNotes = await generateNotes(generatedTranscript);
      clearInterval(progressTimer);
      setProgress(100);
      setNotes(generatedNotes);
    } catch (err) {
      clearInterval(progressTimer);
      console.error('Error in handleGetNotes:', err);
      if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data.error || 'Unknown error'}`);
      } else if (err.request) {
        setError('Network error: Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setIsGeneratingNotes(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setError('');
    loadVideo();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          VidNote Genius
        </h1>
        
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 space-y-6">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="Enter YouTube video URL"
              className="w-full p-4 border-2 border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
            />
          </div>

          <div id="player-container" className="rounded-xl overflow-hidden shadow-lg bg-black aspect-w-16 aspect-h-9">
            {!videoId && (
              <div className="flex items-center justify-center h-full text-gray-400">
                Paste a YouTube URL to load the video
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGetTranscript}
              disabled={isLoading || isGeneratingNotes || !url}
              className={`px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg hover:from-blue-600 hover:to-blue-800 transform hover:scale-105 transition duration-200 ${
                (isLoading || isGeneratingNotes || !url) && 'opacity-50 cursor-not-allowed hover:scale-100'
              }`}
            >
              {isLoading ? 'Generating...' : 'Get Transcript'}
            </button>
            
            <button
              onClick={handleGetNotes}
              disabled={isLoading || isGeneratingNotes || !url}
              className={`px-8 py-3 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg hover:from-purple-600 hover:to-purple-800 transform hover:scale-105 transition duration-200 ${
                (isLoading || isGeneratingNotes || !url) && 'opacity-50 cursor-not-allowed hover:scale-100'
              }`}
            >
              {isGeneratingNotes ? 'Generating...' : 'Get Notes'}
            </button>
          </div>

          {(isLoading || isGeneratingNotes) && (
            <div className="space-y-2">
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-gray-300">
                {isLoading ? 'Generating transcript' : 'Generating notes'}... {Math.round(progress)}%
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-xl p-4 text-center">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {transcript && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-blue-400">Transcript</h2>
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-inner text-gray-300 leading-relaxed">
                {transcript}
              </div>
            </div>
          )}

          {notes && (
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-purple-400">Notes</h2>
              <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-inner text-gray-300 leading-relaxed whitespace-pre-wrap">
                {notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoTranscript;
