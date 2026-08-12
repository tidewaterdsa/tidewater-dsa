import { SearchIcon, XIcon } from "lucide-react"
import { Input } from "@tidewater-dsa/ui/components/input"
import { cn } from "@tidewater-dsa/ui/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  ariaLabel: string
  className?: string
}

export const SearchInput = ({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: SearchInputProps) => (
  <div
    className={cn(
      "relative flex min-w-0 flex-1 items-stretch rounded-sm border-2 border-border bg-background transition-colors focus-within:border-foreground",
      className
    )}
  >
    <span
      aria-hidden
      className="grid shrink-0 place-items-center pl-2 pr-1 text-foreground-soft"
    >
      <SearchIcon className="size-4" />
    </span>
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 border-0 bg-transparent px-0 pl-0.5 shadow-none focus-visible:border-0 focus-visible:ring-0"
      aria-label={ariaLabel}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear search"
        className="grid shrink-0 cursor-pointer place-items-center px-3 text-foreground-soft transition-colors hover:text-primary"
      >
        <XIcon className="size-4" />
      </button>
    )}
  </div>
)
