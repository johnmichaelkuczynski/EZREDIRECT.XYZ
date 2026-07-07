import { useState, useMemo } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { parseDomains, generateAllBlocks, generateDomainBlock } from "@/lib/domain-parser";
import { DomainOutput } from "@/components/domain-output";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Terminal, Zap, Trash2 } from "lucide-react";
import zhiLogo from "@assets/image_1783404397824.png";

const queryClient = new QueryClient();

function Home() {
  const [input, setInput] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  const parsedDomains = useMemo(() => parseDomains(input), [input]);
  const isOverLimit = parsedDomains.length > 50;
  const isInvalid = isOverLimit;

  const handleCopyAll = async () => {
    if (parsedDomains.length === 0 || isInvalid) return;
    const fullText = generateAllBlocks(parsedDomains);
    await navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col font-sans">
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Terminal className="h-5 w-5" />
            <h1 className="font-bold text-lg tracking-tight text-foreground">OAuth URL Generator</h1>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" />
            Runs entirely in your browser
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4 sticky top-24">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Input Domains</h2>
              <p className="text-sm text-muted-foreground">
                Paste a messy list of domains. We handle the formatting.
              </p>
            </div>
            {parsedDomains.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                data-testid="btn-clear-input"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          <div className="relative group">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`example.com\nhttps://www.apple.com\nhttp://another-client.io`}
              className="min-h-[400px] lg:min-h-[600px] font-mono text-sm resize-none bg-card border-border focus-visible:ring-primary/50 focus-visible:border-primary/50 p-4"
              data-testid="input-domains"
            />
            
            {/* Status Footer */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              {isOverLimit && (
                <span className="text-xs font-semibold text-destructive px-2 py-1 rounded bg-destructive/10">
                  Limit 50 exceeded
                </span>
              )}
              <span className={`text-xs font-mono px-2 py-1 rounded bg-secondary/80 backdrop-blur ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {parsedDomains.length} / 50 domains
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">Configuration Blocks</h2>
              <p className="text-sm text-muted-foreground">
                Click lines to copy individually, or grab them all.
              </p>
            </div>
            
            <Button
              onClick={handleCopyAll}
              disabled={parsedDomains.length === 0 || isInvalid}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-[0_0_20px_-5px_hsl(var(--primary))]"
              data-testid="btn-copy-all"
            >
              {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiedAll ? "Copied All" : "Copy All"}
            </Button>
          </div>

          <div className="flex flex-col gap-6">
            {parsedDomains.length === 0 ? (
              <div className="h-[400px] border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground bg-card/30">
                <div className="text-center flex flex-col items-center">
                  <Terminal className="h-8 w-8 mb-3 opacity-20" />
                  <p>Awaiting input...</p>
                </div>
              </div>
            ) : isInvalid ? (
              <div className="h-[400px] border border-dashed border-destructive/30 rounded-xl flex items-center justify-center text-destructive bg-destructive/5">
                <div className="text-center max-w-sm px-4">
                  <p className="font-semibold mb-1">Too many domains</p>
                  <p className="text-sm opacity-80">Please reduce your list to 50 or fewer domains to generate configurations.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pb-24">
                {parsedDomains.map((domain, idx) => (
                  <DomainOutput 
                    key={`${domain}-${idx}`} 
                    domain={domain} 
                    blockText={generateDomainBlock(domain)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 left-4 z-20 flex flex-col items-center gap-1.5">
        <img
          src={zhiLogo}
          alt="ZHI logo"
          className="h-9 w-9 rounded-md opacity-60 hover:opacity-100 transition-opacity"
          data-testid="img-zhi-logo"
        />
        <a
          href="mailto:zhi@zhisystems.org"
          className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
          data-testid="link-contact-us"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Enforce dark mode by applying 'dark' class to html automatically
  // Since this is a standalone tool, we just force the dark theme for the aesthetic requested.
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
