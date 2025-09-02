import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Text,
} from "@react-email/components"
import { User } from "better-auth"
import dayjs from "dayjs"

interface ResetPasswordRequestProps {
	url: string
	token: string
	user: User
}

export const ResetPasswordRequest = ({ url, token, user }: ResetPasswordRequestProps) => {
	// Get user's profile image if available
	const profileImage =
		user.image ||
		"https://kf9653eimo.ufs.sh/f/JLwV8LM67suiZK8ap69z12uFvPBalx90RDhSAbJm4GrMkjdV"

	// Format the verification URL with token
	const resetUrl = `${url}?token=${token}`

	return (
		<Html>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<Preview>Reset your password for your Jelli account</Preview>
			<Body style={styles.body}>
				<Container style={styles.container}>
					{/* Header */}
					<Section style={styles.header}>
						<Row>
							<Column>
								<Img src={profileImage} alt="Logo" width="64" height="64" style={styles.logo} />
							</Column>
						</Row>
					</Section>

					{/* Main Content */}
					<Section style={styles.mainContent}>
						<Heading style={styles.heading}>Password Reset Request</Heading>
						<Text style={styles.subheading}>Please reset your password</Text>

						<Section style={styles.contentCard}>
							<Text style={styles.greeting}>Hello {user.name},</Text>
							<Text style={styles.paragraph}>
								We received a request to reset your password. Please click the button below to complete this process.
							</Text>

							{/* Verification Button */}
							<Section style={styles.buttonContainer}>
								<Button style={styles.button} href={resetUrl}>
									Reset Password
								</Button>
							</Section>
						</Section>

						{/* Verification Token */}
						<Section style={styles.tokenSection}>
							<Text style={styles.tokenLabel}>If the button doesn&apos;t work, use this verification code:</Text>
							<div style={styles.tokenBox}>
								<Text style={styles.token}>{token}</Text>
							</div>
						</Section>

						{/* Security Notice */}
						<Section style={styles.securitySection}>
							<div style={styles.securityHeader}>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									style={styles.securityIcon}
								>
									<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
								</svg>
								<Text style={styles.securityTitle}>Security Information</Text>
							</div>
							<ul style={styles.securityList}>
								<li style={styles.securityItem}>This link will expire in 24 hours</li>
								<li style={styles.securityItem}>
									If you didn&apos;t request this password reset, please secure your account immediately
								</li>
								<li style={styles.securityItem}>
									After resetting, your account will be accessible with the new password
								</li>
							</ul>
						</Section>

						<Text style={styles.noteText}>If you didn&apos;t request this email and do not have an account, please ignore and delete it.</Text>
					</Section>

					{/* Footer */}
					<Section style={styles.footer}>
						<Text style={styles.copyright}>© {dayjs().year()} Jelli. All rights reserved.</Text>
						<div style={styles.footerLinks}>
							<Link href="#" style={styles.link}>
								Privacy Policy
							</Link>
							<span style={styles.divider}>•</span>
							<Link href="#" style={styles.link}>
								Terms of Service
							</Link>
							<span style={styles.divider}>•</span>
							<Link href="#" style={styles.link}>
								Contact Support
							</Link>
						</div>
					</Section>
				</Container>
			</Body>
		</Html>
	)
}

