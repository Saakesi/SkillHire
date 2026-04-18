import { ExternalLink, Pencil, PlayCircle, RefreshCw } from "lucide-react";
import CollegeSelect from "@/components/ui/CollegeSelect";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { BRANCH_OPTIONS } from "../utils/dashboardUtils";

export function ProfileHeader({
  profile,
  metrics,
  isAnalyzing,
  loading,
  updatedAt,
  handleAnalyze,
  profileActions
}) {
  const {
    editingBio,
    setEditingBio,
    bio,
    setBio,
    savingBio,
    saveBio,
    editingLeetcode,
    setEditingLeetcode,
    leetcodeUsername,
    setLeetcodeUsername,
    savingLeetcode,
    saveLeetcodeUsername,
    editingCollege,
    setEditingCollege,
    college,
    setCollege,
    branch,
    setBranch,
    graduationYear,
    setGraduationYear,
    savingCollege,
    saveCollege
  } = profileActions;

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex items-start gap-5 flex-1">
            <Avatar src={profile.avatarUrl} name={profile.name || profile.username} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold truncate">{profile.name || profile.username}</h1>
                {metrics?.developerType && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {metrics.developerType}
                  </span>
                )}
                {metrics?.primaryLanguage && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    {metrics.primaryLanguage}
                  </span>
                )}
              </div>

              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 w-fit"
              >
                @{profile.username}
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="mt-2">
                {!editingBio ? (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-muted-foreground">{bio || "Add a bio…"}</p>
                    <button
                      onClick={() => setEditingBio(true)}
                      className="text-muted-foreground hover:text-primary flex-shrink-0 mt-0.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-w-md">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      placeholder="Write something about yourself…"
                      className="w-full border border-border rounded-lg p-2 text-sm bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveBio} disabled={savingBio}>
                        {savingBio ? "Saving…" : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingBio(false);
                          setBio(profile.bio || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center gap-2">
                {!editingLeetcode ? (
                  <>
                    <span className="text-xs text-muted-foreground">
                      LeetCode: <span className={leetcodeUsername ? "text-foreground font-medium" : ""}>{leetcodeUsername || "not connected"}</span>
                    </span>
                    <button onClick={() => setEditingLeetcode(true)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={leetcodeUsername}
                      onChange={(e) => setLeetcodeUsername(e.target.value)}
                      placeholder="LeetCode username"
                      className="border border-border rounded-lg px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary w-44"
                    />
                    <Button size="sm" onClick={saveLeetcodeUsername} disabled={savingLeetcode}>
                      {savingLeetcode ? "…" : "Save"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingLeetcode(false);
                        setLeetcodeUsername(profile.leetcodeUsername || "");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-2">
                {!editingCollege ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    {college?.name ? (
                      <>
                        <span className="text-sm text-foreground font-medium">{college.name}</span>
                        {branch && <span className="px-2 py-0.5 rounded bg-secondary text-xs">{branch}</span>}
                        {graduationYear && <span className="px-2 py-0.5 rounded bg-secondary text-xs">{graduationYear}</span>}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Add your college details</span>
                    )}
                    <button onClick={() => setEditingCollege(true)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-w-md">
                    <CollegeSelect value={college} onChange={setCollege} />

                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Branch</option>
                      {BRANCH_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      placeholder="Graduation Year"
                      className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveCollege} disabled={savingCollege}>
                        {savingCollege ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCollege(false);
                          setCollege(profile?.college || null);
                          setBranch(profile?.branch || "");
                          setGraduationYear(profile?.graduationYear || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 flex-shrink-0">
            <Button
              variant="gradient"
              icon={isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
              onClick={handleAnalyze}
              disabled={loading || isAnalyzing}
            >
              {loading ? "Starting…" : isAnalyzing ? "Analyzing…" : metrics ? "Re-analyze" : "Analyze Profile"}
            </Button>
            {updatedAt && (
              <span className="text-xs text-muted-foreground">
                Updated {new Date(updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {isAnalyzing && <span className="text-xs text-primary animate-pulse">Analysis running…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
