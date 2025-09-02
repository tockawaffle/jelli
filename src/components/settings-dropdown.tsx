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
import { Grid3x2, Monitor, Moon, Settings, Sun, Video, VideoOff } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";


export function SettingsDropdown() {
	const { setTheme, theme } = useTheme();
	const [animationsEnabled, setAnimationsEnabled] = useState(true);
	const [selectedAnimation, setSelectedAnimation] = useState<"squares" | "jelli" | "none" | null>(null);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const storedAnimations = localStorage.getItem("animationsEnabled");
		if (storedAnimations !== null) {
			setAnimationsEnabled(JSON.parse(storedAnimations));
		}
		const storedAnimation = localStorage.getItem("selectedAnimation");
		if (storedAnimation !== null) {
			setSelectedAnimation(storedAnimation as "squares" | "jelli" | "none");
		}
	}, []);

	const toggleAnimations = () => {
		const newValue = !animationsEnabled;
		setAnimationsEnabled(newValue);
		localStorage.setItem("animationsEnabled", JSON.stringify(newValue));
		window.dispatchEvent(new Event("storage-animation-state"));
	};

	const handleAnimationChange = (animation: "squares" | "jelli" | "none") => {
		setSelectedAnimation(animation);
		localStorage.setItem("selectedAnimation", animation);
		window.dispatchEvent(new Event("storage-animation-which"));
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
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="disabled:opacity-50 disabled:cursor-not-allowed" disabled={!animationsEnabled}>
						{selectedAnimation === "squares" ? (
							<Grid3x2 className="mr-2 size-4" />
						) : selectedAnimation === "jelli" ? (
							<Image priority={false} loading="lazy" src="images/logos/jelli.svg" alt="Jelli" className="mr-2 size-4" width={16} height={16} />
						) : (
							<VideoOff className={`mr-2 size-4 ${animationsEnabled ? "text-foreground" : "text-muted-foreground"}`} />
						)}
						<span className={animationsEnabled ? "" : "text-muted-foreground"}>Animations</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={() => handleAnimationChange("squares")}>
							<Grid3x2 className="mr-2 size-4" />
							<span>Squares</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleAnimationChange("jelli")}>
							<Image priority={false} loading="lazy" src="images/logos/jelli.svg" alt="Jelli" className="mr-2 size-4" width={16} height={16} />
							<span>Jelli</span>
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleAnimationChange("none")}>
							<VideoOff className="mr-2 size-4" />
							<span>None</span>
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
} 