import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaticPage = ({ title, content }) => {
  const navigate = useNavigate();

  return (
    <div className="flex-grow bg-[#FAF7F2] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#78350F] hover:text-[#E05236] font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white rounded-3xl border-2 border-[#121212] shadow-[8px_8px_0_0_#121212] p-8 md:p-12">
          <h1 className="text-4xl font-black text-[#291002] mb-8">{title}</h1>
          <div className="prose prose-orange max-w-none text-[#5C2D12]">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
