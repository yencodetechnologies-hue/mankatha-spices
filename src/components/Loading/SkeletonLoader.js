import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="skeleton h-48 w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="flex justify-between items-center">
                <div className="skeleton h-4 w-1/4 rounded" />
                <div className="skeleton h-3 w-1/6 rounded" />
              </div>
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>
        );
      
      case 'button':
        return <div className="skeleton h-10 w-32 rounded-lg" />;
      
      case 'circle':
        return <div className="skeleton w-12 h-12 rounded-full" />;
      
      case 'input':
        return <div className="skeleton h-10 w-full rounded-lg" />;
      
      default:
        return <div className="skeleton h-20 w-full rounded" />;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="fade-in">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
