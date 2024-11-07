import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ref, push, serverTimestamp } from 'firebase/database';
import { db } from '../firebase/config';

export default function SuggestionsDialog({ isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      console.log('Starting submission process...');
      console.log('Form data:', formData);

      // Create the data object
      const suggestionData = {
        ...formData,
        timestamp: serverTimestamp(),
        status: 'new'
      };

      console.log('Attempting to add suggestion to database...');
      
      // Add to Realtime Database
      const suggestionsRef = ref(db, 'suggestions');
      const newSuggestionRef = await push(suggestionsRef, suggestionData);

      console.log('Suggestion added with key:', newSuggestionRef.key);
      
      setSubmitStatus('success');
      setTimeout(() => {
        setIsOpen(false);
        setSubmitStatus(null);
        setFormData({ name: '', email: '', issue: '' });
      }, 2000);
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      setSubmitStatus('error');
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Send Suggestion
                </Dialog.Title>

                {submitStatus === 'success' ? (
                  <div className="mt-4 text-green-600">
                    Thank you for your suggestion!
                  </div>
                ) : submitStatus === 'error' ? (
                  <div className="mt-4 text-red-600">
                    Error submitting suggestion. Please try again.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
                          Issue/Suggestion
                        </label>
                        <textarea
                          name="issue"
                          id="issue"
                          required
                          value={formData.issue}
                          onChange={handleChange}
                          rows={4}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                          isSubmitting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
