import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Range } from 'react-range';
import { useNavigate } from 'react-router-dom';  // <-- Import useNavigate

const getRankLabel = (score) => {
  return '';
};

const Existing = () => {
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [searchedResumes, setSearchedResumes] = useState([]);
  const [orgId] = useState('2');
  const [executionId, setExecutionId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keySkillQuery, setKeySkillQuery] = useState('');
  const [scoreRange, setScoreRange] = useState([1, 10]);
  const [experienceRange, setExperienceRange] = useState([0, 35]); // Adjusted max to 50
  const [filterEmail, setFilterEmail] = useState(false);
  const [filterPhone, setFilterPhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate(); // <-- Initialize navigate hook

  // Load from localStorage after a search
  useEffect(() => {
    if (!searched) return;

    const orgKey = orgId.trim();
    const execKey = executionId.trim();
    const key = orgKey ? `resumeResults_org_${orgKey}` : `resumeResults_id_${execKey}`;

    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSearchedResumes(parsed);
      } catch (e) {
        console.error('Failed to parse local resume data', e);
      }
    }
  }, [orgId, executionId, searched]);

// // Fetch by org_id (Case ID)
const fetchResumesByOrgId = useCallback(async () => {

  setSearched(true);
  setLoading(true);
  setError('');

  try {
    const url = `https://agentic-ai.co.in/api/agentic-ai/workflow-exe?org_id=2&workflow_id=resume_ranker`;
    const response = await fetch(url);
    const data = await response.json();

    const resumesData = Array.isArray(data.data)
      ? data.data.flatMap(item => Array.isArray(item.result) ? item.result.map(res => ({
          ...res,
          exeSkill: item.exe_name // Keep track of skill from exe_name
        })) : [])
      : [];

    const exeSkill = data.data[0]?.exe_name || '';

    if (!resumesData.length) {
      setError('No resumes found for this Case ID.');
      setSearchedResumes([]);
      return;
    }

    const mappedResumes = resumesData.map((item, idx) => ({
      id: idx,
      name: item.name || `Candidate ${idx + 1}`,
      Rank: item.score || 0,
      justification: item.justification || '',
      experience: typeof item.experience === 'number' ? item.experience : 0,
      email: item.email === 'xxx' ? 'No email' : item.email || 'No email',
      phone: item.phone === 'xxx' ? 'No phone' : item.phone || 'No phone',
      keySkills: Array.isArray(item.keySkills) ? item.keySkills : [item.exeSkill || '']
    }));

    setSearchedResumes(mappedResumes);
    localStorage.setItem(`resumeResults_org_${orgId.trim()}`, JSON.stringify(mappedResumes));
  } catch (err) {
    console.error(err);
    setError('Error retrieving resumes.');
    setSearchedResumes([]);
  } finally {
    setLoading(false);
  }
}, [orgId]);

const fetchResumesByExecutionId = useCallback(async () => {
  if (!executionId.trim() || !orgId.trim()) {
    setError('Please enter both Case ID and Execution ID.');
    setSearchedResumes([]);
    return;
  }

  setSearched(true);
  setLoading(true);
  setError('');

  try {
    const url = `https://agentic-ai.co.in/api/agentic-ai/workflow-exe?org_id=2&workflow_id=resume_ranker`;
    const response = await fetch(url);
    const data = await response.json();

    // ✅ Filter the execution with the matching ID
    const matchedExecution = Array.isArray(data.data)
      ? data.data.find(item => item.id.toString() === executionId.trim())
      : null;

    if (!matchedExecution || !matchedExecution.result) {
      setError('Invalid response from server.');
      setSearchedResumes([]);
      return;
    }

    const resumesData = Array.isArray(matchedExecution.result) ? matchedExecution.result : [];
    const exeSkill = matchedExecution.exe_name || '';

    if (!resumesData.length) {
      setError('No resumes found for this Execution ID.');
      setSearchedResumes([]);
      return;
    }

    const mappedResumes = resumesData.map((item, idx) => ({
      id: idx,
      name: item.name || `Candidate ${idx + 1}`,
      Rank: item.score || 0,
      justification: item.justification || '',
      experience: typeof item.experience === 'number' ? item.experience : 0,
      email: item.email === 'xxx' ? 'No email' : item.email || 'No email',
      phone: item.phone === 'xxx' ? 'No phone' : item.phone || 'No phone',
      keySkills: Array.isArray(item.keySkills) ? item.keySkills : [exeSkill],
    }));

    setSearchedResumes(mappedResumes);
    localStorage.setItem(`resumeResults_id_${executionId.trim()}`, JSON.stringify(mappedResumes));
  } catch (err) {
    console.error(err);
    setError('Error retrieving resumes.');
    setSearchedResumes([]);
  } finally {
    setLoading(false);
  }
}, [executionId, orgId]);


  const combinedResumes = useMemo(() => [...uploadedResumes, ...searchedResumes], [
    uploadedResumes,
    searchedResumes,
  ]);

  const filteredResumes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const skillQuery = keySkillQuery.toLowerCase().trim();

    return combinedResumes.filter((r) => {
      const rank = Number(r.Rank) || 0;

      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        (r.email && r.email.toLowerCase().includes(q)) ||
        (r.justification && r.justification.toLowerCase().includes(q));

      const matchesSkill = skillQuery
        ? r.keySkills.some((skill) => skill.toLowerCase().includes(skillQuery))
        : true;

      const inScoreRange = rank >= scoreRange[0] && rank <= scoreRange[1];
      const inExpRange = r.experience >= experienceRange[0] && r.experience <= experienceRange[1];

      const hasEmail = filterEmail ? (r.email && r.email !== 'No email') : true;
      const hasPhone = filterPhone ? (r.phone && r.phone !== 'No phone') : true;

      return matchesSearch && matchesSkill && inScoreRange && inExpRange && hasEmail && hasPhone;
    });
  }, [searchQuery, keySkillQuery, scoreRange, experienceRange, filterEmail, filterPhone, combinedResumes]);

  const renderScoreThumb = ({ index, props }) => (
    <div {...props} key={index} className="h-5 w-5 rounded-full bg-orange-400 shadow-md cursor-pointer" />
  );

  //user key skills from localStorage
  const allKeySkills = useMemo(() => {
  return [...new Set(combinedResumes.flatMap(r => r.keySkills || []))];
}, [combinedResumes]);

