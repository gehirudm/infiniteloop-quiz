"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Lock, Trash2, AlertTriangle, Database, Users, Timer, MousePointer } from "lucide-react"
import Image from "next/image"
import { resetAllData } from "@/lib/quiz-store"

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")

    try {
      const response = await fetch(`/api/leaderboard/login?password=${encodeURIComponent(password)}`)
      const data = await response.json()

      if (data.success) {
        setAuthenticated(true)
      } else {
        setAuthError("Invalid password")
      }
    } catch (error) {
      setAuthError("Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }

    setResetLoading(true)
    setResetSuccess(false)

    try {
      const success = await resetAllData()
      if (success) {
        setResetSuccess(true)
        setConfirmReset(false)
      } else {
        setAuthError("Failed to reset data")
      }
    } catch (error) {
      setAuthError("Reset operation failed")
    } finally {
      setResetLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md infiniteloop-card border-2 border-red-500/30">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Button
                onClick={() => router.push("/leaderboard")}
                variant="outline"
                size="sm"
                className="mb-4 border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Leaderboard
              </Button>
              <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={200} height={50} />
            </div>
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enter admin password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={authLoading}
                  className="bg-white/50 dark:bg-gray-800/50 border-red-500/30 focus:border-red-500"
                />
              </div>

              {authError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                disabled={authLoading || !password}
              >
                {authLoading ? "Authenticating..." : "Access Admin Panel"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Button
              onClick={() => router.push("/leaderboard")}
              variant="outline"
              size="sm"
              className="mr-4 border-infiniteloop-orange text-infiniteloop-orange hover:bg-infiniteloop-orange hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
            <Image src="/infiniteloop-logo.webp" alt="INFINITELOOP 3.0" width={300} height={75} className="mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300 mb-4">System administration and data management</p>
        </div>

        {/* Success Message */}
        {resetSuccess && (
          <Card className="infiniteloop-card border-green-500/30 mb-8">
            <CardContent className="p-6 text-center">
              <div className="text-green-500 text-lg font-semibold mb-2">✅ System Reset Complete</div>
              <p className="text-gray-600 dark:text-gray-400">
                All quiz sessions, results, timings, and click data have been cleared.
              </p>
            </CardContent>
          </Card>
        )}

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="infiniteloop-card border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Sessions</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">Active</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-green-500/30">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Quiz Results</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">Stored</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Timer className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Question Timings</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">Tracked</div>
            </CardContent>
          </Card>
          <Card className="infiniteloop-card border-purple-500/30">
            <CardContent className="p-4 text-center">
              <MousePointer className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-sm text-gray-600 dark:text-gray-400">Click Data</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">Collected</div>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="infiniteloop-card border-2 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Reset System State</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This will permanently delete all data from the system including:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                  <li>All quiz sessions (active and completed)</li>
                  <li>All quiz results and leaderboard data</li>
                  <li>All question timing data</li>
                  <li>All click tracking data</li>
                  <li>All reveal progress</li>
                </ul>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                    <span className="font-semibold text-red-600 dark:text-red-400">Warning</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    This action cannot be undone. All participant data will be permanently lost.
                  </p>
                </div>

                {!confirmReset ? (
                  <Button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    disabled={resetLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Data
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-600 dark:text-red-400 font-semibold">
                      Are you absolutely sure? This will delete everything!
                    </p>
                    <div className="flex space-x-4">
                      <Button
                        onClick={handleReset}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                        disabled={resetLoading}
                      >
                        {resetLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Resetting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Yes, Delete Everything
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setConfirmReset(false)}
                        variant="outline"
                        className="border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
                        disabled={resetLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="infiniteloop-card border-infiniteloop-orange/30 mt-8">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">System Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Scoring System</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 500 points per question maximum</li>
                  <li>• Time-based scoring (80% time = 100% points)</li>
                  <li>• 20% or less time = 10% points (50 points)</li>
                  <li>• Linear interpolation between thresholds</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Database Tables</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• quiz_sessions (active sessions)</li>
                  <li>• quiz_results (completed quizzes)</li>
                  <li>• question_timings (timing data)</li>
                  <li>• clicks (click tracking data)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}