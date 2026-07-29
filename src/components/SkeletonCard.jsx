import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel p-3.5 flex flex-col gap-3.5 group animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full h-[180px] sm:h-[220px] rounded-xl overflow-hidden bg-[#EAE5D9]">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[#FDFBF7]/40 to-transparent"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-col gap-2.5 px-1 pb-1">
        {/* Date Badge & Category */}
        <div className="flex justify-between items-start">
          <div className="h-10 w-10 bg-[#EAE5D9] rounded-lg"></div>
          <div className="h-6 w-20 bg-[#EAE5D9] rounded-full"></div>
        </div>

        {/* Title */}
        <div className="h-7 w-3/4 bg-[#EAE5D9] rounded-lg mt-1"></div>

        {/* Organizer */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-5 h-5 bg-[#EAE5D9] rounded-full"></div>
          <div className="h-4 w-1/3 bg-[#EAE5D9] rounded-md"></div>
        </div>

        {/* Footer (Spots & Location) */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EAE5D9]">
          <div className="h-4 w-1/4 bg-[#EAE5D9] rounded-md"></div>
          <div className="h-4 w-1/3 bg-[#EAE5D9] rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
