import React from 'react';
import Navbar from './Navbar';

export default function PhotopeaEditor({ imageUrl }) {
  const encodedUrl = encodeURIComponent(imageUrl);
  const photopeaUrl = `https://www.photopea.com#%7B"files":["${encodedUrl}"]%7D`;

  return (
    <>
    <Navbar/>
    <iframe
      title="Photopea Editor"
      src={photopeaUrl}
      width="100%"
      height="689px"
      style={{ border: 'none', borderRadius: '12px'}}
    />
    </>
  );
}
