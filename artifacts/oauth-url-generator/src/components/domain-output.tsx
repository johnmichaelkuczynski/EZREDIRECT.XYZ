import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DomainOutputProps {
  domain: string;
  blockText: string;
}

export function DomainOutput({ domain, blockText }: DomainOutputProps) {
  const [copiedBlock, setCopiedBlock] = useState(false);
  const [copiedLineIndex, setCopiedLineIndex] = useState<number | null>(null);

  const handleCopyBlock = async () => {
    await navigator.clipboard.writeText(blockText);
    setCopiedBlock(true);
    setTimeout(() => setCopiedBlock(false), 2000);
  };

  const handleCopyLine = async (text: string, index: number) => {
    if (!text.trim()) return; // Don't copy empty lines
    await navigator.clipboard.writeText(text);
    setCopiedLineIndex(index);
    setTimeout(() => setCopiedLineIndex(null), 1500);
  };

  const lines = blockText.split("\n");

  return (
    <div className="relative group rounded-md border border-border bg-card overflow-hidden transition-colors hover:border-primary/50" data-testid={`output-block-${domain}`}>
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyBlock}
          className="h-8 gap-2 bg-secondary/80 hover:bg-primary hover:text-primary-foreground backdrop-blur-sm"
          data-testid={`btn-copy-block-${domain}`}
        >
          {copiedBlock ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="text-xs">{copiedBlock ? "Copied" : "Copy Block"}</span>
        </Button>
      </div>
      <div className="p-4 font-mono text-sm overflow-x-auto whitespace-pre leading-relaxed">
        {lines.map((line, i) => {
          const isUrl = line.startsWith("http");
          const isSeparator = line.startsWith("===");
          const isEmpty = line.trim() === "";
          
          if (isSeparator || isEmpty || (!isUrl && i < 3)) {
            // Uncopyable structural lines
            return (
              <div key={i} className={cn("text-muted-foreground", isSeparator && "opacity-30")}>
                {line || " "}
              </div>
            );
          }

          // Clickable lines (URLs and headers)
          return (
            <div
              key={i}
              onClick={() => handleCopyLine(line, i)}
              className={cn(
                "group/line cursor-pointer rounded px-2 -mx-2 flex items-center justify-between transition-colors",
                isUrl ? "text-primary hover:bg-primary/10" : "text-foreground font-semibold mt-4 hover:bg-white/5",
                copiedLineIndex === i && (isUrl ? "bg-primary/20 text-primary" : "bg-white/10")
              )}
              title="Click to copy line"
              data-testid={`line-copy-${domain}-${i}`}
            >
              <span>{line}</span>
              {copiedLineIndex === i ? (
                <Check className="h-3 w-3 shrink-0 ml-4 opacity-70" />
              ) : (
                <Copy className="h-3 w-3 shrink-0 ml-4 opacity-0 group-hover/line:opacity-50 transition-opacity" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
