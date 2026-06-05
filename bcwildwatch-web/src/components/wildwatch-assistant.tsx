'use client';

import { useEffect, useRef, useState } from 'react';
import { getAssistantReply, type AssistantReply } from '@/lib/assistant';
import { Icon } from '@/components/icons';

type ChatMessage =
  | { role: 'user'; text: string }
  | { role: 'assistant'; reply: AssistantReply };

const SUGGESTIONS = [
  'Snake near Building 4',
  'How do I report a sighting?',
  'Bees by the entrance',
];

const GREETING: AssistantReply = getAssistantReply('hello');

export function WildWatchAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', reply: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    const reply = getAssistantReply(trimmed);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', reply }]);
      setTyping(false);
    }, 550);
  }

  return (
    <div className="card ai-panel">
      <div className="ai-panel__head">
        <span className="ai-panel__avatar">
          <Icon.sparkle size={20} />
        </span>
        <div>
          <h4>WildWatch Assistant</h4>
          <div className="ai-panel__status">
            <span className="d" /> Online · instant safety guidance
          </div>
        </div>
      </div>

      <div className="ai-panel__body scroll-soft" ref={bodyRef} aria-live="polite">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="bubble bubble--user">
              {m.text}
            </div>
          ) : (
            <AssistantBubble key={i} reply={m.reply} />
          ),
        )}
        {typing && (
          <div className="bubble bubble--ai typing" aria-hidden>
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      {messages.length <= 1 && !typing && (
        <div className="ai-panel__suggest">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="ai-panel__input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about campus wildlife safety…"
          aria-label="Message the WildWatch Assistant"
        />
        <button type="submit" className="btn" disabled={!input.trim()} aria-label="Send">
          <Icon.send size={17} />
        </button>
      </form>
    </div>
  );
}

function AssistantBubble({ reply }: { reply: AssistantReply }) {
  return (
    <div className="bubble bubble--ai">
      <span className="bubble__ico">
        <Icon.sparkle size={13} />
      </span>
      <div>
        <p>{reply.text}</p>

        {reply.whatToDo && reply.whatToDo.length > 0 && (
          <>
            <p className="mono" style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              DO
            </p>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
              {reply.whatToDo.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}

        {reply.avoid && reply.avoid.length > 0 && (
          <>
            <p className="mono" style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
              AVOID
            </p>
            <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
              {reply.avoid.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}

        {reply.contacts && reply.contacts.length > 0 && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
            {reply.contacts.map((c) => (
              <li key={c.label}>
                <b>{c.label}:</b> {c.value}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
