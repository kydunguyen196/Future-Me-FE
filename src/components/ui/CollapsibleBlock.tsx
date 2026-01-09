import { memo, useState } from "react";
import type { ReactNode } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";

interface CollapsibleBlockProps {
	children: ReactNode;
	title?: string;
	subtitle?: string;
	icon?: IconName | '';
	action?: ReactNode;
	subBlock?: boolean;
}

const CollapsibleBlock = ({ children, title = "Title", subtitle, icon = '', action = '', subBlock = false }: CollapsibleBlockProps) => {
	const [open, setOpen] = useState(false);
	let ec = [];

	if (!subBlock) {
		ec.push("shadow-md");
		ec.push("mb-8");
	}

	return (
		<Collapsible
			className={`CollapsibleRoot relative p-4 rounded-lg ${ec.join(" ")}`}
			open={open}
			onOpenChange={setOpen}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<CollapsibleTrigger asChild>
					<div className="header-title flex gap-2 items-center cursor-pointer">
						{icon && icon.length ? <DynamicIcon name={icon as IconName} size={subBlock ? 28 : 32} /> : ""}
						<div className="flex flex-col text-left">
							<span className="Text font-medium">{title}</span>
							<span className="Text font-xs text-gray-400">{subtitle}</span>
						</div>
					</div>
				</CollapsibleTrigger>
				{action}
			</div>

			<CollapsibleContent>
				{children}
			</CollapsibleContent>
		</Collapsible>
	);
};

export default memo(CollapsibleBlock);
