// Simplified storage utils for Stellar AI - Single chat session

import { Chat } from "../types/chat";

const CURRENT_CHAT_KEY = "stellar_current_chat";

export const saveCurrentChat = (chat: Chat): void => {
  try {
    // Ensure messages array exists and is valid
    if (!chat || typeof chat !== "object" || !Array.isArray(chat.messages)) {
      console.error("Invalid chat object provided to saveCurrentChat:", {
        chat: !!chat,
        isObject: typeof chat === "object",
        hasMessages: chat ? "messages" in chat : false,
        messagesIsArray:
          chat && chat.messages ? Array.isArray(chat.messages) : false,
      });
      return;
    }

    // Create a deep copy to avoid any reference issues
    const messages = chat.messages || [];
    const chatToSave = {
      ...chat,
      lastMessage: chat.lastMessage,
      messages: messages.map((message) => ({
        ...message,
        timestamp: message.timestamp,
      })),
    };

    localStorage.setItem(CURRENT_CHAT_KEY, JSON.stringify(chatToSave));
  } catch (error) {
    console.error("Error saving chat to localStorage:", error);
  }
};

export const loadCurrentChat = (): Chat | null => {
  try {
    const chatData = localStorage.getItem(CURRENT_CHAT_KEY);
    if (!chatData) return null;

    const chat: Chat = JSON.parse(chatData);

    // Validate the loaded chat data
    if (!chat || typeof chat !== "object" || !Array.isArray(chat.messages)) {
      console.error("Invalid chat data in localStorage, clearing it");
      localStorage.removeItem(CURRENT_CHAT_KEY);
      return null;
    }

    return chat;
  } catch (error) {
    console.error("Error loading chat from localStorage:", error);
    // Clear corrupted data
    localStorage.removeItem(CURRENT_CHAT_KEY);
    return null;
  }
};

export const clearCurrentChat = (): void => {
  try {
    localStorage.removeItem(CURRENT_CHAT_KEY);
  } catch (error) {
    console.error("Error clearing chat from localStorage:", error);
  }
};

// Legacy functions for backward compatibility (deprecated)
export const saveChats = (chats: Chat[]): void => {
  if (chats.length > 0) {
    saveCurrentChat(chats[0]);
  }
};

export const loadChats = (): Chat[] => {
  const chat = loadCurrentChat();
  return chat ? [chat] : [];
};

export const saveCurrentChatId = (): void => {
  // No longer needed since we only have one chat
};

export const loadCurrentChatId = (): string | null => {
  const chat = loadCurrentChat();
  return chat ? chat.id : null;
};
