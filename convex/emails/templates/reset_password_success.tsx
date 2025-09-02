import {
	Body,
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
	Text
} from "@react-email/components"
import { User } from "better-auth"
import dayjs from "dayjs"

interface ResetPasswordSuccessProps {
	user: User
}

export const ResetPasswordSuccess = ({ user }: ResetPasswordSuccessProps) => {
	const profileImage =
		user.image ||
		"https://kf9653eimo.ufs.sh/f/JLwV8LM67suiZK8ap69z12uFvPBalx90RDhSAbJm4GrMkjdV"

	return (
		<Html>
			<Head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</Head>
			<Preview>Your password has been changed successfully</Preview>
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
						<Heading style={styles.heading}>Password Changed Successfully</Heading>
						<Text style={styles.subheading}>Your account is now secured with a new password</Text>

						<Section style={styles.contentCard}>
							<Text style={styles.greeting}>Hello {user.name},</Text>
							<Text style={styles.paragraph}>
								This email confirms that the password for your Jelli account has been successfully changed.
							</Text>
							<Text style={styles.paragraph}>
								If you did not make this change, please secure your account immediately by contacting our support team.
							</Text>
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
								<li style={styles.securityItem}>
									For your security, we recommend keeping your password confidential.
								</li>
								<li style={styles.securityItem}>
									Avoid using the same password across multiple websites.
								</li>
								<li style={styles.securityItem}>
									Consider enabling two-factor authentication for an extra layer of security.
								</li>
							</ul>
						</Section>

						<Text style={styles.noteText}>Thank you for helping us keep your account secure.</Text>
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
		body: { padding: "16px 12px" },
		container: { borderRadius: "calc(0.3rem - 4px)" },
		mainContent: { padding: "24px 20px" },
		heading: { fontSize: "24px" },
		contentCard: { padding: "20px" },
		securitySection: { padding: "16px" },
		footer: { padding: "20px" },
	},
}

export default ResetPasswordSuccess
