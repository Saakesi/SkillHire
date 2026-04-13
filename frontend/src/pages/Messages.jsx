import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { messageService } from "../services/messageService";
import { connectSocket, disconnectSocket } from "../services/socketService";
import { useAuth } from "../context/AuthContext";

function getPartner(message, myUserId) {
  if (!message?.sender || !message?.receiver) return null;
  return message.sender._id === myUserId ? message.receiver : message.sender;
}

export default function Messages({ embedded = false, initialUsername = "" }) {
  const { username: routeUsername } = useParams();
  const { profile, isAuthenticated } = useAuth();

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [input, setInput] = useState("");

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUsername, setActiveUsername] = useState(routeUsername || initialUsername || "");
  const messagesEndRef = useRef(null);

  const myUserId = profile?._id;

  const activeConversation = useMemo(
    () => conversations.find((c) => getPartner(c, myUserId)?.username === activeUsername),
    [conversations, myUserId, activeUsername]
  );
  const activePartner = activeConversation ? getPartner(activeConversation, myUserId) : null;
  const activeChatUsername = activePartner?.username || activeUsername;
  const activeChatLabel = activePartner?.name || activePartner?.username || activeUsername;

  const refreshConversations = async () => {
    setError("");
    try {
      const data = await messageService.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to load conversations.");
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingConversations(false);
      return;
    }
    refreshConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (routeUsername) {
      setActiveUsername(routeUsername);
      return;
    }
    if (initialUsername) {
      setActiveUsername(initialUsername);
    }
  }, [routeUsername, initialUsername]);

  useEffect(() => {
    if (!activeUsername || !isAuthenticated) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError("");
      try {
        const data = await messageService.getConversation(activeUsername);
        setMessages(data.messages || []);
      } catch (err) {
        setMessages([]);
        setError(err?.response?.data?.error || "Failed to load conversation.");
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [activeUsername, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, activeUsername]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = connectSocket();

    const onMessage = (message) => {
      setConversations((prev) => {
        const partner = getPartner(message, myUserId);
        if (!partner?.username) return prev;

        const existingIndex = prev.findIndex(
          (item) => getPartner(item, myUserId)?.username === partner.username
        );

        let next = [...prev];
        if (existingIndex >= 0) {
          const current = next[existingIndex];
          next[existingIndex] = {
            ...message,
            unreadCount:
              activeUsername === partner.username || message.sender._id === myUserId
                ? 0
                : (current.unreadCount || 0) + 1,
          };
        } else {
          next.unshift({
            ...message,
            unreadCount:
              activeUsername === partner.username || message.sender._id === myUserId ? 0 : 1,
          });
        }

        next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return next;
      });

      const partner = getPartner(message, myUserId);
      if (partner?.username === activeUsername) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("message:new", onMessage);

    return () => {
      socket.off("message:new", onMessage);
      disconnectSocket();
    };
  }, [isAuthenticated, myUserId, activeUsername]);

  const handleSelectConversation = (username) => {
    setActiveUsername(username);
  };

  const handleSend = async () => {
    if (!activeUsername || !input.trim()) return;
    setSending(true);
    setError("");
    try {
      await messageService.sendMessage(activeUsername, input.trim());
      setInput("");
    } catch (err) {
      setError(err?.response?.data?.error || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    embedded ? (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chat with accepted connections and referral matches in real time.
          </p>
        </div>

        {!isAuthenticated ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Please login to access your inbox.</p>
              <Link to="/login" className="text-sm text-primary hover:underline">Go to login</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Inbox</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
                {loadingConversations && <p className="text-sm text-muted-foreground">Loading conversations...</p>}
                {!loadingConversations && conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground">No conversations yet.</p>
                )}

                {conversations.map((conversation) => {
                  const partner = getPartner(conversation, myUserId);
                  if (!partner) return null;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => handleSelectConversation(partner.username)}
                      className={`w-full text-left border rounded-xl p-3 transition-colors ${
                        activeUsername === partner.username
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={partner.avatarUrl} name={partner.name || partner.username} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{partner.name || partner.username}</p>
                          <p className="text-xs text-muted-foreground truncate">{conversation.text}</p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {activeUsername ? (
                    <span>
                      Chat with{" "}
                      <Link
                        to={`/profile/${activeChatUsername}`}
                        className="text-primary hover:underline"
                      >
                        {activeChatLabel}
                      </Link>
                    </span>
                  ) : (
                    "Select a conversation"
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!activeUsername && (
                  <p className="text-sm text-muted-foreground">Choose a conversation from the inbox to start chatting.</p>
                )}

                {activeUsername && (
                  <div className="space-y-4">
                    <div className="h-[52vh] border border-border rounded-xl p-3 overflow-y-auto space-y-3 bg-secondary/30">
                      {loadingMessages && (
                        <p className="text-sm text-muted-foreground">Loading chat...</p>
                      )}
                      {!loadingMessages && messages.length === 0 && (
                        <p className="text-sm text-muted-foreground">No messages yet.</p>
                      )}

                      {messages.map((message) => {
                        const mine = message.sender?._id === myUserId;
                        return (
                          <div
                            key={message._id}
                            className={`flex ${mine ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                mine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card border border-border"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">{message.text}</p>
                              <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="flex items-end gap-2">
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message"
                        rows={3}
                        className="w-full min-h-24 resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                      />
                      <Button loading={sending} disabled={!input.trim()} onClick={handleSend}>
                        Send
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
      </div>
    ) : (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-background py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Chat with accepted connections and referral matches in real time.
            </p>
          </div>

          {!isAuthenticated && (
            <Card>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Please login to access your inbox.</p>
                <Link to="/login" className="text-sm text-primary hover:underline">Go to login</Link>
              </CardContent>
            </Card>
          )}

          {isAuthenticated && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inbox</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
                  {loadingConversations && <p className="text-sm text-muted-foreground">Loading conversations...</p>}
                  {!loadingConversations && conversations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No conversations yet.</p>
                  )}

                  {conversations.map((conversation) => {
                    const partner = getPartner(conversation, myUserId);
                    if (!partner) return null;

                    return (
                      <button
                        key={conversation._id}
                        onClick={() => handleSelectConversation(partner.username)}
                        className={`w-full text-left border rounded-xl p-3 transition-colors ${
                          activeUsername === partner.username
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar src={partner.avatarUrl} name={partner.name || partner.username} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{partner.name || partner.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{conversation.text}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="text-xs font-semibold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">
                    {activeUsername ? (
                      <span>
                        Chat with{" "}
                        <Link
                          to={`/profile/${activeChatUsername}`}
                          className="text-primary hover:underline"
                        >
                          {activeChatLabel}
                        </Link>
                      </span>
                    ) : (
                      "Select a conversation"
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!activeUsername && (
                    <p className="text-sm text-muted-foreground">Choose a conversation from the inbox to start chatting.</p>
                  )}

                  {activeUsername && (
                    <div className="space-y-4">
                      <div className="h-[52vh] border border-border rounded-xl p-3 overflow-y-auto space-y-3 bg-secondary/30">
                        {loadingMessages && (
                          <p className="text-sm text-muted-foreground">Loading chat...</p>
                        )}
                        {!loadingMessages && messages.length === 0 && (
                          <p className="text-sm text-muted-foreground">No messages yet.</p>
                        )}

                        {messages.map((message) => {
                          const mine = message.sender?._id === myUserId;
                          return (
                            <div
                              key={message._id}
                              className={`flex ${mine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                                  mine
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-card border border-border"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                                <p className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                  {new Date(message.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="flex items-end gap-2">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message"
                          rows={3}
                          className="w-full min-h-24 resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                        />
                        <Button loading={sending} disabled={!input.trim()} onClick={handleSend}>
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </div>
      </div>
    </Layout>
    )
  );
}
