import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";

export function ConnectionsSection({
  connectionsLoading,
  pendingConnections,
  connectionActioningId,
  acceptConnection,
  declineConnection
}) {
  if (!connectionsLoading && pendingConnections.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4 text-primary" /> Incoming Connection Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {connectionsLoading && <p className="text-sm text-muted-foreground">Loading requests...</p>}

          {!connectionsLoading && pendingConnections.length === 0 && (
            <p className="text-sm text-muted-foreground">No pending connection requests.</p>
          )}

          {pendingConnections.map((item) => (
            <div key={item._id} className="rounded-xl border border-border p-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar src={item.requester?.avatarUrl} name={item.requester?.name || item.requester?.username} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.requester?.name || item.requester?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">@{item.requester?.username}</p>
                </div>
                <Link to={`/profile/${item.requester?.username}`} className="text-xs text-primary hover:underline">
                  View profile
                </Link>
              </div>

              {item.note && <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{item.note}</p>}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" loading={connectionActioningId === item._id} onClick={() => acceptConnection(item._id)}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={connectionActioningId === item._id}
                  onClick={() => declineConnection(item._id)}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