// Styles strictly based on globals.css
const styles = {
	body: {
		backgroundColor: "oklch(0.98 0 0)", // --background from globals.css
		fontFamily: "Geist Mono, monospace", // --font-sans from globals.css
		margin: 0,
		padding: "24px",
		color: "oklch(0.24 0 0)", // --foreground from globals.css
		letterSpacing: "0.05em", // --tracking-normal from globals.css
	},
	container: {
		width: "100%",
		maxWidth: "550px",
		margin: "0 auto",
		backgroundColor: "oklch(0.99 0 0)", // --card from globals.css
		borderRadius: "0.3rem", // --radius from globals.css
		overflow: "hidden",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 2px 4px -0.5px hsl(0 0% 10.20% / 0.20)", // --shadow-md from globals.css
	},
	header: {
		backgroundColor: "oklch(0.44 0.04 44.87)", // --primary from globals.css
		padding: "32px 0",
		textAlign: "center" as const,
	},
	logo: {
		borderRadius: "50%",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 1px 2px -0.5px hsl(0 0% 10.20% / 0.20)", // --shadow-sm from globals.css
		border: "2px solid oklch(1.00 0 0)", // --primary-foreground from globals.css
		margin: "0 auto",
		display: "block",
		backgroundColor: "oklch(1.00 0 0)", // --primary-foreground from globals.css
	},
	mainContent: {
		backgroundColor: "oklch(0.99 0 0)", // --card from globals.css
		padding: "32px 36px",
		color: "oklch(0.24 0 0)", // --card-foreground from globals.css
	},
	heading: {
		fontSize: "26px",
		fontWeight: "700",
		color: "oklch(0.24 0 0)", // --card-foreground from globals.css
		textAlign: "center" as const,
		margin: "0 0 8px",
		lineHeight: "1.3",
		fontFamily: "Inter, sans-serif", // --font-serif from globals.css
	},
	subheading: {
		fontSize: "16px",
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		textAlign: "center" as const,
		margin: "0 0 28px",
		fontWeight: "400",
	},
	contentCard: {
		backgroundColor: "oklch(0.95 0 0)", // --muted from globals.css
		borderRadius: "0.3rem", // --radius from globals.css
		padding: "24px",
		marginBottom: "28px",
		border: "1px solid oklch(0.88 0 0)", // --border from globals.css
	},
	greeting: {
		fontSize: "18px",
		fontWeight: "600",
		color: "oklch(0.24 0 0)", // --card-foreground from globals.css
		margin: "0 0 16px",
		fontFamily: "Inter, sans-serif", // --font-serif from globals.css
	},
	paragraph: {
		fontSize: "16px",
		lineHeight: "1.6",
		color: "oklch(0.24 0 0)", // --card-foreground from globals.css
		margin: "0 0 24px",
	},
	buttonContainer: {
		textAlign: "center" as const,
		margin: "24px 0 8px",
	},
	button: {
		backgroundColor: "oklch(0.44 0.04 44.87)", // --primary from globals.css
		borderRadius: "0.3rem", // --radius from globals.css
		color: "oklch(1.00 0 0)", // --primary-foreground from globals.css
		fontSize: "16px",
		fontWeight: "600",
		textDecoration: "none",
		textAlign: "center" as const,
		display: "inline-block",
		padding: "12px 28px",
		border: "none",
		boxShadow: "0 1px 5px 0.5px hsl(0 0% 10.20% / 0.20), 0 1px 2px -0.5px hsl(0 0% 10.20% / 0.20)", // --shadow-sm from globals.css
	},
	tokenSection: {
		margin: "28px 0",
		textAlign: "center" as const,
	},
	tokenLabel: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		marginBottom: "12px",
	},
	tokenBox: {
		backgroundColor: "oklch(0.95 0 0)", // --muted from globals.css
		borderRadius: "0.3rem", // --radius from globals.css
		padding: "16px",
		maxWidth: "100%",
		overflowX: "auto" as const,
		margin: "0 auto",
		display: "inline-block",
		border: "1px solid oklch(0.88 0 0)", // --border from globals.css
		boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.04)",
	},
	token: {
		fontSize: "16px",
		fontFamily: "JetBrains Mono, monospace", // --font-mono from globals.css
		fontWeight: "600",
		color: "oklch(0.44 0.04 44.87)", // --primary from globals.css
		margin: "0",
		padding: 0,
		wordBreak: "break-all" as const,
		textAlign: "center" as const,
		lineHeight: "1.4",
		userSelect: "all" as const,
	},
	securitySection: {
		margin: "28px 0 24px",
		padding: "20px",
		backgroundColor: "oklch(0.93 0 0)", // --accent from globals.css
		borderRadius: "0.3rem", // --radius from globals.css
		border: "1px solid oklch(0.88 0 0)", // --border from globals.css
	},
	securityHeader: {
		display: "flex",
		alignItems: "center",
		marginBottom: "12px",
	},
	securityIcon: {
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		marginRight: "8px",
	},
	securityTitle: {
		fontSize: "16px",
		fontWeight: "600",
		color: "oklch(0.24 0 0)", // --accent-foreground from globals.css
		margin: "0",
		fontFamily: "Inter, sans-serif", // --font-serif from globals.css
	},
	securityList: {
		margin: "10px 0 0",
		paddingLeft: "20px",
	},
	securityItem: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		margin: "0 0 8px",
		lineHeight: "1.5",
	},
	noteText: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		fontStyle: "italic",
		lineHeight: "1.5",
		margin: "20px 0 0",
		textAlign: "center" as const,
	},
	footer: {
		padding: "24px 36px",
		backgroundColor: "oklch(0.95 0 0)", // --muted from globals.css
		borderTop: "1px solid oklch(0.88 0 0)", // --border from globals.css
		textAlign: "center" as const,
	},
	copyright: {
		fontSize: "14px",
		color: "oklch(0.50 0 0)", // --muted-foreground from globals.css
		margin: "0 0 12px",
	},
	footerLinks: {
		display: "flex",
		justifyContent: "center" as const,
		flexWrap: "wrap" as const,
	},
	link: {
		color: "oklch(0.44 0.04 44.87)", // --primary from globals.css
		textDecoration: "none",
		fontSize: "14px",
		margin: "0 4px",
	},
	divider: {
		color: "oklch(0.88 0 0)", // --border from globals.css
		margin: "0 6px",
		fontSize: "14px",
	},
	"@media only screen and (max-width: 600px)": {
		body: {
			padding: "16px 12px",
		},
		container: {
			borderRadius: "calc(0.3rem - 4px)", // --radius-sm from globals.css
		},
		mainContent: {
			padding: "24px 20px",
		},
		heading: {
			fontSize: "24px",
		},
		contentCard: {
			padding: "20px",
		},
		button: {
			width: "100%",
			padding: "14px 20px",
		},
		securitySection: {
			padding: "16px",
		},
		footer: {
			padding: "20px",
		},
		token: {
			fontSize: "14px",
		},
		tokenBox: {
			padding: "12px",
		},
	},
}

export default ResetPasswordRequest
