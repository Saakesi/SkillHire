import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Bookmark, RefreshCw, X,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { scoreBadgeColor } from "./helpers";

export default function ShortlistsTab({
  shortlists,
  shortlistsLoading,
  onCreateShortlist,
  onDeleteShortlist,
  onRemoveFromShortlist,
}) {
  const [activeShortlist, setActiveShortlist] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreatingList(true);
    await onCreateShortlist(newListName.trim(), newListDesc.trim());
    setNewListName(""); setNewListDesc("");
    setCreatingList(false);
  };

  const handleDelete = (id) => {
    onDeleteShortlist(id);
    if (activeShortlist?._id === id) setActiveShortlist(null);
  };

  // keep activeShortlist in sync when shortlists data updates
  const syncedActive = activeShortlist
    ? shortlists.find(s => s._id === activeShortlist._id) ?? null
    : null;

  return (
    <motion.div key="shortlists"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      className="space-y-5">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel: create + list */}
        <div className="space-y-4">
          {/* Create form */}
          <form onSubmit={handleCreate}
            className="rounded-xl border border-dashed border-border p-4 space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" /> New Shortlist
            </h3>
            <input
              value={newListName} onChange={e => setNewListName(e.target.value)}
              placeholder="List name *"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={newListDesc} onChange={e => setNewListDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button type="submit" disabled={creatingList || !newListName.trim()}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {creatingList ? "Creating…" : "Create List"}
            </button>
          </form>

          {/* Shortlist items */}
          {shortlistsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
            </div>
          ) : shortlists.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground">
              No shortlists yet. Create one above.
            </p>
          ) : shortlists.map(list => (
            <button key={list._id}
              onClick={() => setActiveShortlist(activeShortlist?._id === list._id ? null : list)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${activeShortlist?._id === list._id
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:border-primary/20"
                }`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{list.name}</p>
                  {list.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{list.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full font-mono">
                    {list.developers.length}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(list._id); }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right panel: developers in selected shortlist */}
        <div className="lg:col-span-2">
          {!syncedActive ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Bookmark className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium text-muted-foreground">Select a shortlist to view developers</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold">
                {syncedActive.name}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({syncedActive.developers.length} developers)
                </span>
              </h3>

              {syncedActive.developers.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                  No developers in this list yet. Add them from Search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {syncedActive.developers.map(dev => (
                    <div key={dev.githubId}
                      className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
                      <Link to={`/profile/${dev.username}`} target="_blank">
                        <Avatar src={dev.avatarUrl} name={dev.username} size="sm" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${dev.username}`} target="_blank"
                          className="font-semibold text-sm hover:text-primary truncate block">
                          {dev.username}
                        </Link>
                        <p className="text-xs text-muted-foreground">{dev.developerType}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {dev.skills?.slice(0, 3).map(s => (
                            <span key={s} className="text-xs px-1.5 py-0.5 bg-secondary rounded">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${scoreBadgeColor(dev.overallScore)}`}>
                          {Math.round(dev.overallScore)}
                        </span>
                        <button
                          onClick={() => onRemoveFromShortlist(syncedActive._id, dev.githubId)}
                          className="text-muted-foreground hover:text-destructive transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
