import { useState } from "react"
import { AlertTriangleIcon, ChevronDownIcon } from "lucide-react"
import { Alert, AlertDescription } from "@tidewater-dsa/ui/components/alert"
import { Button } from "@tidewater-dsa/ui/components/button"
import { cn } from "@tidewater-dsa/ui/lib/utils"

/**
 * Maps a raw technical error to a user-friendly headline and explanation.
 * This allows consumers to provide custom, context-specific error messaging tailored to individual features.
 */
export interface ErrorClassification {
  headline: string
  explanation: string
}

export type ErrorClassifier = (raw: string) => ErrorClassification

interface InlineErrorProps {
  /** Raw error message from the server / caught exception. */
  message: string
  /** Classifier that turns the raw message into a friendly headline + explanation. */
  classify: ErrorClassifier
  className?: string
}

export const InlineError = ({
  message,
  classify,
  className,
}: InlineErrorProps) => {
  const [showDetails, setShowDetails] = useState(false)

  const { headline, explanation } = classify(message)

  return (
    <Alert
      variant="destructive"
      className={cn("max-w-full border-destructive/40", className)}
    >
      <AlertTriangleIcon className="h-4 w-4" />
      <AlertDescription className="min-w-0">
        <p className="font-semibold text-destructive">{headline}</p>
        <p className="mt-1 text-sm text-destructive/80">{explanation}</p>

        <div className="mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails((prev) => !prev)}
            className="h-auto gap-1 px-2 py-1 text-xs text-destructive/70 hover:bg-destructive/5 hover:text-destructive"
            aria-expanded={showDetails}
          >
            <ChevronDownIcon
              className={cn(
                "h-3 w-3 transition-transform",
                showDetails && "rotate-180"
              )}
              aria-hidden
            />
            {showDetails ? "Hide technical details" : "Show technical details"}
          </Button>
          {showDetails && (
            <pre
              className="wrap-break-words mt-2 max-h-40 overflow-auto rounded border border-destructive/20 bg-destructive/5 p-3 text-xs whitespace-pre-wrap text-destructive/80"
              aria-label="Raw error message"
            >
              {message}
            </pre>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
