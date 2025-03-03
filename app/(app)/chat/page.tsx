/*
<ai_context>
A client-side chat page that connects to a PartyKit server for real-time messaging.
</ai_context>
<recent_changes>
Fixed message duplication issue by adding message deduplication with a unique ID system and improved WebSocket connection handling with proper cleanup.
</recent_changes>
*/

/**
 * @description
 * This file implements the chat client page. It connects to our PartyKit server
 * via the `usePartyKitClient` hook, listens for real-time chat messages, and
 * allows the user to set their nickname and send messages.
 *
 * Key Features:
 * - Nickname syncing with plugin settings (if the user set a nickname in profile).
 * - Real-time messages stored in local React state.
 * - Uses the "chat" message type from PartyKit (server code in party-server/server.ts).
 *
 * @dependencies
 * - React (client component).
 * - usePartyKitClient (from @/lib/party-kit/party-kit-client).
 * - usePipeSettings (from @/hooks/use-pipe-settings) to read plugin settings (e.g. nickname).
 *
 * @notes
 * - If the user is shadow banned, the server will only echo messages back to them.
 *   Others won't see them. We just display the messages we receive from the server.
 * - For advanced moderation feedback, see the server logic in `party-server/server.ts`.
 * - This is a minimal example that can be further styled or integrated with a design system.
 */

"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { usePartyKitClient } from "@/lib/party-kit/party-kit-client";
import { usePipeSettings } from "@/hooks/use-pipe-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import PartySocket from "partysocket";

interface ChatMessage {
  type: string; // e.g. 'chat'
  from: string; // nickname
  text: string; // message body
  timestamp: number; // ms since epoch
}

export default function ChatPage() {
  // We can try loading a previously set nickname from plugin settings
  // If the user never set one in the profile, we fallback to local default
  const { settings } = usePipeSettings();

  // local states
  const [chatInput, setChatInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef<Set<string>>(new Set());

  // PartySocket reference to prevent recreating connection
  const socketRef = useRef<PartySocket | null>(null);

  // from usePartyKitClient
  const { socket, setName, sendChat } = usePartyKitClient();

  // Keep a scroll ref for chat history
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Listen for incoming messages of type "chat".
   * We'll parse them, store in local state.
   */
  useEffect(() => {
    if (!socket) return;

    // Store socket reference
    socketRef.current = socket;
    setIsConnected(socket.readyState === WebSocket.OPEN);

    function handleOpen() {
      setIsConnected(true);
    }

    function handleClose() {
      setIsConnected(false);
    }

    function handleMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
          // Create a unique ID for this message to prevent duplicates
          const messageId = `${data.from}-${
            data.timestamp
          }-${data.text.substring(0, 10)}`;

          // Only process this message if we haven't seen it before
          if (!processedMessageIds.current.has(messageId)) {
            processedMessageIds.current.add(messageId);

            // Add to messages state
            setMessages((prev) => [...prev, data]);
          }
        }
      } catch (err) {
        console.warn("Received non-JSON or invalid message:", event.data);
      }
    }

    socket.addEventListener("message", handleMessage);
    socket.addEventListener("open", handleOpen);
    socket.addEventListener("close", handleClose);

    return () => {
      // Only remove listeners from the current socket reference
      if (socketRef.current === socket) {
        socket.removeEventListener("message", handleMessage);
        socket.removeEventListener("open", handleOpen);
        socket.removeEventListener("close", handleClose);
      }
    };
  }, [socket]);

  /**
   * Scroll to the bottom of the chat whenever messages change
   */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * onSend
   * Called when user hits "send" or form is submitted
   */
  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // send chat to server
    sendChat(chatInput);
    setChatInput("");

    // Focus back on input after sending
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, ChatMessage[]>>(
    (groups, message) => {
      const date = new Date(message.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {}
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Group Chat
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Need a break? Connect with others in real-time.
        </p>
      </div>

      <div className="">
        <Card className="md:col-span-3 shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Chat Room
            </CardTitle>
            <CardDescription>
              {messages.length === 0
                ? "No messages yet. Start the conversation!"
                : `${messages.length} ${
                    messages.length === 1 ? "message" : "messages"
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{date}</span>
                    <Separator className="flex-grow" />
                  </div>

                  {dateMessages.map((msg, idx) => {
                    // TODO: use better identifier
                    const isCurrentUser = msg.from === settings?.nickname;
                    return (
                      <div
                        key={`${date}-${msg.timestamp}-${idx}`}
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] ${
                            isCurrentUser
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-800/50"
                          } rounded-lg px-4 py-2`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {getInitials(msg.from)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm text-blue-600">
                                {msg.from}
                              </span>
                            </div>
                          )}
                          <p className="text-gray-800 dark:text-gray-200">
                            {msg.text}
                          </p>
                          <div className="text-xs text-gray-400 mt-1 text-right">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <form
              className="flex items-center space-x-2 w-full"
              onSubmit={onSend}
            >
              <Input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-grow"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!isConnected || !chatInput.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
