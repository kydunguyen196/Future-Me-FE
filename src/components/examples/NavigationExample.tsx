import CustomLink from '@/components/ui/CustomLink';

/**
 * Example component demonstrating how to use CustomLink and NavigationSpinner
 * This shows various use cases and configurations
 */
export function NavigationExample() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">CustomLink Examples</h2>
        
        <div className="space-y-4">
          {/* Basic usage */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Basic Usage</h3>
            <div className="flex gap-4">
              <CustomLink 
                to="/dashboard" 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Go to Dashboard
              </CustomLink>
              
              <CustomLink 
                to="/profile"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                View Profile
              </CustomLink>
            </div>
          </div>

          {/* Spinner positioning */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Spinner Positioning</h3>
            <div className="flex gap-4">
              <CustomLink 
                to="/settings" 
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Settings (Left Spinner)
              </CustomLink>
              
              <CustomLink 
                to="/help" 

                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                Help (Right Spinner)
              </CustomLink>
            </div>
          </div>

          {/* Custom spinner styling */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Custom Spinner Styling</h3>
            <div className="flex gap-4">
              <CustomLink 
                to="/reports" 
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reports (Red Spinner)
              </CustomLink>
              
              <CustomLink 
                to="/analytics" 
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
              >
                Analytics (Small Spinner)
              </CustomLink>
            </div>
          </div>

          {/* Disabled and no spinner */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Special Cases</h3>
            <div className="flex gap-4">
              <CustomLink 
                to="/admin" 
                disabled
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Admin (Disabled)
              </CustomLink>
              
              <CustomLink 
                to="/static-page" 
                showSpinner={false}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Static Page (No Spinner)
              </CustomLink>
            </div>
          </div>

          {/* Button-style links */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Button-style Navigation</h3>
            <div className="flex gap-4">
              <CustomLink 
                to="/create-post" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create New Post
              </CustomLink>
              
              <CustomLink 
                to="/import-data" 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Import Data
              </CustomLink>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Global Navigation Spinner</h2>
        <p className="text-gray-600 mb-4">
          The NavigationSpinner component automatically appears during navigation and provides a full-screen loading overlay.
          It's already integrated in your app through the NavigationProvider context.
        </p>
        
        <div className="bg-gray-100 p-4 rounded-md">
          <code className="text-sm">
            {`// Already added to your App.tsx:`}
            <br />
            {`<NavigationSpinner />`}
          </code>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Usage Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold">1. Replace regular Links:</h4>
            <div className="bg-gray-100 p-3 rounded-md mt-1">
              <code>
                {`// Instead of:`}<br />
                {`import { Link } from 'react-router-dom';`}<br />
                {`<Link to="/dashboard">Dashboard</Link>`}<br /><br />
                {`// Use:`}<br />
                {`import CustomLink from '@/components/ui/CustomLink';`}<br />
                {`<CustomLink to="/dashboard">Dashboard</CustomLink>`}
              </code>
            </div>
          </div>

          <div>
            <h4 className="font-semibold">2. Global spinner is automatic:</h4>
            <p className="text-gray-600">
              The NavigationSpinner component works automatically with the NavigationProvider context.
              No additional setup required - it will show during any navigation.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">3. Customize as needed:</h4>
            <ul className="list-disc pl-5 text-gray-600">
              <li>Use `showSpinner={false}` to disable spinners for specific links</li>
              <li>Use `spinnerPosition="right"` to move spinner to the right</li>
              <li>Use `spinnerClassName` to style the spinner</li>
              <li>Use `disabled` to disable navigation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavigationExample; 