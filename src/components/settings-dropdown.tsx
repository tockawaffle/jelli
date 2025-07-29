"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Monitor, Moon, Settings, Sun, Video, VideoOff } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SettingsDropdown() {
	const { setTheme, theme } = useTheme();
	const [animationsEnabled, setAnimationsEnabled] = useState(true);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const storedAnimations = localStorage.getItem("animationsEnabled");
		if (storedAnimations !== null) {
			setAnimationsEnabled(JSON.parse(storedAnimations));
		}
	}, []);

	const toggleAnimations = () => {
		const newValue = !animationsEnabled;
		setAnimationsEnabled(newValue);
		localStorage.setItem("animationsEnabled", JSON.stringify(newValue));
		window.dispatchEvent(new Event("storage"));
	};

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-auto p-2">
				<Settings className="size-5" />
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-auto p-2 text-muted-foreground hover:text-foreground focus:ring-0 focus:ring-offset-0">
					<Settings className="size-5" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Appearance</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						{theme === 'light' ? <Sun className="mr-2 size-4" /> : theme === 'dark' ? <Moon className="mr-2 size-4" /> : <Monitor className="mr-2 size-4" />}
						<span>Theme</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={() => setTheme("light")}>
							<Sun className="mr-2 size-4" />
							<span>Light</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>
							<Moon className="mr-2 size-4" />
							<span>Dark</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>
							<Monitor className="mr-2 size-4" />
							<span>System</span>
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuItem onClick={toggleAnimations}>
					{animationsEnabled ? <Video className="mr-2 size-4" /> : <VideoOff className="mr-2 size-4" />}
					<span>{animationsEnabled ? "Disable" : "Enable"} Animations</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
} 