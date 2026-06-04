'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getAssistantReply, type AssistantReply } from '@/lib/assistant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; reply: AssistantReply };

const SUGGESTIONS = [
  'There is a snake near Block A',
  'How do I report a sighting?',
  'A swarm of bees is by the entrance',
];

const GREETING: AssistantReply = getAssistantReply('hello');

export function WildWatchAssistant() {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', reply: GREETING }]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages, reduce]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [
      ...m,
      { role: 'user', text: trimmed },
      { role: 'assistant', reply: getAssistantReply(trimmed) },
    ]);
    setInput('');
  }

  return (
    <Card className="flex h-[60vh] flex-col overflow-hidden p-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <UserBubble key={i} text={m.text} reduce={!!reduce} />
          ) : (
            <AssistantBubble key={i} reply={m.reply} reduce={!!reduce} />
          ),
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {SUGGESTIONS.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
              {s}
            </Button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about campus wildlife safety…"
          aria-label="Message the WildWatch Assistant"
        />
        <Button type="submit" disabled={!input.trim()}>
          Send
        </Button>
      </form>
    </Card>
  );
}

function Wrap({
  children,
  reduce,
  className,
}: {
  children: React.ReactNode;
  reduce: boolean;
  className: string;
}) {
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function UserBubble({ text, reduce }: { text: string; reduce: boolean }) {
  return (
    <Wrap reduce={reduce} className="flex justify-end">
      <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
        {text}
      </div>
    </Wrap>
  );
}

function AssistantBubble({ reply, reduce }: { reply: AssistantReply; reduce: boolean }) {
  const emergency = reply.kind === 'emergency';
  return (
    <Wrap reduce={reduce} className="flex justify-start">
      <div
        className={`max-w-[85%] space-y-2 rounded-lg px-3 py-2 text-sm ${
          emergency
            ? 'border border-red-300 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
            : 'bg-muted text-foreground'
        }`}
      >
        <p>{reply.text}</p>

        {reply.whatToDo && reply.whatToDo.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Do</p>
            <ul className="ml-4 list-disc">
              {reply.whatToDo.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {reply.avoid && reply.avoid.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Avoid</p>
            <ul className="ml-4 list-disc">
              {reply.avoid.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {reply.contacts && reply.contacts.length > 0 && (
          <ul className="space-y-0.5">
            {reply.contacts.map((c) => (
              <li key={c.label}>
                <span className="font-medium">{c.label}:</span> {c.value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Wrap>
  );
}
