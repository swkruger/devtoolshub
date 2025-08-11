'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  BookOpen, 
  Keyboard, 
  Lightbulb, 
  Accessibility,
  Crown,
  Globe,
  Clock,
  Users,
  Download,
  Search,
  MousePointer,
  Eye
} from 'lucide-react'

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  isPremiumUser: boolean
}

export default function HelpPanel({ isOpen, onClose, isPremiumUser }: HelpPanelProps) {
  if (!isOpen) return null

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            World Clock Help
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close help panel"
          >
            ✕
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Features
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-xs">
              <Keyboard className="w-3 h-3 mr-1" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="text-xs">
              <Accessibility className="w-3 h-3 mr-1" />
              Accessibility
            </TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Adding Your First City
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Search for a city</p>
                    <p>Type in the search box to find cities worldwide. Popular cities like New York, London, and Tokyo are prioritized.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Select from results</p>
                    <p>Click on a city from the dropdown or use arrow keys to navigate and press Enter to select.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="text-xs mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">View real-time updates</p>
                    <p>Your selected cities will appear as cards with live time updates every minute.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Understanding Time Displays
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded-full"></div>
                    <span className="font-medium text-blue-700 dark:text-blue-300">Morning (6 AM - 12 PM)</span>
                  </div>
                  <p>Light blue background indicates morning hours</p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-yellow-100 dark:bg-yellow-900 rounded-full"></div>
                    <span className="font-medium text-yellow-700 dark:text-yellow-300">Afternoon (12 PM - 6 PM)</span>
                  </div>
                  <p>Yellow background indicates afternoon hours</p>
                </div>
                
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-100 dark:bg-green-900 rounded-full"></div>
                    <span className="font-medium text-green-700 dark:text-green-300">Business Hours</span>
                  </div>
                  <p>Green border indicates business hours (9 AM - 5 PM weekdays)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Free vs Premium Limits
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Free Plan</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• Up to 5 cities</li>
                    <li>• ±7 days time navigation</li>
                    <li>• Basic meeting planner</li>
                    <li>• JSON export</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Premium Plan
                  </h4>
                  <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• Unlimited cities</li>
                    <li>• ±30 days time navigation</li>
                    <li>• Weather integration</li>
                    <li>• Advanced meeting planner</li>
                    <li>• Calendar export (iCal)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Navigation
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Date Picker</p>
                  <p>Select any date in the past or future using the date picker. Perfect for planning meetings, checking historical times, or exploring how daylight saving time affects different locations.</p>
                </div>

                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Fine-Tune Time</p>
                  <p>Use the navigation controls to fine-tune the selected time by hours or days. Click the arrow buttons or use keyboard shortcuts (→ ← keys).</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Live Updates</p>
                  <p>When viewing current time, all cities update automatically every second. Pause live updates to freeze the display.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Reset to Now</p>
                  <p>Click the reset button or press &apos;R&apos; to quickly return to the current time from any time navigation state.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Meeting Planner {!isPremiumUser && <Badge variant="outline"><Crown className="w-3 h-3 mr-1" />Premium</Badge>}
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Smart Suggestions</p>
                  <p>The meeting planner analyzes all your timezones to find optimal meeting times considering business hours and weekends.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Scoring System</p>
                  <p>Meetings are scored based on how many participants are in business hours, with color-coded ratings from Excellent to Poor.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Calendar Integration</p>
                  <p>Export meeting times as iCal files that can be imported into Google Calendar, Outlook, or any calendar application.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Options
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Copy Individual Times</p>
                  <p>Click the &quot;Copy Time&quot; button on any timezone card to copy the formatted time to your clipboard.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">JSON Export</p>
                  <p>Export all your timezone data as a JSON file for backup or sharing with team members.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">iCal Export {!isPremiumUser && <Badge variant="outline" className="text-xs"><Crown className="w-2 h-2 mr-1" />Premium</Badge>}</p>
                  <p>Export meeting times as calendar events that can be imported into any calendar application.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Keyboard Shortcuts */}
          <TabsContent value="shortcuts" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Navigation Shortcuts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Toggle help panel</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">F1</kbd>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Focus city search</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl + K</kbd>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Reset to current time</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">R</kbd>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Navigate time backward/forward</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">←</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">→</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                View Mode Shortcuts
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Switch to grid view</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">G</kbd>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Switch to meeting planner</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">M</kbd>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Search Navigation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Navigate search results</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">↑</kbd>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">↓</kbd>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Select highlighted city</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Enter</kbd>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                  <span className="text-gray-700 dark:text-gray-300">Close search dropdown</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Escape</kbd>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility" className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Screen Reader Support
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">ARIA Labels</p>
                  <p>All interactive elements have descriptive ARIA labels for screen readers. Time updates are announced in live regions.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Semantic Structure</p>
                  <p>The interface uses proper heading hierarchy and semantic HTML elements for easy navigation with assistive technologies.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Focus Management</p>
                  <p>Keyboard focus is properly managed when opening dialogs, dropdown menus, and navigating between components.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Keyboard Navigation
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Tab Navigation</p>
                  <p>Use Tab and Shift+Tab to navigate through all interactive elements in logical order.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Button Activation</p>
                  <p>All buttons can be activated using Space or Enter keys. Dropdown menus support arrow key navigation.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Skip Links</p>
                  <p>Skip to main content links are available for keyboard users to bypass repetitive navigation.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Visual Accessibility
              </h3>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Color Contrast</p>
                  <p>All text meets WCAG 2.1 AA contrast requirements. Information is not conveyed by color alone.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Dark Mode Support</p>
                  <p>Full dark mode support with appropriate contrast ratios and visual hierarchy preserved.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">Reduced Motion</p>
                  <p>Respects user preferences for reduced motion and provides alternative static indicators.</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Need Additional Accessibility Support?
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                We&apos;re committed to making our tools accessible to everyone. Contact our support team if you need additional accommodations or encounter any accessibility barriers.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}