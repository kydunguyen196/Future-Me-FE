import React, { useEffect, useState } from 'react';

const TestReferencePage: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Set document title
    document.title = 'Math Formula Reference - FutureMe';
    
    // Optional: Style the body for a clean reference look
    document.body.style.backgroundColor = '#f9f9f9';
    document.body.style.margin = '0';
    document.body.style.padding = '20px';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    
    // Simulate content loading delay
    const contentTimer = setTimeout(() => {
      setContentLoaded(true);
    }, 500);
    
    // Cleanup on unmount
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.fontFamily = '';
      document.title = 'FutureMe';
      clearTimeout(contentTimer);
    };
  }, []);

  // Skeleton component for title
  const TitleSkeleton = () => (
    <div style={{
      height: '32px',
      backgroundColor: '#e5e7eb',
      borderRadius: '4px',
      marginBottom: '30px',
      animation: 'pulse 1.5s ease-in-out infinite',
      width: '60%',
      margin: '0 auto 30px auto'
    }} />
  );

  // Skeleton component for image
  const ImageSkeleton = () => (
    <div style={{
      width: '100%',
      height: '400px',
      backgroundColor: '#e5e7eb',
      borderRadius: '8px',
      border: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 1.5s ease-in-out infinite',
      marginBottom: '30px'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#d1d5db',
          borderRadius: '4px',
          margin: '0 auto 8px auto'
        }} />
        <div style={{ fontSize: '14px' }}>Loading image...</div>
      </div>
    </div>
  );

  // Skeleton component for facts section
  const FactsSkeleton = () => (
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      {/* Title skeleton */}
      <div style={{
        height: '24px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        marginBottom: '15px',
        width: '50%',
        margin: '0 auto 15px auto',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {/* Facts skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            style={{
              height: '20px',
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              width: `${85 + Math.random() * 10}%`,
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '30px',
      minHeight: '100vh'
    }}>
      {/* Add CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `
      }} />

      {/* Title */}
      {!contentLoaded ? (
        <TitleSkeleton />
      ) : (
        <h1 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Math Formula Reference
        </h1>
      )}
      
      {/* Reference Image */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        {!imageLoaded && !imageError && <ImageSkeleton />}
        
        <img 
          src="https://futureme.com.vn:443/api/v1/storage/assert/1d86f552-91f4-438d-a0f0-9c8b4a519dad.png"
          alt="Math Formula Reference"
          style={{
            maxWidth: '100%',
            height: 'auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: imageLoaded ? 'block' : 'none'
          }}
          onLoad={() => {
            setImageLoaded(true);
            setImageError(false);
          }}
          onError={() => {
            setImageLoaded(false);
            setImageError(true);
          }}
        />
        
        {imageError && (
          <div style={{
            padding: '40px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '8px',
            color: '#666',
            textAlign: 'center',
            marginBottom: '0'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              color: '#d1d5db'
            }}>
              📷
            </div>
            <div>Image could not be loaded</div>
            <button
              onClick={() => {
                setImageError(false);
                setImageLoaded(false);
                // Force image reload by changing src
                const img = document.querySelector('img[alt="Math Formula Reference"]') as HTMLImageElement;
                if (img) {
                  const src = img.src;
                  img.src = '';
                  img.src = src;
                }
              }}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
      
      {/* Reference Facts */}
      {!contentLoaded ? (
        <FactsSkeleton />
      ) : (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            color: '#333',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Important Mathematical Facts
          </h2>
          
          <div style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#444'
          }}>
            <p style={{ margin: '8px 0' }}>
              • The number of degrees of arc in a circle is 360.
            </p>
            <p style={{ margin: '8px 0' }}>
              • The number of radians of arc in a circle is 2π.
            </p>
            <p style={{ margin: '8px 0' }}>
              • The sum of the measures in degrees of the angles of a triangle is 180.
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default TestReferencePage; 