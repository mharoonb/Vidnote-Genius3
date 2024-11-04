const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { YoutubeTranscript } = require('youtube-transcript');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
app.use(express.static(path.join(__dirname, 'build')));

function cleanTranscript(transcript) {
  if (Array.isArray(transcript)) {
    // Handle YouTube transcript format
    const text = transcript
      .map(item => item.text)
      .join(' ')
      .replace(/\s+/g, " ")
      .trim();
    
    return text.charAt(0).toUpperCase() + 
           text.slice(1).replace(/\. +([a-z])/g, (match, p1) => `. ${p1.toUpperCase()}`);
  }
  
  // Handle plain text format
  let cleanedTranscript = transcript.replace(/<\/?[^>]+(>|$)/g, "");
  cleanedTranscript = cleanedTranscript.replace(/\s+/g, " ").trim();
  cleanedTranscript = cleanedTranscript.replace(/\. +([a-z])/g, (match, p1) => `. ${p1.toUpperCase()}`);
  cleanedTranscript = cleanedTranscript.charAt(0).toUpperCase() + cleanedTranscript.slice(1);
  
  return cleanedTranscript;
}

async function downloadYouTubeAudio(videoId) {
  const ytdl = require('ytdl-core');
  const outputPath = `./${videoId}.mp3`;
  
  return new Promise((resolve, reject) => {
    ytdl(`https://www.youtube.com/watch?v=${videoId}`, {
      quality: 'lowestaudio',
      filter: 'audioonly'
    })
    .pipe(fs.createWriteStream(outputPath))
    .on('finish', () => resolve(outputPath))
    .on('error', reject);
  });
}

async function transcribeWithWhisper(audioPath) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(audioPath));
    formData.append('model', 'whisper-1');

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
    });

    return response.data.text;
  } finally {
    // Clean up the temporary audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
}

app.get('/api/youtube-transcript', async (req, res) => {
  try {
    const { videoId } = req.query;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // First attempt: Try getting transcript through YouTube API
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        return res.json({ transcript: cleanTranscript(transcript) });
      }
    } catch (youtubeError) {
      console.log('YouTube transcript not available, falling back to Whisper:', youtubeError.message);
    }

    // Second attempt: Fall back to Whisper API
    try {
      console.log('Downloading audio for Whisper transcription...');
      const audioPath = await downloadYouTubeAudio(videoId);
      console.log('Transcribing with Whisper...');
      const whisperTranscript = await transcribeWithWhisper(audioPath);
      return res.json({ transcript: cleanTranscript(whisperTranscript) });
    } catch (whisperError) {
      console.error('Whisper transcription failed:', whisperError);
      throw whisperError;
    }
  } catch (error) {
    console.error('Error in transcript generation:', error);
    res.status(500).json({ error: 'Failed to generate transcript', details: error.message });
  }
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant that translates text to English."},
        {role: "user", content: `Translate the following text to English: "${text}"`}
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ translation: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

app.post('/api/is-english', async (req, res) => {
  try {
    const { text } = req.body;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant that determines if text is in English."},
        {role: "user", content: `Is the following text in English? Answer with only 'yes' or 'no': "${text.substring(0, 500)}"`}
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    const answer = response.data.choices[0].message.content.toLowerCase();
    res.json({ isEnglish: answer === 'yes' });
  } catch (error) {
    console.error('Error checking language:', error);
    res.status(500).json({ error: 'Failed to check language' });
  }
});

app.post('/api/generate-notes', async (req, res) => {
  try {
    const { transcript } = req.body;
    const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
    const API_URL = 'https://api.anthropic.com/v1/messages';

    if (!API_KEY) {
      throw new Error('REACT_APP_ANTHROPIC_API_KEY is not set in the environment variables');
    }

    const prompt = `Analyze the provided transcript in detail, read each line and understand the context. then Convert the provided transcription into extensively detailed, well-structured notes that capture and explain all information presented in the transcript. Maintain the full depth and breadth of the original content without summarizing or condensing. You should be carefull about the type of transcript and then give structured notes, for example if the transcript is a story then obviously you will not give it headings and sub heading you would structure the notes where you will explain the story in relevant format, if the notes are for example lecture about a scientific concept then you will structure it in a way a scientific lecture should be structured, etc.'

Transcription:
${transcript}`;

    const payload = {
      model: 'claude-3-opus-20240229',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 4000
    };

    const response = await axios.post(API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });

    if (response.data && response.data.content && response.data.content[0] && response.data.content[0].text) {
      res.json({ notes: response.data.content[0].text });
    } else {
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ error: 'Failed to generate notes', details: error.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
