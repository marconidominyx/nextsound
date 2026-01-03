import React from "react";
import { Button } from "react-aria-components";
import { FiMusic, FiX } from "react-icons/fi";
import { useQueue } from "@/context/queueContext";
import { cn } from "@/utils";

interface QueueToggleProps {
	className?: string;
	isNotFoundPage?: boolean;
	showBg?: boolean;
}

export const QueueToggle: React.FC<QueueToggleProps> = ({
	className,
	isNotFoundPage = false,
	showBg = false,
}) => {
	const { isOpen, toggleQueue, queue } = useQueue();

	return (
		<Button
			onPress={toggleQueue}
			className={cn(
				"flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 border border-gray-300 dark:border-gray-600 relative",
				isNotFoundPage || showBg
					? "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
					: "bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20",
				className
			)}
			aria-label={isOpen ? "Close queue" : "Open queue"}
		>
			{isOpen ? (
				<>
					<FiX className="w-4 h-4 mr-2" />
					<span className="text-sm font-medium">Close Queue</span>
				</>
			) : (
				<>
					<FiMusic className="w-4 h-4 mr-2" />
					<span className="text-sm font-medium">Queue</span>
				</>
			)}
			{queue.length > 0 && (
				<span
					className={cn(
						"ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full min-w-[20px] text-center",
						isOpen
							? "bg-white/20 text-gray-700 dark:text-gray-300"
							: "bg-accent-orange text-white"
					)}
				>
					{queue.length > 99 ? "99+" : queue.length}
				</span>
			)}
			<kbd
				className={cn(
					"ml-2 px-1.5 py-0.5 text-xs font-mono rounded border text-[10px]",
					isNotFoundPage || showBg
						? "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
						: "bg-white/10 border-white/20 text-gray-300"
				)}
			>
				{navigator.platform.includes("Mac") ? "⌘Q" : "Ctrl+Q"}
			</kbd>
		</Button>
	);
};
