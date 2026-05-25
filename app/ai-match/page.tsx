'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, Briefcase, FileText, CheckCircle2, XCircle, ChevronRight, FileSearch } from 'lucide-react';
import { ResumeMatchResult } from '@/lib/ai/matcher';

interface Resume {
  id: string;
  title: string;
}

export default function AIMatchPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResumeMatchResult | null>(null);
  
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await axios.get('/api/resumes');
        setResumes(response.data);
      } catch (error) {
        console.error('Failed to fetch resumes:', error);
        toast.error('Failed to load resumes. Make sure you are logged in.');
      }
    };
    fetchResumes();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume.');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post('/api/ai/match', {
        resumeId: selectedResumeId,
        jobDescription
      });
      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error: unknown) {
      const err = error as any;
      console.error('Match error:', err);
      toast.error(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
      <div className="flex items-center space-x-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
          <FileSearch size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AI Resume Match</h1>
          <p className="text-gray-500 mt-1">Analyze how well your resume fits a specific job description</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              Select Your Resume
            </label>
            <select
              className="w-full rounded-2xl border-gray-200 border-2 px-4 py-3 bg-gray-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-gray-700 font-medium"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              <option value="">-- Choose a resume --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-500" />
              Job Description
            </label>
            <textarea
              className="w-full rounded-2xl border-gray-200 border-2 px-4 py-4 bg-gray-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none h-72 resize-none text-gray-700 font-medium"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || resumes.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-5 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Running ATS Analysis...</span>
              </>
            ) : (
              <>
                <span>Analyze Match</span>
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>

        <div>
          {result ? (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 h-full animate-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center text-center mb-8 pb-8 border-b border-gray-100">
                <div className="relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      className="text-gray-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="80"
                      cy="80"
                    />
                    <circle
                      className={result.score >= 75 ? "text-emerald-500" : result.score >= 50 ? "text-amber-500" : "text-rose-500"}
                      strokeWidth="10"
                      strokeDasharray={440}
                      strokeDashoffset={440 - (440 * result.score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="70"
                      cx="80"
                      cy="80"
                      style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-gray-800">
                    {result.score}%
                  </div>
                </div>
                <h3 className="text-2xl font-bold mt-6 text-gray-800">ATS Match Score</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center text-lg">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2" />
                    Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.length > 0 ? result.matchingSkills.map((skill, i) => (
                      <span key={i} className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-semibold border border-emerald-200 shadow-sm">
                        {skill}
                      </span>
                    )) : <span className="text-gray-500 text-sm italic">No specific matching skills identified.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center text-lg">
                    <XCircle className="w-6 h-6 text-rose-500 mr-2" />
                    Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? result.missingSkills.map((skill, i) => (
                      <span key={i} className="px-4 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-sm font-semibold border border-rose-200 shadow-sm">
                        {skill}
                      </span>
                    )) : <span className="text-gray-500 text-sm italic">No missing skills identified! Great job.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Suggestions for Improvement</h4>
                  <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-amber-900 leading-relaxed font-medium">
                    {result.suggestions}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 text-lg">Summary</h4>
                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-gray-700 leading-relaxed">
                    {result.summary}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md mb-6 animate-pulse">
                <FileSearch className="w-12 h-12 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">Ready to Analyze</h3>
              <p className="text-gray-500 max-w-sm text-lg">
                Select your resume and paste a job description to see how well you match the role.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
