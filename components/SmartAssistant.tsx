
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Employee, MonthlyRoster, ShiftType } from '../types';

interface SmartAssistantProps {
  roster: MonthlyRoster;
  employees: Employee[];
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ roster, employees }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const analyzeSchedule = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Analyze this CSSD Roster for ${roster.month + 1}/${roster.year}.
        Employees: ${employees.map(e => e.name).join(', ')}.
        Total records: ${roster.records.length}.
        
        Provide a short 3-sentence summary in Indonesian about the workload distribution and any potential staffing gaps for the 3 main shifts (Pagi, Sore, Malam).
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text);
    } catch (error) {
      console.error(error);
      setInsight("Gagal menganalisis jadwal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mt-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
          AI Roster Assistant
        </h4>
        <button
          onClick={analyzeSchedule}
          disabled={loading}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Menganalisis...' : 'Analisis Jadwal'}
        </button>
      </div>
      {insight && (
        <div className="mt-2 text-sm text-indigo-800 leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-50">
          {insight}
        </div>
      )}
      {!insight && !loading && (
        <p className="text-xs text-indigo-400 italic">Gunakan AI untuk memeriksa keseimbangan shift atau mencari konflik jadwal.</p>
      )}
    </div>
  );
};
