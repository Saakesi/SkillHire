import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { referralService } from "../services/referralService";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 8;

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "developer", label: "Developers" },
  { value: "recruiter", label: "Recruiters" },
];

const AUDIENCE_BADGE = {
  developer: "Developer",
  recruiter: "Recruiter",
  professional: "Professional",
  alumni: "Alumni",
  student: "Student",
};

function ReferralRequestForm({ username, submitting, onSubmit }) {
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const reset = () => {
    setCompany("");
    setNote("");
    setResumeUrl("");
  };

  const submit = async () => {
    const ok = await onSubmit(username, {
      company,
      note,
      resumeUrl,
    });

    if (ok) {
      reset();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Input
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company you want referral for"
      />
      <Input
        value={resumeUrl}
        onChange={(e) => setResumeUrl(e.target.value)}
        placeholder="Resume URL (optional)"
      />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a short message (optional)"
        className="md:col-span-2 min-h-24 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <Button
        className="md:col-span-2"
        loading={submitting}
        disabled={!company.trim()}
        onClick={submit}
      >
        Send Referral Request
      </Button>
    </div>
  );
}

export default function Referrals() {
  const { isAuthenticated, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState("");
  const [openUsers, setOpenUsers] = useState([]);
  const [openMeta, setOpenMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);

  const fetchOpenUsers = async () => {
    const openData = await referralService.getOpenUsers({
      page,
      limit: PAGE_SIZE,
      search,
      role: roleFilter,
    });

    setOpenUsers(openData.users || []);
    setOpenMeta({
      page: openData.page || page,
      totalPages: openData.totalPages || 1,
      total: openData.total || 0,
    });
  };

  const refreshAll = async () => {
    setError("");
    try {
      const [_, incomingData, sentData] = await Promise.all([
        fetchOpenUsers(),
        isAuthenticated ? referralService.getIncoming() : Promise.resolve({ referrals: [] }),
        isAuthenticated ? referralService.getSent() : Promise.resolve({ referrals: [] }),
      ]);
      setIncoming(incomingData.referrals || []);
      setSent(sentData.referrals || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load referral data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [isAuthenticated, page, roleFilter, search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const handleRequest = async (username, payload) => {
    const company = (payload.company || "").trim();
    const note = (payload.note || "").trim();
    const resumeUrl = (payload.resumeUrl || "").trim();

    if (!company) {
      setError("Company is required to send a referral request.");
      return false;
    }

    setSubmittingFor(username);
    setError("");

    try {
      await referralService.requestReferral(username, {
        company,
        message: note || undefined,
        resumeUrl: resumeUrl || undefined,
      });

      await refreshAll();
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || "Could not send referral request.");
      return false;
    } finally {
      setSubmittingFor("");
    }
  };

  const handleIncomingAction = async (referralId, action) => {
    setSubmittingFor(referralId);
    setError("");
    try {
      if (action === "accept") {
        await referralService.acceptReferral(referralId);
      } else {
        await referralService.rejectReferral(referralId);
      }
      await refreshAll();
    } catch (err) {
      setError(err?.response?.data?.error || "Could not update referral request.");
    } finally {
      setSubmittingFor("");
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Referrals</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Discover people open to referrals across developers, professionals, alumni, and recruiters.
            </p>
          </div>

          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by username, name, company, college..."
              />

              <select
                value={roleFilter}
                onChange={(e) => {
                  setPage(1);
                  setRoleFilter(e.target.value);
                }}
                className="h-11 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {AUDIENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <div className="h-11 px-4 rounded-xl border border-border bg-secondary/40 flex items-center text-sm text-muted-foreground">
                {loading ? "Loading..." : `${openMeta.total} matching profiles`}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/40">
              <CardContent className="text-sm text-destructive">{error}</CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Open For Referrals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && <p className="text-sm text-muted-foreground">Loading open users...</p>}
                {!loading && openUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users are open for referrals right now.</p>
                )}

                {openUsers.map((user) => {
                  const isMe = profile?.username === user.username;
                  return (
                    <div key={user.username} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={user.avatarUrl} name={user.name || user.username} size="sm" />
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{user.name || user.username}</p>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-secondary text-secondary-foreground">
                                {AUDIENCE_BADGE[user.audienceType] || "Developer"}
                              </span>
                              {(user.currentCompany || user.company) && (
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {user.currentCompany || user.company}
                                </span>
                              )}
                            </div>
                            {user.referralCompany && (
                              <p className="text-xs text-muted-foreground mt-1">Referrals at: {user.referralCompany}</p>
                            )}
                          </div>
                        </div>
                        <Link to={`/profile/${user.username}`} className="text-xs text-primary hover:underline">
                          View profile
                        </Link>
                      </div>

                      {user.referralNote && (
                        <p className="text-sm text-muted-foreground">{user.referralNote}</p>
                      )}

                      {!isAuthenticated && (
                        <Link to="/login" className="text-sm text-primary hover:underline">
                          Login to request a referral
                        </Link>
                      )}

                      {isAuthenticated && !isMe && (
                        <ReferralRequestForm
                          username={user.username}
                          submitting={submittingFor === user.username}
                          onSubmit={handleRequest}
                        />
                      )}
                    </div>
                  );
                })}

                {!loading && openMeta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Page {openMeta.page} of {openMeta.totalPages}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= openMeta.totalPages}
                      onClick={() => setPage((prev) => Math.min(prev + 1, openMeta.totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Incoming Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground">Log in to see incoming requests.</p>
                  )}
                  {isAuthenticated && incoming.length === 0 && (
                    <p className="text-sm text-muted-foreground">No pending requests.</p>
                  )}

                  {incoming.map((item) => (
                    <div key={item._id} className="border border-border rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar src={item.from?.avatarUrl} name={item.from?.name || item.from?.username} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.from?.name || item.from?.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.company}</p>
                        </div>
                      </div>
                      {item.message && <p className="text-xs text-muted-foreground">{item.message}</p>}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          loading={submittingFor === item._id}
                          onClick={() => handleIncomingAction(item._id, "accept")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={submittingFor === item._id}
                          onClick={() => handleIncomingAction(item._id, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sent Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isAuthenticated && (
                    <p className="text-sm text-muted-foreground">Log in to see sent requests.</p>
                  )}
                  {isAuthenticated && sent.length === 0 && (
                    <p className="text-sm text-muted-foreground">No requests sent yet.</p>
                  )}

                  {sent.map((item) => (
                    <div key={item._id} className="border border-border rounded-xl p-3 space-y-1">
                      <p className="text-sm font-medium">{item.to?.name || item.to?.username}</p>
                      <p className="text-xs text-muted-foreground">{item.company}</p>
                      <p className="text-xs">
                        Status: <span className="font-medium capitalize">{item.status}</span>
                      </p>
                      {item.status === "accepted" && (
                        <Link to={`/messages/${item.to?.username}`} className="text-xs text-primary hover:underline">
                          Open chat
                        </Link>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
