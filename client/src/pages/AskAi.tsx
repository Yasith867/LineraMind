import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { TerminalCard, TerminalLine } from "@/components/TerminalCard";
import { useAskAi } from "@/hooks/use-linera";
import { Link } from "wouter";
import { Send, Loader2, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AskAi() {
  const [question, setQuestion] = useState("");
  const askMutation = useAskAi();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    askMutation.mutate(question);
  };

  const verifyId = askMutation.data ? `linera:${askMutation.data.chainId}:${askMutation.data.id}` : "";

  const formatAnswer = (text: string) => {
    // Remove markdown symbols (** **, -, *) and clean text
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1')
                         .replace(/^\s*[-*]\s+/gm, '')
                         .replace(/###/g, '')
                         .replace(/```[\s\S]*?```/g, '');

    return cleanText.split('\n\n').map((section, idx) => {
      const trimmed = section.trim();
      if (!trimmed) return null;

      const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('concept')) return '🧠';
        if (t.includes('how it works') || t.includes('mechanism')) return '⚙️';
        if (t.includes('key components') || t.includes('structure')) return '🧩';
        if (t.includes('characteristics') || t.includes('features')) return '📌';
        if (t.includes('function') || t.includes('does')) return '🎯';
        if (t.includes('summary') || t.includes('conclusion')) return '📝';
        return '✨';
      };

      const getHumanTitle = (title: string) => {
        const t = title.toLowerCase();
        if (t === 'role') return 'Core Function';
        if (t === 'main components') return 'Key Components';
        return title;
      };

      // Headings (Ends with colon and is short)
      if (trimmed.endsWith(':') && trimmed.length < 50) {
        const rawTitle = trimmed.replace(':', '');
        const title = getHumanTitle(rawTitle);
        return (
          <div key={idx} className="mt-8 mb-4 first:mt-0">
            <div className="flex items-center gap-2 mb-2 border-b border-primary/10 pb-1">
              <span className="text-xl">{getIcon(rawTitle)}</span>
              <h3 className="text-lg md:text-xl font-bold text-primary uppercase tracking-tight">{title}</h3>
            </div>
          </div>
        );
      }

      // Paragraph
      return <p key={idx} className="text-foreground/90 leading-relaxed text-base md:text-lg mb-6 last:mb-0">{trimmed}</p>;
    }).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12 md:py-20 flex flex-col gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">Ask LineraMind</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your question will be processed by AI and the result permanently stored on a Linera microchain.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-secondary/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Your Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What is the Linera protocol?"
                  className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none font-sans text-lg"
                  disabled={askMutation.isPending}
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={askMutation.isPending || !question.trim()}
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {askMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Ask LineraMind
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <AnimatePresence>
              {askMutation.isPending && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-secondary/30 border border-primary/20 rounded-xl p-4 flex items-center gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-sm font-mono text-primary">Reaching consensus on microchain...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Result Section */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {askMutation.data ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full"
                >
                  <TerminalCard title="Verification Record" className="h-full flex flex-col border-primary/30 shadow-primary/10 shadow-lg">
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="text-xs uppercase tracking-[0.2em] text-primary font-bold">AI Answer</div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] font-mono text-primary/80 uppercase">Microchain-style proof (simulated)</span>
                            </div>
                          </div>
                          
                          <div className="prose prose-invert max-w-none">
                            {formatAnswer(askMutation.data.answer)}
                          </div>
                        </div>

                        <div className="mt-12 space-y-4 border-t border-white/10 pt-6">
                          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">Deterministic ID</div>
                          <div className="flex gap-2 group">
                            <code className="flex-1 bg-black/40 p-3 rounded-xl border border-white/10 text-primary text-sm font-mono break-all group-hover:border-primary/30 transition-colors">
                              {verifyId}
                            </code>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-auto px-3 rounded-xl hover:bg-primary hover:text-white transition-all"
                              onClick={() => {
                                navigator.clipboard.writeText(verifyId);
                                // toast would be good here but keeping it simple as per instructions
                              }}
                              title="Copy ID"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">Block Height</div>
                            <div className="font-mono text-xs">{askMutation.data.blockHeight}</div>
                          </div>
                          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">Timestamp</div>
                            <div className="font-mono text-xs">{new Date(askMutation.data.timestamp!).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                      <Link href={`/verify?id=${verifyId}`}>
                        <Button variant="link" className="text-primary hover:text-primary/80 flex items-center gap-2 p-0 h-auto font-mono text-xs group">
                          Run Verification Check
                          <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Button>
                      </Link>
                    </div>
                  </TerminalCard>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full"
                >
                  <TerminalCard title="System Ready" className="h-full opacity-40 grayscale-[0.5] flex flex-col justify-center items-center">
                    <div className="flex flex-col items-center gap-4 text-center p-8">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-mono text-sm uppercase tracking-widest text-primary/60">Node Status: Online</p>
                        <p className="text-muted-foreground text-sm max-w-[200px]">Awaiting query input for microchain processing...</p>
                      </div>
                    </div>
                  </TerminalCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
