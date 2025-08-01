import Link from "next/link"
import { Trophy, Home, Target, Shield } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">CTF Platform</span>
          </Link>

          <div className="flex space-x-6">
            <Link href="/" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/challenges" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
              <Target className="h-4 w-4" />
              <span>Challenges</span>
            </Link>
            <Link href="/leaderboard" className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
