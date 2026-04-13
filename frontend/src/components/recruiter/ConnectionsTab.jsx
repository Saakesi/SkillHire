import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

export default function ConnectionsTab({
  pending,
  accepted,
  loading,
  actioningId,
  onAccept,
  onDecline,
  onMessageUser,
}) {
  return (
    <motion.div
      key="connections"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Incoming Connection Requests</h3>

          {loading && <p className="text-sm text-muted-foreground">Loading requests...</p>}
          {!loading && pending.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending connection requests.</p>
          )}

          {pending.map((item) => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Avatar src={item.requester?.avatarUrl} name={item.requester?.name || item.requester?.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.requester?.name || item.requester?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{item.requester?.username}</p>
                </div>
                <Link to={`/profile/${item.requester?.username}`} className="ml-auto text-xs text-primary hover:underline">
                  Profile
                </Link>
              </div>

              {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  loading={actioningId === item._id}
                  onClick={() => onAccept(item._id)}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={actioningId === item._id}
                  onClick={() => onDecline(item._id)}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Accepted Connections</h3>

          {loading && <p className="text-sm text-muted-foreground">Loading connections...</p>}
          {!loading && accepted.length === 0 && (
            <p className="text-sm text-muted-foreground">No accepted connections yet.</p>
          )}

          {accepted.map((item) => (
            <div key={item.connectionId} className="rounded-xl border border-border p-3 flex items-center gap-3">
              <Avatar src={item.user?.avatarUrl} name={item.user?.name || item.user?.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.user?.name || item.user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">@{item.user?.username}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessageUser?.(item.user?.username)}
              >
                Message
              </Button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
