"use client";

import { Button } from "@workspace/ui/components/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@workspace/ui/components/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { UserOption } from "./list/get-user-options";

type AssigneeMultiSelectProps = {
	disabled?: boolean;
	onChange: (value: string[]) => void;
	options: UserOption[];
	value: string[];
};

export function AssigneeMultiSelect({
	disabled,
	onChange,
	options,
	value,
}: AssigneeMultiSelectProps) {
	const [open, setOpen] = useState(false);

	function toggleOption(optionId: string) {
		if (value.includes(optionId)) {
			onChange(value.filter((id) => id !== optionId));
		} else {
			onChange([...value, optionId]);
		}
	}

	function getDisplayLabel() {
		if (value.length === 0) return "担当者を選択";
		if (value.length === 1) {
			const found = options.find((o) => o.userId === value[0]);
			return found?.fullName ?? "担当者を選択";
		}
		return `${value.length}人選択中`;
	}

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<Button
					className="max-w-xs w-full justify-between font-normal"
					disabled={disabled}
					role="combobox"
					type="button"
					variant="outline"
				>
					<span className={value.length === 0 ? "text-muted-foreground" : ""}>
						{getDisplayLabel()}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="max-w-xs w-full p-0">
				<Command>
					<CommandInput placeholder="担当者を検索..." />
					<CommandList>
						<CommandEmpty>担当者が見つかりません</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.userId}
									onSelect={() => toggleOption(option.userId)}
									value={option.fullName}
								>
									<Check
										className={
											value.includes(option.userId)
												? "opacity-100"
												: "opacity-0"
										}
									/>
									{option.fullName}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
