import React from 'react';
import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ message, showAction = true }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FAF7F2] rounded-3xl border-2 border-[#E6DFD3] border-dashed my-8 mx-auto w-full max-w-2xl">
      <div className="w-20 h-20 bg-[#F4F0E8] rounded-full flex items-center justify-center mb-6">
        <Compass size={40} className="text-[#92400E] opacity-80" />
      </div>
      <h3 className="text-xl font-bold text-[#291002] mb-3">No Events Found</h3>
      <p className="text-sm text-[#78350F] max-w-md mb-8">
        {message || "We couldn't find any meetups matching your search in this area. Why not be the first to host one?"}
      </p>
      {showAction && (
        <button
          onClick={() => navigate('/create')}
          className="bg-[#E05236] text-white px-8 py-3 rounded-full font-bold shadow-[4px_4px_0px_0px_#121212] border-2 border-[#121212] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#121212] transition-all active:translate-y-0 active:shadow-none"
        >
          Host a Meetup
        </button>
      )}
    </div>
  );
};

export default EmptyState;
