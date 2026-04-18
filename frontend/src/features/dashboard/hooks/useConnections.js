import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/dashboardUtils";

export const useConnections = (isAuthenticated) => {
  const [pendingConnections, setPendingConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionActioningId, setConnectionActioningId] = useState("");

  const refreshPendingConnections = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/connections/pending`, { withCredentials: true });
    setPendingConnections(res.data?.pending || []);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadPendingConnections = async () => {
      setConnectionsLoading(true);
      try {
        await refreshPendingConnections();
      } catch {
        setPendingConnections([]);
      } finally {
        setConnectionsLoading(false);
      }
    };

    loadPendingConnections();
  }, [isAuthenticated]);

  const acceptConnection = async (connectionId) => {
    setConnectionActioningId(connectionId);
    try {
      await axios.post(`${API_BASE_URL}/api/connections/accept/${connectionId}`, {}, { withCredentials: true });
      await refreshPendingConnections();
    } finally {
      setConnectionActioningId("");
    }
  };

  const declineConnection = async (connectionId) => {
    setConnectionActioningId(connectionId);
    try {
      await axios.post(`${API_BASE_URL}/api/connections/decline/${connectionId}`, {}, { withCredentials: true });
      await refreshPendingConnections();
    } finally {
      setConnectionActioningId("");
    }
  };

  return {
    pendingConnections,
    connectionsLoading,
    connectionActioningId,
    acceptConnection,
    declineConnection
  };
};
