import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampusSphere3D from '../components/3d/CampusSphere3D';
import { collegeApi, discoverApi } from '../services/api';
import { GraduationCap, Users, MapPin, ArrowRight, Sparkles } from 'lucide-react';

export default function Campus3DPage() {
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('iitr');
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    collegeApi.getColleges()
      .then(res => setColleges(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedCollegeId) return;
    setLoading(true);
    discoverApi.getCandidates({ collegeId: selectedCollegeId })
      .then(res => {
        setCollegeStudents(res.data.candidates || []);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCollegeId]);

  const activeCollege = colleges.find(c => c.id === selectedCollegeId) || colleges[0];

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 text-pink-50">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>Campus Network Orbit</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/35 shadow-glow-pink">
            Interactive
          </span>
        </h1>
        <p className="text-xs text-pink-200/70 mt-1">
          Explore connected campus spheres. Click any university orb to discover student peers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Sphere Explorer */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <CampusSphere3D
            selectedCollegeId={selectedCollegeId}
            onSelectCollege={(id) => setSelectedCollegeId(id)}
          />

          {/* Quick College Select Pills in Pink */}
          <div className="flex flex-wrap gap-2 pt-2">
            {colleges.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedCollegeId(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                  selectedCollegeId === col.id
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-400 shadow-glow-pink font-bold'
                    : 'bg-pink-500/5 hover:bg-pink-500/15 text-pink-200/70 border-pink-500/15'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{col.shortName || col.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active College Information & Student Roster */}
        <div className="lg:col-span-5 glass-panel-elevated p-6 rounded-3xl border border-pink-500/25 shadow-2xl">
          {activeCollege && (
            <div className="mb-6 pb-6 border-b border-pink-500/15">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[11px] font-bold text-pink-300 uppercase tracking-wider">Active Campus</span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{activeCollege.name}</h2>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200">
                  Est. {activeCollege.established || '2000'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-pink-200/60">
                <MapPin className="w-3.5 h-3.5 text-pink-400" />
                <span>{activeCollege.city || 'Roorkee, Uttarakhand'}</span>
                <span>•</span>
                <span>{activeCollege.type}</span>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-pink-400" />
                <span>Students from {activeCollege?.shortName || 'this campus'}</span>
              </h3>
              <span className="text-xs text-pink-300/70">{collegeStudents.length} profiles</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-pink-300/60">Loading students...</div>
            ) : collegeStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-pink-300/60">
                No active profiles for this college yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {collegeStudents.map((stud) => (
                  <div
                    key={stud.userId}
                    onClick={() => navigate('/discover')}
                    className="p-3 rounded-2xl bg-pink-500/5 hover:bg-pink-500/15 border border-pink-500/10 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={stud.avatarUrl}
                        alt={stud.displayName}
                        className="w-11 h-11 rounded-xl object-cover border border-pink-400/40"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{stud.displayName}, {stud.age}</span>
                          <span className="text-[10px] text-pink-300/60 font-normal">({stud.year})</span>
                        </div>
                        <div className="text-[11px] text-pink-200/60 truncate max-w-[180px]">{stud.course}</div>
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-xl bg-pink-500/20 text-pink-300 hover:bg-pink-500/30"
                      title="View in Swipe Deck"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
