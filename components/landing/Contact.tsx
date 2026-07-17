'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { isValidEmail } from '@/lib/utils/validators';
import { Reveal } from '@/components/ui/Reveal';
import { Loader2 } from 'lucide-react';

export function Contact() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!message.trim()) {
      toast({ type: 'error', message: 'Please enter a message.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not send your message.');
      }

      toast({ type: 'success', message: "Message sent — we'll get back to you soon!" });
      setEmail('');
      setMessage('');
    } catch (err) {
      toast({ type: 'error', message: err instanceof Error ? err.message : 'Could not send your message.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="px-6 py-24">
      <Reveal className="mx-auto max-w-xl text-center">
        <h2 className="font-display text-4xl text-ink-800 dark:text-vellum-50">Still have questions?</h2>
        <p className="mt-3 text-ink-500 dark:text-vellum-300">Send us a note and we'll get back to you.</p>
        <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4 text-left">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            className="focus-ring w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm transition-shadow focus:shadow-md dark:border-ink-700 dark:bg-ink-800"
          />
          <textarea
            required
            placeholder="How can we help?"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
            className="focus-ring w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm transition-shadow focus:shadow-md dark:border-ink-700 dark:bg-ink-800"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending…
              </>
            ) : (
              'Send message'
            )}
          </Button>
        </form>
      </Reveal>
    </section>
  );
}
