export const toolConfig = {
  id: 'timestamp-converter',
  name: 'Timestamp Converter',
  description: 'Convert between Unix timestamps and human-readable dates with timezone support. The best timestamp conversion tool for developers.',
  shortDescription: 'Convert timestamps and dates with timezone support',
  emoji: '⏰',
  category: 'utility' as const,
  tags: ['timestamp', 'unix', 'date', 'time', 'timezone', 'epoch', 'conversion'],
  path: '/tools/timestamp-converter',
  
  // SEO and metadata
  keywords: [
    'timestamp converter',
    'unix timestamp',
    'epoch converter',
    'date converter',
    'timezone converter',
    'timestamp to date',
    'epoch time',
    'unix time converter',
    'timestamp format',
    'date format converter'
  ],
  
  // Feature descriptions for documentation
  features: {
    free: [
      'Unix timestamp to date conversion',
      'Date to Unix timestamp conversion',
      'Current timestamp display with auto-update',
      'Basic timezone support (UTC, Local, common zones)',
      'ISO 8601 format support',
      'Millisecond precision handling',
      'Copy results to clipboard',
      'Input validation and error handling',
      'Live bidirectional conversion',
      'Help panel with examples and shortcuts'
    ],
    premium: [
      'Batch timestamp conversion from CSV/text',
      'Custom date format patterns (strftime, moment.js)',
      'Timezone comparison view (multiple zones)',
      'Historical timezone data with DST handling',
      'CSV/JSON import and export',
      'Timestamp arithmetic (add/subtract intervals)',
      'Relative time calculations ("2 hours ago")',
      'Multiple timestamp formats support',
      'Advanced validation and edge case handling',
      'Premium keyboard shortcuts',
      'File upload for batch processing',
      'Performance metrics and timing'
    ]
  },
  
  // Examples for help and documentation
  examples: [
    {
      title: 'Unix Timestamp to Date',
      input: '1704110400',
      output: '2024-01-01 12:00:00 UTC',
      description: 'Convert Unix timestamp to human-readable date'
    },
    {
      title: 'Date to Unix Timestamp',
      input: '2024-01-01T12:00:00Z',
      output: '1704110400',
      description: 'Convert ISO date to Unix timestamp'
    },
    {
      title: 'With Milliseconds',
      input: '1704110400000',
      output: '2024-01-01 12:00:00.000 UTC',
      description: 'Handle millisecond precision timestamps'
    },
    {
      title: 'Current Timestamp',
      input: 'now',
      output: 'Live updating current timestamp',
      description: 'Display current time in multiple formats'
    }
  ],
  
  // Common use cases
  useCases: [
    'Converting API timestamps to readable dates',
    'Converting log timestamps for debugging',
    'Scheduling events across timezones',
    'Database timestamp conversion',
    'Analyzing historical data with timestamps',
    'Parsing server logs with epoch times',
    'Converting between different timestamp formats',
    'Timezone-aware date calculations'
  ]
}