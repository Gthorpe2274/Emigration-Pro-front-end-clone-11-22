import React from 'react';

interface ReportGeneratorProps {
  title: string;
  loadingMessage: string;
  completedSections: number;
  totalSections: number;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ title, loadingMessage, completedSections, totalSections }) => {
    const progressPercentage = totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
            <p className="text-slate-600 mb-6 max-w-md">Our AI is conducting thorough research based on your profile. This may take a moment.</p>
            
            <div className="w-full max-w-sm bg-slate-200 rounded-full h-2.5 mb-2">
                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
            
            <p className="text-sm text-indigo-700 font-medium">{loadingMessage}</p>
        </div>
    );
};

export default ReportGenerator;