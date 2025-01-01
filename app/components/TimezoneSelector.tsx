'use client'

type Props = {
  value: string;
  onChange: (timezone: string) => void;
};

export default function TimezoneSelector({ value, onChange }: Props) {
  // Get all available timezones
  const timezones = Intl.supportedValuesOf('timeZone');

  return (
    <div className="mb-6">
      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Time Zone
      </label>
      <select
        id="timezone"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
      >
        {timezones.map((tz) => (
          <option key={tz} value={tz}>
            {tz.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </div>
  );
} 