import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Code2, Zap, Trophy, ExternalLink,
  Bookmark, BookmarkCheck, ChevronDown, Plus, CheckCircle2,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { connectionService } from "../../services/connectionService";
import { scoreBadgeColor, devTypeBadge } from "./helpers";

export default function DeveloperCard({ dev, shortlists, onAddToShortlist, onRemoveFromShortlist }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectStatus, setConnectStatus] = useState("idle");
  const ref = useRef(null);

  const inShortlist = shortlists.some(s => s.developers?.some(d => d.githubId === dev.githubId));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectStatus("idle");
    try {
      await connectionService.requestConnection(dev.username, `Let's connect regarding your profile on SkillHire.`);
      setConnectStatus("sent");
    } catch (err) {
      setConnectStatus(err.response?.data?.error || "Failed to send request");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="group rounded-xl border border-border bg-card hover:border-primary/30 transition-all p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link to={`/profile/${dev.username}`} target="_blank">
          <Avatar src={dev.avatarUrl} name={dev.username} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/profile/${dev.username}`} target="_blank"
              className="font-semibold text-sm hover:text-primary transition-colors truncate">
              {dev.username}
            </Link>
            {dev.developerType && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${devTypeBadge(dev.developerType)}`}>
                {dev.developerType}
              </span>
            )}
          </div>
          {(dev.college || dev.branch) && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {[dev.college, dev.branch, dev.graduationYear].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-lg border flex-shrink-0 ${scoreBadgeColor(dev.overallScore)}`}>
          {Math.round(dev.overallScore)}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-500" /> {dev.totalStars ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Code2 className="w-3 h-3 text-blue-500" /> {dev.repoCount ?? 0} repos
        </span>
        {dev.primaryLanguage && (
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-primary" /> {dev.primaryLanguage}
          </span>
        )}
        {dev.leetcodeScore > 0 && (
          <span className="flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" /> LC {dev.leetcodeScore}
          </span>
        )}
      </div>

      {/* Skills */}
      {dev.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {dev.skills.slice(0, 6).map(skill => (
            <span key={skill} className="px-2 py-0.5 rounded-md bg-secondary text-xs text-muted-foreground">
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
        <Link to={`/profile/${dev.username}`} target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border hover:bg-secondary transition-colors shrink-0 whitespace-nowrap">
          <ExternalLink className="w-3 h-3" /> View Profile
        </Link>

        <button
          onClick={handleConnect}
          disabled={connecting || connectStatus === "sent"}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-60 shrink-0 whitespace-nowrap"
        >
          {connectStatus === "sent" ? "Requested" : connecting ? "Sending..." : "Connect"}
        </button>

        <div className="relative ml-auto shrink-0" ref={ref}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap ${inShortlist
                ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                : "bg-secondary border border-border hover:border-primary/30"
              }`}
          >
            {inShortlist ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            {inShortlist ? "Shortlisted" : "Shortlist"}
            <ChevronDown className="w-3 h-3" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 bottom-full mb-1 w-52 bg-card border border-border rounded-xl shadow-xl py-1.5 z-10"
              >
                {shortlists.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-muted-foreground">No shortlists yet</p>
                ) : shortlists.map(list => {
                  const isIn = list.developers?.some(d => d.githubId === dev.githubId);
                  return (
                    <button
                      key={list._id}
                      onClick={() => {
                        isIn
                          ? onRemoveFromShortlist(list._id, dev.githubId)
                          : onAddToShortlist(list._id, dev.githubId);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary transition-colors text-left"
                    >
                      {isIn
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        : <Plus className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
                      <span className="truncate">{list.name}</span>
                      <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                        {list.developers?.length ?? 0}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {connectStatus && connectStatus !== "sent" && connectStatus !== "idle" && (
        <p className="text-xs text-destructive">{connectStatus}</p>
      )}
    </div>
  );
}
