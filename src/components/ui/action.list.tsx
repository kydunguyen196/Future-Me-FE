import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "./dropdown-menu";
import { MoreVertical } from "lucide-react";

export interface ActionItem {
    id: string,
    icon: IconName,
    color?: string,
    label: string,
    handle: any
}

export function ActionList({ actions, icon }: { actions: ActionItem[], icon?: IconName }) {
    return <DropdownMenu>
        <DropdownMenuTrigger className="w-8" asChild>
            <div className="p-2 rounded-lg hover:bg-blue-500 hover:text-white cursor-pointer">
                {icon ? <DynamicIcon name={icon} size={16} /> : <MoreVertical size={16} />}
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-auto min-w-50" side="right" align="start">
            {
                actions.map(action => (
                    <DropdownMenuItem key={action.id} className={`cursor-pointer ${action.color} hover:bg-blue-400`} onClick={action.handle}>
                        <DynamicIcon name={action.icon} className={`text-muted-foreground ${action.color}`} />
                        <div className={`${action.color}`}>{action.label}</div>
                    </DropdownMenuItem>
                ))
            }
        </DropdownMenuContent>
    </DropdownMenu>
};