"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
	return (
		<div className="w-full h-full bg-background overflow-hidden">
			<div className="flex h-full">
				{/* Sidebar Skeleton */}
				<div className="flex h-full w-56 flex-col border-r">
					<div className="flex flex-1 flex-col pt-4 pb-3 overflow-y-auto">
						{/* Organization Switcher Skeleton */}
						<div className="px-3 mb-5">
							<div className="w-full p-2.5 border rounded-md">
								<div className="flex items-center space-x-2">
									<Skeleton className="h-5 w-5 rounded" />
									<div className="flex-1">
										<Skeleton className="h-3.5 w-20 mb-1" />
										<Skeleton className="h-2.5 w-14" />
									</div>
									<Skeleton className="h-3.5 w-3.5" />
								</div>
							</div>
						</div>

						{/* Navigation Menu Skeleton */}
						<nav className="mt-4 flex-1 px-3 space-y-1">
							{Array.from({ length: 6 }).map((_, index) => (
								<div
									key={index}
									className={`w-full p-1.5 rounded-md flex items-center space-x-2.5 ${index === 0 ? "bg-muted" : ""
										}`}
								>
									<Skeleton className="h-4 w-4" />
									<Skeleton className="h-3.5 w-16" />
								</div>
							))}
						</nav>

						{/* Secondary Navigation Skeleton */}
						<nav className="mt-5 px-3 space-y-1">
							<div className="px-2.5 py-1.5">
								<Skeleton className="h-2.5 w-14" />
							</div>
							{Array.from({ length: 2 }).map((_, index) => (
								<div key={index} className="w-full p-1.5 rounded-md flex items-center space-x-2.5">
									<Skeleton className="h-4 w-4" />
									<Skeleton className="h-3.5 w-20" />
								</div>
							))}
						</nav>
					</div>
				</div>

				{/* Main Content Skeleton */}
				<main className="flex-1 p-7">
					{/* Welcome Section Skeleton */}
					<div className="mb-7">
						<Skeleton className="h-7 w-72 mb-2" />
						<Skeleton className="h-4 w-80" />
					</div>

					{/* Metrics Grid Skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
						{Array.from({ length: 4 }).map((_, index) => (
							<Card key={index} className="transition-all bg-card">
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
									<Skeleton className="h-3.5 w-28" />
									<Skeleton className="h-3.5 w-3.5" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-7 w-14 mb-2" />
									<Skeleton className="h-2.5 w-20" />
								</CardContent>
							</Card>
						))}
					</div>

					{/* Main Content Grid Skeleton */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
						{/* Recent Activity Skeleton */}
						<div className="lg:col-span-2">
							<Card className="bg-card">
								<CardHeader>
									<Skeleton className="h-5 w-28" />
								</CardHeader>
								<CardContent>
									<div className="space-y-3.5">
										{Array.from({ length: 4 }).map((_, index) => (
											<div key={index} className="flex items-center space-x-3.5">
												<Skeleton className="h-8 w-8 rounded-full" />
												<div className="flex-1 space-y-2">
													<Skeleton className="h-3.5 w-20" />
													<Skeleton className="h-2.5 w-36" />
												</div>
												<div className="flex items-center space-x-2">
													<Skeleton className="h-4 w-14 rounded-full" />
													<Skeleton className="h-2.5 w-10" />
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Right Column Skeleton */}
						<div className="space-y-5">
							{/* Team Status Skeleton */}
							<Card className="bg-card">
								<CardHeader>
									<Skeleton className="h-5 w-20" />
								</CardHeader>
								<CardContent>
									<div className="space-y-3.5">
										{Array.from({ length: 4 }).map((_, index) => (
											<div key={index} className="flex items-center space-x-3.5">
												<div className="relative">
													<Skeleton className="h-9 w-9 rounded-full" />
													<Skeleton className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full" />
												</div>
												<div className="flex-1 space-y-2">
													<Skeleton className="h-3.5 w-24" />
													<Skeleton className="h-2.5 w-16" />
												</div>
												<div className="text-right space-y-1">
													<Skeleton className="h-4 w-10 rounded-full" />
													<Skeleton className="h-2.5 w-14" />
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Quick Actions Skeleton */}
							<Card className="bg-card">
								<CardHeader>
									<div className="flex items-center">
										<Skeleton className="h-4 w-4 mr-2" />
										<Skeleton className="h-5 w-24" />
									</div>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-3.5">
										{Array.from({ length: 4 }).map((_, index) => (
											<div key={index} className="h-auto p-3.5 flex flex-col items-center space-y-2 rounded-md">
												<Skeleton className="h-8 w-8 rounded-full" />
												<div className="text-center space-y-1">
													<Skeleton className="h-3.5 w-16" />
													<Skeleton className="h-2.5 w-20" />
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	)
}
