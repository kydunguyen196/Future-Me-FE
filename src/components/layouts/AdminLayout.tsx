import * as React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { Outlet, useLocation } from "react-router-dom"
import { default as Link } from "@/components/ui/CustomLink"
import { useTranslation } from "react-i18next"
import { NavigationSpinner } from "@/components/ui/NavigationSpinner"

interface AdminLayoutProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function AdminLayout({ 
  title, 
  breadcrumbs 
}: AdminLayoutProps) {
  const location = useLocation()
  const { t } = useTranslation()

  // Route to breadcrumb mapping
  const routeBreadcrumbMap: Record<string, { label: string; translationKey: string }> = {
    '/admin/dashboard': { label: 'Dashboard', translationKey: 'admin.common.dashboard' },
    '/admin/modules': { label: 'Structure', translationKey: 'admin.sidebar.structure' },
    '/admin/users': { label: 'User Management', translationKey: 'admin.sidebar.userManagement' },
    '/admin/content': { label: 'Content Management', translationKey: 'admin.common.contentManagement' },
    '/admin/questions': { label: 'Question Bank', translationKey: 'admin.sidebar.questionBank' },
    '/admin/questions/create': { label: 'Create Question', translationKey: 'admin.common.createQuestion' },
    '/admin/tests': { label: 'Manage Tests', translationKey: 'admin.sidebar.manageTests' },
    '/admin/tests/create': { label: 'Create Test', translationKey: 'admin.sidebar.createTest' },
    '/admin/test-results': { label: 'Test Results', translationKey: 'admin.sidebar.testResults' },
    '/admin/analytics': { label: 'Analytics', translationKey: 'admin.common.analytics' },
    '/admin/settings': { label: 'Settings', translationKey: 'admin.sidebar.settings' },
    '/admin/system-settings': { label: 'System Settings', translationKey: 'admin.common.systemSettings' },
    '/profile': { label: 'Profile', translationKey: 'admin.common.profile' },
    '/admin/notifications': { label: 'Notifications', translationKey: 'admin.common.notifications' },
    '/admin/tickets': { label: 'Ticketing System', translationKey: 'admin.common.ticketingSystem' },
    '/admin/users/create': { label: 'Create User', translationKey: 'admin.users.createModal.title' },
    '/admin/tutors/create': { label: 'Create Tutor', translationKey: 'admin.common.createTutor' },
    '/admin/help': { label: 'Help Center', translationKey: 'admin.common.help' },
  }

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs
    }

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const generatedBreadcrumbs: Array<{ label: string; href?: string }> = []

    // Build path progressively
    let currentPath = ''
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      const routeInfo = routeBreadcrumbMap[currentPath]
      if (routeInfo) {
        const isLast = index === pathSegments.length - 1
        generatedBreadcrumbs.push({
          label: t(routeInfo.translationKey),
          href: isLast ? undefined : currentPath
        })
      }
    })

    return generatedBreadcrumbs
  }

  const currentBreadcrumbs = generateBreadcrumbs()
  const currentTitle = title || (currentBreadcrumbs[currentBreadcrumbs.length - 1]?.label) || t('admin.common.dashboard')

  return (
    <SidebarProvider defaultOpen={false}>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/admin">
                      {t('header.adminPanel')}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {currentBreadcrumbs.map((item, index) => {
                  const isLast = index === currentBreadcrumbs.length - 1
                  
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {item.href && !isLast ? (
                          <BreadcrumbLink asChild>
                            <Link to={item.href}>
                              {item.label}
                            </Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
                
                {currentBreadcrumbs.length === 0 && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 p-8 overflow-y-auto relative">
            <NavigationSpinner position="absolute" />
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default AdminLayout;
