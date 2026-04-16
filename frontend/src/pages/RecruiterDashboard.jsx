import { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Users, BarChart3, Bookmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import DashboardNav from "../components/recruiter/DashboardNav";
import StatCard from "../components/recruiter/StatCard";
import SearchTab from "../components/recruiter/SearchTab";
import ConnectionsTab from "../components/recruiter/ConnectionsTab";
import ReferralsTab from "../components/recruiter/ReferralsTab";
import ShortlistsTab from "../components/recruiter/ShortlistsTab";
import SettingsTab from "../components/recruiter/SettingsTab";
import Messages from "./Messages";
import { referralService } from "../services/referralService";

const API = import.meta.env.VITE_API_URL;

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { profile: recruiter, isAuthenticated, role, loading: authLoading, logout } = useAuth();

  const [tab, setTab] = useState("search");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [shortlists, setShortlists] = useState([]);
  const [shortlistsLoading, setShortlistsLoading] = useState(true);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [connectionActioningId, setConnectionActioningId] = useState("");
  const [referralsLoading, setReferralsLoading] = useState(true);
  const [pendingReferrals, setPendingReferrals] = useState([]);
  const [acceptedReferrals, setAcceptedReferrals] = useState([]);
  const [receivedReferrals, setReceivedReferrals] = useState([]);
  const [referralActioningId, setReferralActioningId] = useState("");
  const [messageTargetUsername, setMessageTargetUsername] = useState("");



  //  auth guard 
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || role !== "recruiter")) navigate("/recruiter");
  }, [authLoading, isAuthenticated, role, navigate]);

  // data fetching 
  useEffect(() => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    axios.get(`${API}/api/recruiter/stats`, { withCredentials: true })
      .then(res => setStats(res.data))
      .catch(() => { })
      .finally(() => setStatsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadConnections = async () => {
      setConnectionsLoading(true);
      try {
        const [pendingRes, acceptedRes] = await Promise.all([
          axios.get(`${API}/api/connections/pending`, { withCredentials: true }),
          axios.get(`${API}/api/connections/list`, { withCredentials: true }),
        ]);

        setPendingConnections(pendingRes.data?.pending || []);
        setAcceptedConnections(acceptedRes.data?.connections || []);
      } catch {
        setPendingConnections([]);
        setAcceptedConnections([]);
      } finally {
        setConnectionsLoading(false);
      }
    };

    loadConnections();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadReferrals = async () => {
      setReferralsLoading(true);
      try {
        const [incomingRes, sentRes] = await Promise.all([
          referralService.getIncoming(),
          referralService.getSent(),
        ]);

        setPendingReferrals(incomingRes.referrals || []);
        setAcceptedReferrals((sentRes.referrals || []).filter((item) => item.status === "accepted"));
        const receivedRes = await axios.get(`${API}/api/referrals/received`, { withCredentials: true });
        setReceivedReferrals(receivedRes.data?.referrals || []);
      } catch {
        setPendingReferrals([]);
        setAcceptedReferrals([]);
        setReceivedReferrals([]);
      } finally {
        setReferralsLoading(false);
      }
    };

    loadReferrals();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setShortlistsLoading(true);

    axios.get(`${API}/api/recruiter/shortlist`, { withCredentials: true })
      .then(res => setShortlists(res.data))
      .catch(() => { })
      .finally(() => setShortlistsLoading(false));

  }, [isAuthenticated]);

  // shortlist mutations 
  const refreshShortlists = async () => {
    setShortlistsLoading(true);
    const res = await axios.get(`${API}/api/recruiter/shortlist`, { withCredentials: true });
    setShortlists(res.data);
    setShortlistsLoading(false);
    return res.data;
  };

  const addToShortlist = async (listId, githubId) => {
    await axios.post(`${API}/api/recruiter/shortlist/${listId}/add`, { githubId }, { withCredentials: true });
    await refreshShortlists();
  };

  const removeFromShortlist = async (listId, githubId) => {
    await axios.delete(`${API}/api/recruiter/shortlist/${listId}/developer/${githubId}`, { withCredentials: true });
    await refreshShortlists();
  };

  const createShortlist = async (name, description) => {
    await axios.post(`${API}/api/recruiter/shortlist`, { name, description }, { withCredentials: true });
    await refreshShortlists();
  };

  const deleteShortlist = async (id) => {
    await axios.delete(`${API}/api/recruiter/shortlist/${id}`, { withCredentials: true });
    setShortlists(prev => prev.filter(s => s._id !== id));
  };

  const refreshConnections = async () => {
    setConnectionsLoading(true);
    const [pendingRes, acceptedRes] = await Promise.all([
      axios.get(`${API}/api/connections/pending`, { withCredentials: true }),
      axios.get(`${API}/api/connections/list`, { withCredentials: true }),
    ]);

    setPendingConnections(pendingRes.data?.pending || []);
    setAcceptedConnections(acceptedRes.data?.connections || []);
    setConnectionsLoading(false);
  };

  const acceptConnection = async (connectionId) => {
    setConnectionActioningId(connectionId);
    try {
      await axios.post(`${API}/api/connections/accept/${connectionId}`, {}, { withCredentials: true });
      await refreshConnections();
    } finally {
      setConnectionActioningId("");
    }
  };

  const declineConnection = async (connectionId) => {
    setConnectionActioningId(connectionId);
    try {
      await axios.post(`${API}/api/connections/decline/${connectionId}`, {}, { withCredentials: true });
      await refreshConnections();
    } finally {
      setConnectionActioningId("");
    }
  };

  const refreshReferrals = async () => {
    setReferralsLoading(true);
    const [incomingRes, sentRes] = await Promise.all([
      referralService.getIncoming(),
      referralService.getSent(),
    ]);

    setPendingReferrals(incomingRes.referrals || []);
    setAcceptedReferrals((sentRes.referrals || []).filter((item) => item.status === "accepted"));
    const receivedRes = await axios.get(`${API}/api/referrals/received`, { withCredentials: true });
    setReceivedReferrals(receivedRes.data?.referrals || []);
    setReferralsLoading(false);
  };

  const acceptReferral = async (referralId) => {
    setReferralActioningId(referralId);
    try {
      await referralService.acceptReferral(referralId);
      await refreshReferrals();
    } finally {
      setReferralActioningId("");
    }
  };

  const rejectReferral = async (referralId) => {
    setReferralActioningId(referralId);
    try {
      await referralService.rejectReferral(referralId);
      await refreshReferrals();
    } finally {
      setReferralActioningId("");
    }
  };

  const openEmbeddedMessage = (username) => {
    if (!username) return;
    setMessageTargetUsername(username);
    setTab("messages");
  };

  const handleLogout = async () => { await logout(); navigate("/recruiter"); };

  // ── loading state
  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <RefreshCw className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardNav
        tab={tab}
        setTab={setTab}
        recruiter={recruiter}
        shortlistCount={shortlists.length}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        {/* Stats row */}
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<Users className="w-4 h-4" />} label="Indexed Developers" value={stats.totalDevelopers.toLocaleString()} />
            <StatCard icon={<BarChart3 className="w-4 h-4" />} label="Avg Score" value={stats.avgScore} sub={`Max ${stats.maxScore}`} />
            <StatCard icon={<RefreshCw className="w-4 h-4" />} label="Active This Week" value={stats.recentlyAnalyzed} sub="re-analyzed" />
            <StatCard icon={<Bookmark className="w-4 h-4" />} label="Your Shortlists" value={stats.shortlistCount} />
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {tab === "search" && (
            <SearchTab
              key="search"
              shortlists={shortlists}
              onAddToShortlist={addToShortlist}
              onRemoveFromShortlist={removeFromShortlist}
            />
          )}
          {tab === "connections" && (
            <ConnectionsTab
              key="connections"
              pending={pendingConnections}
              accepted={acceptedConnections}
              loading={connectionsLoading}
              actioningId={connectionActioningId}
              onAccept={acceptConnection}
              onDecline={declineConnection}
              onMessageUser={openEmbeddedMessage}
            />
          )}
          {tab === "referrals" && (
            <ReferralsTab
              key="referrals"
              pending={pendingReferrals}
              accepted={receivedReferrals.filter((item) => item.status === "accepted")}
              loading={referralsLoading}
              actioningId={referralActioningId}
              onAccept={acceptReferral}
              onReject={rejectReferral}
              onMessageUser={openEmbeddedMessage}
            />
          )}
          {tab === "messages" && (
            <Messages key="messages" embedded initialUsername={messageTargetUsername} />
          )}
          {tab === "shortlists" && (
            <ShortlistsTab
              key="shortlists"
              shortlists={shortlists}
              shortlistsLoading={shortlistsLoading}
              onCreateShortlist={createShortlist}
              onDeleteShortlist={deleteShortlist}
              onRemoveFromShortlist={removeFromShortlist}
            />
          )}
          {tab === "settings" && (
            <SettingsTab
              key="settings"
              recruiter={recruiter}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
