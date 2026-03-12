import React from 'react';

export const Setup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Setup Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please configure your Supabase credentials to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-700 mb-4">
                This application requires a Supabase backend to function. Please follow these steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Create a project on <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-green-600 hover:text-green-500">Supabase</a>.</li>
                <li>Run the provided <code>supabase-schema.sql</code> script in the Supabase SQL Editor.</li>
                <li>Get your Project URL and anon key from Project Settings &gt; API.</li>
                <li>Add them to the AI Studio Secrets panel as:
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li><code>VITE_SUPABASE_URL</code></li>
                    <li><code>VITE_SUPABASE_ANON_KEY</code></li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
