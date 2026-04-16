import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Filter, RefreshCw, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { SORT_OPTIONS } from "./constants";
import FilterPanel from "./FilterPanel";
import DeveloperCard from "./DeveloperCard";

const API = import.meta.env.VITE_API_URL;

export default function SearchTab({ shortlists, onAddToShortlist, onRemoveFromShortlist }) {
  //search results 
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(true);

  // filter state
  const [q, setQ] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [developerType, setDeveloperType] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [college, setCollege] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    selectedSkills.length > 0, developerType, college, branch, batch,
    minScore > 0, maxScore < 100,
  ].filter(Boolean).length;

  // search logic 
  const doSearch = useCallback(async (pageNum = 1) => {
    setSearching(true);
    try {
      const params = new URLSearchParams({
        page: pageNum, limit: 20, sortBy,
        ...(q && { q }),
        ...(selectedSkills.length && { skills: selectedSkills.join(",") }),
        ...(developerType && { developerType }),
        minScore, maxScore,
        ...(college && { college }),
        ...(branch && { branch }),
        ...(batch && { batch }),
      });
      const res = await axios.get(`${API}/api/recruiter/search?${params}`, { withCredentials: true });
      setResults(res.data.results || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  }, [q, selectedSkills, developerType, minScore, maxScore, college, branch, batch, sortBy]);

  // debounced auto-search
  useEffect(() => {
    const timer = setTimeout(() => doSearch(1), 400);
    return () => clearTimeout(timer);
  }, [doSearch]);

  // skill helpers 
  const toggleSkill = (skill) =>
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );

  const addSkillFromInput = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const skill = skillInput.trim().replace(/,$/, "");
      if (skill && !selectedSkills.includes(skill))
        setSelectedSkills(prev => [...prev, skill]);
      setSkillInput("");
    }
  };

  const resetFilters = () => {
    setSelectedSkills([]); setDeveloperType(""); setMinScore(0); setMaxScore(100);
    setCollege(""); setBranch(""); setBatch("");
  };

  return (
    <motion.div key="search"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="space-y-4">

      {/* Search bar */}
      <form onSubmit={e => { e.preventDefault(); doSearch(1); }} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search by username or skills…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary hidden sm:block">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button type="button" onClick={() => setShowFilters(v => !v)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm transition-colors ${activeFiltersCount
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}>
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <button type="submit" disabled={searching}
          className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {/* Filter panel */}
      <FilterPanel
        open={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={() => { setShowFilters(false); doSearch(1); }}
        onReset={resetFilters}
        developerType={developerType} setDeveloperType={setDeveloperType}
        minScore={minScore} setMinScore={setMinScore}
        maxScore={maxScore} setMaxScore={setMaxScore}
        batch={batch} setBatch={setBatch}
        college={college} setCollege={setCollege}
        branch={branch} setBranch={setBranch}
        selectedSkills={selectedSkills}
        skillInput={skillInput} setSkillInput={setSkillInput}
        onToggleSkill={toggleSkill}
        onAddSkillFromInput={addSkillFromInput}
      />

      {/* Results summary */}
      {!searching && total > 0 && (
        <p className="text-sm text-muted-foreground">
          Found <span className="font-semibold text-foreground">{total.toLocaleString()}</span> developers
        </p>
      )}

      {/* Results grid */}
      {searching ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No developers found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map(dev => (
            <DeveloperCard
              key={dev.githubId}
              dev={dev}
              shortlists={shortlists}
              onAddToShortlist={onAddToShortlist}
              onRemoveFromShortlist={onRemoveFromShortlist}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {pages} · {total} developers
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => doSearch(page - 1)} disabled={page === 1}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => doSearch(page + 1)} disabled={page === pages}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
