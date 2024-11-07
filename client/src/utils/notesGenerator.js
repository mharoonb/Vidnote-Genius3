import axios from 'axios';

export async function generateNotes(transcript) {
  try {
    console.log('Generating notes for transcript of length:', transcript.length);

    const response = await axios.post('/api/generate-notes', { transcript }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response from server');

    if (response.data && response.data.notes) {
      return response.data.notes;
    } else {
      console.error('Unexpected server response format:', JSON.stringify(response.data));
      throw new Error('Unexpected server response format');
    }
  } catch (error) {
    console.error('Error generating notes:', error);
    if (error.response) {
      console.error('Server response error:', error.response.data);
      console.error('Status code:', error.response.status);
      throw new Error(`Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('Network error: No response received from the server');
    } else {
      console.error('Error setting up request:', error.message);
      throw new Error(`Error: ${error.message}`);
    }
  }
}
