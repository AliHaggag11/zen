'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError(null);
    setImageUrl(null);
  };

  const handleTestUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setResult(null);
    setError(null);
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError('Not authenticated - please log in');
        return;
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `test-${Date.now()}.${fileExt}`;
      
      console.log('Starting upload test with file:', fileName);
      console.log('File size:', file.size, 'bytes');
      console.log('File type:', file.type);
      
      // Test upload directly without the helper function
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error details:', uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('Upload successful!', data);
      console.log('Public URL:', urlData.publicUrl);
      
      setResult('File uploaded successfully!');
      setImageUrl(urlData.publicUrl);
    } catch (error: unknown) {
      console.error('Unexpected error:', error);
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-8">Storage Upload Test</h1>
          
          <div className="bg-background rounded-xl shadow-lg border border-primary/10 overflow-hidden p-8">
            <h2 className="text-xl font-semibold mb-6">Test Supabase Storage Upload</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">
                  Select image to upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-foreground/70 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              
              <button
                onClick={handleTestUpload}
                disabled={!file || uploading}
                className="px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
              >
                {uploading ? 'Uploading...' : 'Test Upload'}
              </button>
              
              {error && (
                <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-200">
                  {error}
                </div>
              )}
              
              {result && (
                <div className="p-4 rounded-lg bg-green-100 text-green-700 border border-green-200">
                  {result}
                </div>
              )}
              
              {imageUrl && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Uploaded Image:</h3>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <Image 
                      src={imageUrl} 
                      alt="Uploaded" 
                      width={192}
                      height={192}
                      className="max-h-48 mx-auto"
                    />
                    <p className="mt-2 text-sm text-center text-foreground/70">
                      <a 
                        href={imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-primary hover:underline"
                      >
                        {imageUrl}
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <a href="/profile" className="text-primary hover:underline">
              Back to Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 