const handleShortlist = async (candidate) => {
  try {
    setLoadingId(candidate.id);

    const res = await fetch("/api/send-email", {  // double-check endpoint name here
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: candidate.name || 'No name',
        email: candidate.email || 'No email',
        phone: candidate.phone || 'No phone',
        experience: candidate.experience || 0,
        score: candidate.score || candidate.Rank || 0,
        description: candidate.justification || 'No description provided',
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setSearchedResumes((prev) =>
        prev.map((res) =>
          res.id === candidate.id ? { ...res, shortlisted: true } : res
        )
      );

      alert(`✅ Candidate ${candidate.name} sent to QNTRL.`);
    } else {
      alert(`❌ Failed: ${data?.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    alert("⚠️ Error sending email. Please try again.");
  } finally {
    setLoadingId(null);
  }
};


  return (
  
    <div className="min-h-screen w-full bg-white p-4">
  <div className="shadow-lg rounded-xl w-full p-4 flex flex-col md:flex-row gap-6">
    {/* Sidebar Filters */}
    <div className="w-full md:w-64 bg-gray-700 rounded-xl p-4 shadow-md flex-shrink-0 text-[#EAEAEA]">
      <h3 className="font-bold mb-5 text-xl">🔍 Filter Options</h3>

      {/* Search by Execution ID (id) */}
      <form
        className="mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          fetchResumesByExecutionId();
        }}
      >
        <label className="font-semibold block mb-2">Case ID</label>
        <input
          type="text"
          placeholder="Enter Case ID"
          value={executionId}
          onChange={(e) => setExecutionId(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-2 border border-gray-600 bg-white text-gray-600 rounded-md"
        />
        <button
          type="submit"
          disabled={loading || !executionId.trim()}
          className="mt-2 bg-orange-400 hover:bg-[#E14A42] text-white font-bold px-4 py-2 rounded-md w-full disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search by ID"}
        </button>
        {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
      </form>

      {/* Other filters */}
      <input
        type="text"
        placeholder="Search ..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        disabled={loading}
        className="mb-4 px-4 py-3 rounded-lg border border-gray-600 bg-white text-gray-500 focus:outline-none"
      />

           {/* Key skills */}
      <div className="mt-6">
        <h3 className="font-bold mb-3 text-lg">🛠️ Key Skills</h3>
        <div className="flex flex-wrap gap-2 bg-white border border-gray-700 rounded-md p-3 shadow-inner min-h-[40px]">
          {allKeySkills.length > 0 ? (
            allKeySkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-orange-400 text-white text-xs font-medium rounded-lg"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No key skills available</p>
          )}
        </div>
      </div>

      <label className="font-semibold mb-3 block text-lg">Score Range</label>
      <div className="flex justify-between mb-3 font-semibold text-sm">
        <span>{scoreRange[0]}</span>
        <span>{scoreRange[1]}</span>
      </div>

      {/* Score range bar (red accent) */}
      <Range
        step={1}
        min={1}
        max={10}
        values={scoreRange}
        onChange={setScoreRange}
        renderTrack={({ props, children }) => (
          <div {...props} style={{ ...props.style, height: "6px", backgroundColor: "#555" }}>
            <div
              style={{
                height: "6px",
                backgroundColor: "#fb923c",
                marginLeft: `${((scoreRange[0] - 1) / 9) * 100}%`,
                width: `${((scoreRange[1] - scoreRange[0]) / 9) * 100}%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={renderScoreThumb}
      />

      <label className="font-semibold mt-6 mb-3 block text-lg">Experience (years)</label>
      <div className="flex justify-between mb-3 font-semibold text-sm">
        <span>{experienceRange[0]}</span>
        <span>{experienceRange[1]}</span>
      </div>
      <Range
        step={1}
        min={0}
        max={35}
        values={experienceRange}
        onChange={setExperienceRange}
        renderTrack={({ props, children }) => (
          <div {...props} style={{ ...props.style, height: "6px", backgroundColor: "#555" }}>
            <div
              style={{
                height: "6px",
                width: `${((experienceRange[1] - experienceRange[0]) / 35) * 100}%`,
                backgroundColor: "#fb923c",
                marginLeft: `${(experienceRange[0] / 35) * 100}%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={renderScoreThumb}
      />

      {/* Email/Phone filters */}
      <div className="mt-6 flex flex-row gap-x-6">
        <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={filterEmail}
            onChange={() => setFilterEmail(!filterEmail)}
            className="rounded border-gray-400 text-[#FF5A52] focus:ring-[#FF5A52]"
            disabled={loading}
          />
          Email
        </label>
        <label className="inline-flex items-center gap-2 font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={filterPhone}
            onChange={() => setFilterPhone(!filterPhone)}
            className="rounded border-gray-400 text-[#FF5A52]"
            disabled={loading}
          />
          Phone
        </label>
      </div>
    </div>

{/* Resume List */}
<motion.div layout className="flex-1 space-y-6 overflow-auto max-h-[80vh]">
  <div className="flex items-center justify-between mb-1">
    <h2 className="text-3xl font-semibold text-[#333333]">📄 Talent Sift</h2>
  </div>

  <div className="flex justify-between items-center mb-4">
    <p className="text-orange-400 font-medium">
      Showing {filteredResumes.length} result
      {filteredResumes.length !== 1 ? "s" : ""}
    </p>

    {/* Navigation Buttons */}
    <div className="w-full max-w-6xl mb-4 flex gap-4 justify-end">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-orange-400 hover:bg-[#E14A42] text-white font-bold rounded"
      >
        Home
      </button>

      <button
        onClick={() =>
          (window.location.href =
            "https://core.qntrl.com/blueprint/startitnow/job/processtab/30725000001415521/30725000000000419")
        }
        className="px-6 py-3 bg-orange-400 hover:bg-[#E14A42] text-white font-bold rounded"
      >
        Candidate Management
      </button>
    </div>
  </div>

  {/* Resume Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {filteredResumes.map((resume) => (
      <motion.div
        key={resume.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-md p-5 flex flex-col relative"
      >
        {/* ✅ Shortlist Button in top-right */}
        {!resume.shortlisted && (
          <button
            onClick={() => handleShortlist(resume)}
            disabled={loadingId === resume.id}
            className={`absolute top-2 right-2 px-3 py-1 rounded-md font-bold text-m transition ${
              loadingId === resume.id
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-orange-400 hover:bg-[#E14A42] text-white"
            }`}
          >
            {loadingId === resume.id ? "..." : "Shortlist"}
          </button>
        )}

        {/* ✅ Shortlisted Badge */}
        {resume.shortlisted && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
            ✅ Shortlisted
          </div>
        )}

        {/* Candidate Info */}
        <h3 className="text-xl font-semibold text-[#333333] mb-2">
          {resume.name}
        </h3>
        <p className="text-sm text-[#333333] mb-1">
          <strong>Score:</strong> {resume.Rank}
        </p>
        <p className="text-sm text-[#333333] mb-1">
          <strong>Experience:</strong> {resume.experience} years
        </p>
        <p className="text-sm text-[#555555] mb-1">
          <strong>Email:</strong> {resume.email}
        </p>
        <p className="text-sm text-[#555555] mb-3">
          <strong>Phone:</strong> {resume.phone}
        </p>

        {/* ✅ Justification */}
        {resume.justification && (
          <p className="text-sm text-[#555555] italic mt-3 leading-relaxed">
            "{resume.justification}"
          </p>
        )}
      </motion.div>
    ))}
  </div>
</motion.div>
  </div>
  </div>
  );
}

export default Existing;
