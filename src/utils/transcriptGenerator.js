import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

async function getYouTubeTranscript(videoId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/youtube-transcript?videoId=${videoId}`);
    return response.data.transcript;
  } catch (err) {
    console.error('An error occurred while fetching the YouTube transcript:', err.message);
    throw new Error('Failed to fetch YouTube transcript. Please try again later.');
  }
}

async function translateText(text) {
  try {
    const response = await axios.post(`${API_BASE_URL}/translate`, { text });
    return response.data.translation;
  } catch (error) {
    console.error('An error occurred during translation:', error);
    throw new Error('Failed to translate the text. Please try again later.');
  }
}

async function isEnglish(text) {
  try {
    const response = await axios.post(`${API_BASE_URL}/is-english`, { text });
    return response.data.isEnglish;
  } catch (error) {
    console.error('An error occurred while checking language:', error);
    return false;
  }
}

export async function generateTranscript(videoUrl) {
  try {
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error('Invalid video URL. Please provide a valid YouTube URL.');
    }

    const videoId = videoUrl.split('v=')[1];
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Please provide a valid URL containing a video ID.');
    }

    let transcript = await getYouTubeTranscript(videoId);

    if (!transcript) {
      throw new Error('Failed to fetch YouTube transcript. Please try another video.');
    }

    const transcriptIsEnglish = await isEnglish(transcript);

    if (!transcriptIsEnglish) {
      console.log('Transcript is not in English. Translating...');
      transcript = await translateText(transcript);
    }

    return transcript;
  } catch (error) {
    console.error('An error occurred:', error);
    throw error;
  }
}
