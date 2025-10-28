import { FileTextIcon, QrCode, SmartphoneNfc } from "lucide-react";

export const METHOD_OPTIONS = [
	{
		id: "qr" as const,
		icon: QrCode,
		title: "QR Code",
		description: "Scan at kiosk or team device",
	},
	{
		id: "nfc" as const,
		icon: SmartphoneNfc,
		title: "NFC Tag",
		description: "Tap NFC tag for instant clock in/out",
	},
	{
		id: "request" as const,
		icon: FileTextIcon,
		title: "Manual Request",
		description: "Best for off-site or time corrections",
	},
] as const;

