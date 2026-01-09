import * as React from "react"
import { useEffect, useState } from "react"
import { StaffSidebar } from "@/components/staff-sidebar"
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
import api from "@/lib/axios"
import { type Account } from "@/pages/protected/admin/account/Models"

interface StaffLayoutProps {
  title?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export function StaffLayout({ 
  title, 
  breadcrumbs 
}: StaffLayoutProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const [tutorNames, setTutorNames] = useState<Record<string, string>>({})
  const [courseNames, setCourseNames] = useState<Record<string, string>>({})
  const [classNames, setClassNames] = useState<Record<string, string>>({})

  // Route to breadcrumb mapping
  const routeBreadcrumbMap: Record<string, { label: string; translationKey: string }> = {
    '/staff/dashboard': { label: 'Dashboard', translationKey: 'staff.common.dashboard' },
    '/staff/tickets': { label: 'Assigned Tickets', translationKey: 'staff.sidebar.assignedTickets' },
    '/staff/tutors': { label: 'Manage Tutors', translationKey: 'staff.sidebar.manageTutors' },
    '/staff/courses': { label: 'Manage Courses', translationKey: 'staff.sidebar.manageCourses' },
    '/staff/classes': { label: 'Manage Classes', translationKey: 'staff.sidebar.manageClasses' },
    '/staff/certificates': { label: 'Tutor Certificates', translationKey: 'staff.sidebar.tutorCertificates' },
    '/staff/calendar': { label: 'Calendar', translationKey: 'staff.sidebar.calendar' },
    '/staff/profile': { label: 'Profile', translationKey: 'staff.common.profile' },
    '/staff/settings': { label: 'Settings', translationKey: 'staff.sidebar.settings' },
  }

  // Fetch names when on detail pages
  useEffect(() => {
    const tutorDetailMatch = location.pathname.match(/^\/staff\/tutors\/([^\/]+)$/)
    const courseDetailMatch = location.pathname.match(/^\/staff\/courses\/([^\/]+)$/)
    const classDetailMatch = location.pathname.match(/^\/staff\/classes\/([^\/]+)$/)
    
    if (tutorDetailMatch) {
      const tutorId = tutorDetailMatch[1]
      if (!tutorNames[tutorId]) {
        fetchTutorName(tutorId)
      }
    }
    
    if (courseDetailMatch) {
      const courseId = courseDetailMatch[1]
      if (!courseNames[courseId]) {
        fetchCourseName(courseId)
      }
    }
    
    if (classDetailMatch) {
      const classId = classDetailMatch[1]
      if (!classNames[classId]) {
        fetchClassName(classId)
      }
    }
  }, [location.pathname])

  const fetchTutorName = async (tutorId: string) => {
    // Immediately set a loading state to avoid showing the ID
    setTutorNames(prev => ({
      ...prev,
      [tutorId]: ''
    }))

    try {
      // Try local data first (faster)
      const { default: tutorData } = await import('@/data/tutors.json')
      const tutor = (tutorData as Account[]).find(t => t.accountId === tutorId)
      if (tutor) {
        setTutorNames(prev => ({
          ...prev,
          [tutorId]: `${tutor.firstName} ${tutor.lastName}`
        }))
        return
      }
    } catch (error) {
      console.error('Failed to load tutor from local data:', error)
    }

    try {
      // Try API if local data fails or tutor not found
      const response = await api.get(`/id/manager/account/tutor/${tutorId}`)
      if (response.data?.result === 'OK' && response.data.data) {
        const tutor = response.data.data
        setTutorNames(prev => ({
          ...prev,
          [tutorId]: `${tutor.firstName} ${tutor.lastName}`
        }))
        return
      }
    } catch (error) {
      console.error('Failed to fetch tutor from API:', error)
    }

    // If all fails, set fallback name
    setTutorNames(prev => ({
      ...prev,
      [tutorId]: ''
    }))
  }

  const fetchCourseName = async (courseId: string) => {
    setCourseNames(prev => ({
      ...prev,
      [courseId]: ''
    }))

    try {
      // Try local data first
      const { default: courseData } = await import('@/data/courses.json')
      const course = (courseData as any[]).find(c => c.course_id === courseId)
      if (course) {
        setCourseNames(prev => ({
          ...prev,
          [courseId]: course.course_name
        }))
        return
      }
    } catch (error) {
      console.error('Failed to load course from local data:', error)
    }

    try {
      // Try API if local data fails
      const response = await api.get(`/tms/manage/course/${courseId}`)
      if (response.data?.result === 'OK' && response.data.data) {
        const course = response.data.data
        setCourseNames(prev => ({
          ...prev,
          [courseId]: course.course_name
        }))
        return
      }
    } catch (error) {
      console.error('Failed to fetch course from API:', error)
    }

    setCourseNames(prev => ({
      ...prev,
      [courseId]: ''
    }))
  }

  const fetchClassName = async (classId: string) => {
    setClassNames(prev => ({
      ...prev,
      [classId]: ''
    }))

    try {
      // Mock data for classes since they don't have a JSON file
      const mockClasses = [
        { id: '1', name: 'Advanced Mathematics' },
        { id: '2', name: 'English Literature' }
      ]
      
      const classItem = mockClasses.find(c => c.id === classId)
      if (classItem) {
        setClassNames(prev => ({
          ...prev,
          [classId]: classItem.name
        }))
        return
      }
    } catch (error) {
      console.error('Failed to load class data:', error)
    }

    setClassNames(prev => ({
      ...prev,
      [classId]: ''
    }))
  }

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    if (breadcrumbs && breadcrumbs.length > 0) {
      return breadcrumbs
    }

    const pathSegments = location.pathname.split('/').filter(Boolean)
    const generatedBreadcrumbs: Array<{ label: string; href?: string }> = []

    // Handle special cases for detail pages
    const tutorDetailMatch = location.pathname.match(/^\/staff\/tutors\/([^\/]+)$/)
    const courseDetailMatch = location.pathname.match(/^\/staff\/courses\/([^\/]+)$/)
    const classDetailMatch = location.pathname.match(/^\/staff\/classes\/([^\/]+)$/)
    
    if (tutorDetailMatch) {
      const tutorId = tutorDetailMatch[1]
      generatedBreadcrumbs.push({
        label: t('staff.sidebar.manageTutors'),
        href: '/staff/tutors'
      })
      const tutorName = tutorNames[tutorId] || ''
      generatedBreadcrumbs.push({
        label: tutorName
      })
      return generatedBreadcrumbs
    }
    
    if (courseDetailMatch) {
      const courseId = courseDetailMatch[1]
      generatedBreadcrumbs.push({
        label: t('staff.sidebar.manageCourses'),
        href: '/staff/courses'
      })
      const courseName = courseNames[courseId] || ''
      generatedBreadcrumbs.push({
        label: courseName
      })
      return generatedBreadcrumbs
    }
    
    if (classDetailMatch) {
      const classId = classDetailMatch[1]
      generatedBreadcrumbs.push({
        label: t('staff.sidebar.manageClasses'),
        href: '/staff/classes'
      })
      const className = classNames[classId] || ''
      generatedBreadcrumbs.push({
        label: className
      })
      return generatedBreadcrumbs
    }

    // Build path progressively for other routes
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
  const currentTitle = title || (currentBreadcrumbs[currentBreadcrumbs.length - 1]?.label) || t('staff.common.dashboard')

  return (
    <SidebarProvider defaultOpen={false}>
      <StaffSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/staff">
                      {t('header.staffPanel')}
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

export default StaffLayout; 