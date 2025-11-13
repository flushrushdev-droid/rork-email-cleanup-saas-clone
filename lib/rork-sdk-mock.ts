/**
 * Mock Rork SDK for Local Development
 * 
 * This file mocks @rork-ai/toolkit-sdk for local development.
 * It provides the same API but with mock implementations.
 * 
 * DO NOT PUSH TO MAIN - This is for local development only
 */

import { useState } from 'react';

interface ToolPart {
  type: 'tool';
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'error';
}

interface TextPart {
  type: 'text';
  text: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: (TextPart | ToolPart)[];
}

interface RorkAgentOptions {
  tools?: Record<string, any>;
}

interface RorkAgentReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
}

/**
 * Mock implementation of useRorkAgent hook
 * Simulates AI chat interactions locally
 */
export function useRorkAgent(options?: RorkAgentOptions): RorkAgentReturn {
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = async (userMessage: string) => {
    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      parts: [{ type: 'text', text: userMessage }],
    };

    setMessages(prev => [...prev, userMsg]);

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock AI response
    const aiResponse = generateMockResponse(userMessage, options?.tools);
    
    const aiMsg: Message = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      parts: aiResponse,
    };

    setMessages(prev => [...prev, aiMsg]);
  };

  return {
    messages,
    sendMessage,
  };
}

/**
 * Mock implementation of createRorkTool
 * Creates a mock tool that can be called by the AI
 */
export function createRorkTool<T>(config: {
  description: string;
  zodSchema: any;
  execute: (input: T) => string | Promise<string>;
}) {
  return {
    description: config.description,
    zodSchema: config.zodSchema,
    execute: config.execute,
  };
}

/**
 * Generate mock AI responses based on user input
 */
function generateMockResponse(
  userMessage: string, 
  tools?: Record<string, any>
): (TextPart | ToolPart)[] {
  const lowerMessage = userMessage.toLowerCase();

  // Mock responses for common queries
  if (lowerMessage.includes('summarize') || lowerMessage.includes('unread')) {
    return [
      { type: 'text', text: "I'll summarize your unread emails for you." },
      { type: 'tool', toolName: 'prioritizeEmail', state: 'output-available' },
      { 
        type: 'text', 
        text: "You have 3,847 unread emails. Here are the highlights:\n\n• 24 emails require action (HR, clients, billing)\n• 1,270 promotional emails (can be archived)\n• 634 social notifications\n• 156 invoices and receipts\n\nWould you like me to help organize these?"
      },
    ];
  }

  if (lowerMessage.includes('time waster') || lowerMessage.includes('waste')) {
    return [
      { 
        type: 'text', 
        text: "Based on your email patterns, your top time wasters are:\n\n1. **Marketing emails** (42% of inbox)\n   - Medium Daily Digest: 847 emails\n   - LinkedIn notifications: 634 emails\n\n2. **Promotional emails** (35%)\n   - Online Retailer Deals: 423 emails\n\n3. **Low engagement newsletters** (15%)\n\nI can help you unsubscribe or create rules to auto-archive these. What would you like to do?"
      },
    ];
  }

  if (lowerMessage.includes('rule') || lowerMessage.includes('automat')) {
    return [
      { type: 'text', text: "I'll create an automation rule for you." },
      { type: 'tool', toolName: 'createRule', state: 'output-available' },
      { 
        type: 'text', 
        text: "Rule created successfully! I've set up:\n\n📋 **Rule:** Auto-archive old newsletters\n• **When:** Emails from newsletters older than 30 days\n• **Action:** Move to archive\n• **Apply to:** 847 existing emails\n\nThis will save you approximately 180 minutes per month. Would you like to enable it?"
      },
    ];
  }

  if (lowerMessage.includes('unsubscribe') || lowerMessage.includes('marketing')) {
    return [
      { 
        type: 'text', 
        text: "I found several marketing senders you might want to unsubscribe from:\n\n1. Medium Daily Digest (847 emails, 12% open rate)\n2. Online Retailer Deals (423 emails, 5% open rate)\n3. LinkedIn notifications (634 emails, 18% open rate)\n\nUnsubscribing from these would:\n• Clear 1,904 emails from your inbox\n• Save 2.4 GB of storage\n• Save ~200 minutes per month\n\nWould you like me to unsubscribe from these?"
      },
    ];
  }

  if (lowerMessage.includes('prioritize') || lowerMessage.includes('important')) {
    return [
      { type: 'tool', toolName: 'prioritizeEmail', state: 'output-available' },
      { 
        type: 'text', 
        text: "I've analyzed your inbox. Here are your priority emails:\n\n🔴 **Action Required (24 emails)**\n• HR: Benefits enrollment deadline\n• Finance: AWS invoice ready\n• Manager: Q1 project planning meeting\n\n🟡 **Later (45 emails)**\n• Team updates and FYIs\n\n🟢 **Low Priority (3,778 emails)**\n• Newsletters, promotions, social\n\nFocus on the red items first. Want me to organize the rest?"
      },
    ];
  }

  // Default response
  return [
    { 
      type: 'text', 
      text: `I'm your AI email assistant! I can help you with:\n\n• Summarizing unread emails\n• Identifying time wasters\n• Creating automation rules\n• Unsubscribing from newsletters\n• Prioritizing important messages\n• Organizing your inbox\n\nWhat would you like me to help with?`
    },
  ];
}

