'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, Briefcase, FileText, CheckCircle2, XCircle, ChevronRight, FileSearch } from 'lucide-react';
import { calculateJobFit, JobFitMatchResult } from '@/lib/ai/scoring/jobFit';

interface Resume {
  id: string;
  title: string;
}

export default function AIMatchPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobFitMatchResult | null>(null);
  const [interviewPrep, setInterviewPrep] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'match' | 'interview' | 'resume'>('match');
  
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
      setActiveTab('match');
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
    <>
      {/* Page Header */}
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/15">
          <FileSearch size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            AI Resume Match
          </h1>
          <p className="text-sm text-slate-400 mt-1">Analyze how well your resume fits a specific job description</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Form Inputs Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-6 rounded-2xl shadow-xl transition-all">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-400" />
              Select Your Resume
            </label>
            <select
              className="w-full rounded-xl border-slate-850 border bg-slate-955/80 px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium appearance-none cursor-pointer"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              <option value="" className="bg-slate-950">-- Choose a resume --</option>
              {resumes.map(r => (
                <option key={r.id} value={r.id} className="bg-slate-950">{r.title}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-6 rounded-2xl shadow-xl transition-all">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-400" />
              Job Description
            </label>
            <textarea
              className="w-full rounded-xl border-slate-850 border bg-slate-955/80 px-4 py-4 text-slate-250 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 transition-all h-72 resize-none text-sm leading-relaxed"
              placeholder="Paste the target job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isLoading || resumes.length === 0}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-6 py-4.5 rounded-xl font-bold text-base transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running ATS Analysis...</span>
              </>
            ) : (
              <>
                <span>Analyze Match</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {result ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 p-8 rounded-2xl shadow-xl h-full animate-in zoom-in-95 duration-500 space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-6 border-b border-slate-850/60">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-slate-850"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="54"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={result.score >= 75 ? "text-emerald-400" : result.score >= 50 ? "text-amber-400" : "text-rose-400"}
                      strokeWidth="8"
                      strokeDasharray={339.3}
                      strokeDashoffset={339.3 - (339.3 * result.score) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="54"
                      cx="64"
                      cy="64"
                      style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-extrabold text-slate-100">
                    {result.score}%
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-extrabold text-white">ATS Match Score</h3>
                  <p className="text-sm text-slate-400 mt-1">Based on keyword matching and semantic analysis.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-200 mb-3 flex items-center text-sm uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 mr-2" />
                    Matching Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.length > 0 ? result.matchingSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-350 rounded-lg text-xs font-bold border border-emerald-500/20 shadow-sm">
                        {skill}
                      </span>
                    )) : <span className="text-slate-500 text-xs italic">No specific matching skills identified.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 mb-3 flex items-center text-sm uppercase tracking-wider">
                    <XCircle className="w-4.5 h-4.5 text-rose-400 mr-2" />
                    Missing Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? result.missingSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-350 rounded-lg text-xs font-bold border border-rose-500/20 shadow-sm">
                        {skill}
                      </span>
                    )) : <span className="text-slate-500 text-xs italic">No missing skills identified! Great job.</span>}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 mb-2 text-sm uppercase tracking-wider">Suggestions for Improvement</h4>
                  <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10 text-amber-300/80 text-sm leading-relaxed font-medium">
                    {result.suggestions}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-slate-200 mb-2 text-sm uppercase tracking-wider">Summary</h4>
                  <div className="bg-slate-955 p-4 rounded-xl border border-slate-850 text-slate-400 text-sm leading-relaxed">
                    {result.summary}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/30 border border-slate-850 border-dashed rounded-2xl h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
              <div className="w-20 h-20 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg mb-6 animate-pulse text-indigo-400">
                <FileSearch className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">Ready to Analyze</h3>
              <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
                Select your resume and paste a job description to see how well you match the role.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
