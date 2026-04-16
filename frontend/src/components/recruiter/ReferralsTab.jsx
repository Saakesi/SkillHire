import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";

export default function ReferralsTab({
  pending,
  accepted,
  loading,
  actioningId,
  onAccept,
  onReject,
  onMessageUser,
}) {
  return (
    <motion.div
      key="referrals"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Pending Referral Requests</h3>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading referrals...</span>
            </div>
          )}
          {!loading && pending.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending referral requests.</p>
          )}

          {pending.map((item) => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Avatar src={item.from?.avatarUrl} name={item.from?.name || item.from?.username} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.from?.name || item.from?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{item.from?.username}</p>
                </div>
                <Link to={`/profile/${item.from?.username}`} className="ml-auto text-xs text-primary hover:underline">
                  Profile
                </Link>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Company:</span> {item.company}</p>
                {item.message && (
                  <div className="rounded-lg border border-border bg-secondary/40 p-2">
                    <p className="font-medium text-foreground mb-1">Message:</p>
                    <p className="whitespace-pre-wrap break-words">{item.message}</p>
                  </div>
                )}
                {item.resumeUrl && (
                  <a href={item.resumeUrl} target="_blank" rel="noreferrer" className="block text-primary hover:underline">
                    View resume
                  </a>
                )}
              </div>

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
                  onClick={() => onReject(item._id)}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <h3 className="font-semibold text-sm">Accepted Referrals</h3>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Loading accepted referrals...</span>
            </div>
          )}
          {!loading && accepted.length === 0 && (
            <p className="text-sm text-muted-foreground">No accepted referrals yet.</p>
          )}

          {accepted.map((item) => (
            <div key={item._id} className="rounded-xl border border-border p-3 flex items-center gap-3">
              <Avatar src={item.from?.avatarUrl} name={item.from?.name || item.from?.username} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.from?.name || item.from?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{item.company}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMessageUser?.(item.from?.username)}
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
