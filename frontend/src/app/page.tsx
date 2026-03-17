import Link from "next/link";
import { Building2, Users, Bed, Wrench, CreditCard, ArrowRight, Shield, CheckCircle2, Clock, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-primary/60 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                DormFlow
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-xl">
                Complete Dormitory Management System for modern educational institutions.
                Streamline hostel operations, student management, and facility bookings all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link href="/login">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <Building2 className="h-96 w-96 text-white/20" />
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Building2, value: "50+", label: "Hostels" },
              { icon: Users, value: "5000+", label: "Students" },
              { icon: Bed, value: "2000+", label: "Rooms" },
              { icon: Wrench, value: "100+", label: "Facilities" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-border bg-card">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for administrators, wardens, and students
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Role-Based Access",
                description: "Secure access control with admin, warden, student, and technician roles.",
              },
              {
                icon: Bed,
                title: "Room Management",
                description: "Complete bed allocation system with availability tracking.",
              },
              {
                icon: CreditCard,
                title: "Fee Management",
                description: "Track and manage student fees with automated reminders.",
              },
              {
                icon: Wrench,
                title: "Maintenance Tracking",
                description: "Streamlined complaint handling and technician task assignment.",
              },
              {
                icon: Clock,
                title: "Access Logging",
                description: "Comprehensive entry/exit logs for security and attendance.",
              },
              {
                icon: Utensils,
                title: "Mess Management",
                description: "Menu planning, subscriptions, and mess facility oversight.",
              },
            ].map((feature, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border border-border">
                <feature.icon className="h-10 w-10 mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Choose Your Role</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored experience for everyone in your institution
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                role: "Admin",
                title: "Administrator",
                description: "Full system access, manage all hostels, users, and settings.",
                color: "bg-purple-100 dark:bg-purple-900/20",
                icon: Shield,
                features: ["Full CRUD Access", "User Management", "System Reports"],
              },
              {
                role: "warden",
                title: "Warden",
                description: "Manage your assigned hostel, students, and maintenance requests.",
                color: "bg-blue-100 dark:bg-blue-900/20",
                icon: Building2,
                features: ["Hostel View", "Student Management", "Complaint Handling"],
              },
              {
                role: "student",
                title: "Student",
                description: "View your room, fees, submit complaints, and book facilities.",
                color: "bg-green-100 dark:bg-green-900/20",
                icon: Users,
                features: ["Room Info", "Fee Status", "Facility Booking"],
              },
              {
                role: "technician",
                title: "Technician",
                description: "View assigned tasks, claim complaints, and update maintenance status.",
                color: "bg-orange-100 dark:bg-orange-900/20",
                icon: Wrench,
                features: ["Task View", "Status Updates", "Work History"],
              },
            ].map((roleCard, i) => (
              <div key={i} className={`${roleCard.color} rounded-xl p-6 border border-border transition-all hover:shadow-lg hover:-translate-y-1`}>
                <roleCard.icon className="h-12 w-12 mb-4 text-foreground" />
                <h3 className="text-xl font-bold mb-2">{roleCard.title}</h3>
                <p className="text-muted-foreground mb-4">{roleCard.description}</p>
                <ul className="space-y-2">
                  {roleCard.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="default" className="w-full mt-4">
                  <Link href="/login">Login as {roleCard.role}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students and administrators who trust DormFlow for their dormitory management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              <Link href="/login">
                Login
              </Link>
            </Button>
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              <Link href="/register">
                Register Student Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">DormFlow</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Complete dormitory management solution for educational institutions.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
                <li><Link href="/features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@dormflow.com" className="hover:text-foreground">support@dormflow.com</a></li>
                <li><a href="tel:+1234567890" className="hover:text-foreground">+1 (234) 567-890</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 DormFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
