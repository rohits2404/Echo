import { cn } from "cn"
import { Button } from "@workspace/ui/components/button"

interface InfiniteScrollTriggerProps {
    canLoadMore: boolean
    isLoadingMore: boolean
    onLoadMore: () => void
    loadMoreText?: string
    noMoreText?: string
    className?: string
    ref?: React.Ref<HTMLDivElement>
}

export const InfiniteScrollTrigger = ({
    canLoadMore,
    isLoadingMore,
    onLoadMore,
    loadMoreText = "Load More",
    noMoreText = "No More Items",
    className,
    ref,
}: InfiniteScrollTriggerProps) => {
    let text = loadMoreText

    if (isLoadingMore) {
        text = "Loading..."
    } else if (!canLoadMore) {
        text = noMoreText
    }

    return (
        <div
            className={cn("flex w-full justify-center py-2", className)}
            ref={ref}
        >
            <Button
                disabled={!canLoadMore || isLoadingMore}
                onClick={onLoadMore}
                size="sm"
                variant="ghost"
            >
                {text}
            </Button>
        </div>
    )
}
