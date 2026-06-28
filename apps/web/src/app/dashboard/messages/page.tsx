"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { BuyerDashboardNav } from "@/components/dashboard/BuyerDashboardNav";
import { RealEstatePageSkeleton } from "@/components/skeletons/RealEstatePageSkeleton";

interface Conversation {
  listingId: string;
  listing?: { id: string; title: string; address: string };
  otherUser?: { id: string; firstName: string; lastName: string };
  unreadCount: number;
  lastMessage?: { body: string; createdAt: string };
}

interface ThreadMessage {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender?: { id: string; firstName: string; lastName: string };
}

export default function MessagesPage() {
  const { user, accessToken, loading, logout } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && user.role !== "buyer") router.push("/dashboard");
  }, [loading, user, router]);

  useEffect(() => {
    if (!accessToken) return;
    api.get<Conversation[]>("/messages/conversations", accessToken).then(setConversations).catch(() => undefined);
  }, [accessToken]);

  const openThread = async (conversation: Conversation) => {
    if (!accessToken || !conversation.otherUser) return;
    setActive(conversation);
    const messages = await api.get<ThreadMessage[]>(
      `/messages/thread/${conversation.listingId}?userId=${conversation.otherUser.id}`,
      accessToken,
    );
    setThread(messages);
    setConversations((prev) =>
      prev.map((c) =>
        c.listingId === conversation.listingId && c.otherUser?.id === conversation.otherUser?.id
          ? { ...c, unreadCount: 0 }
          : c,
      ),
    );
  };

  const sendReply = async () => {
    if (!accessToken || !active?.otherUser || !reply.trim()) return;
    setSending(true);
    try {
      await api.post(
        "/messages",
        {
          listingId: active.listingId,
          recipientId: active.otherUser.id,
          body: reply.trim(),
        },
        accessToken,
      );
      setReply("");
      await openThread(active);
    } finally {
      setSending(false);
    }
  };

  if (loading || !user || user.role !== "buyer") {
    return <RealEstatePageSkeleton variant="dashboard" />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-slate-600">Welcome, {user.firstName}</p>
        </div>
        <button onClick={() => logout()} className="text-sm text-slate-500 hover:text-red-600">
          Sign out
        </button>
      </div>

      <BuyerDashboardNav />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold">Conversations</h2>
          {conversations.length === 0 ? (
            <p className="mt-4 text-slate-500">No conversations yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {conversations.map((c) => (
                <li key={`${c.listingId}-${c.otherUser?.id}`}>
                  <button
                    type="button"
                    onClick={() => openThread(c)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active?.listingId === c.listingId && active?.otherUser?.id === c.otherUser?.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <p className="font-medium">{c.listing?.title}</p>
                    <p className="text-sm text-slate-500">
                      with {c.otherUser?.firstName} {c.otherUser?.lastName}
                    </p>
                    {c.lastMessage && (
                      <p className="mt-1 truncate text-xs text-slate-400">{c.lastMessage.body}</p>
                    )}
                    {c.unreadCount > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        {c.unreadCount} unread
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="lg:col-span-2">
          {!active ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-slate-500">
              Select a conversation to view messages
            </div>
          ) : (
            <div className="flex h-[32rem] flex-col rounded-xl border border-slate-200 bg-white">
              <div className="border-b px-4 py-3">
                <p className="font-medium">{active.listing?.title}</p>
                <p className="text-sm text-slate-500">
                  with {active.otherUser?.firstName} {active.otherUser?.lastName}
                </p>
                {active.listing && (
                  <Link
                    href={`/listing/${active.listing.id}`}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    View listing
                  </Link>
                )}
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {thread.map((msg) => {
                  const mine = msg.senderId === user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                          mine ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        <p>{msg.body}</p>
                        <p className={`mt-1 text-xs ${mine ? "text-emerald-100" : "text-slate-500"}`}>
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendReply()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
