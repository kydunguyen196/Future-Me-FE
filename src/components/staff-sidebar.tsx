"use client"

import * as React from "react"
import {
  Settings2,
  LayoutDashboard,
  HelpCircle,
  GraduationCap,
  BookOpen,
  Users,
  Calendar,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { default as Link } from "@/components/ui/CustomLink"
import { useAppSelector } from "@/redux/hooks"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function StaffSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const location = useLocation()
  
  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path
  }
  
  // Use current user data or fallback to default values
  const userData = {
    name: user?.fullName || user?.username || "Staff User",
    email: user?.email || "staff@futureme.com",
    avatar: user?.avatar || "/avatars/staff.jpg", 
  }

  // Staff navigation structure
  const staffNavGroups: NavGroup[] = [
    {
      label: t('staff.sidebar.ticketManagement'),
      items: [
        {
          title: t('staff.sidebar.assignedTickets'),
          url: '/staff/tickets',
          icon: HelpCircle,
        },
      ],
    },
    {
      label: t('staff.sidebar.tutorManagement'),
      items: [
        {
          title: t('staff.sidebar.manageTutors'),
          url: '/staff/tutors',
          icon: GraduationCap,
        },
      ],
    },
    {
      label: t('staff.sidebar.courseManagement'),
      items: [
        {
          title: t('staff.sidebar.manageCourses'),
          url: '/staff/courses',
          icon: BookOpen,
        },
        {
          title: t('staff.sidebar.manageClasses'),
          url: '/staff/classes',
          icon: Users,
        },
        {
          title: t('staff.sidebar.calendar'),
          url: '/staff/calendar',
          icon: Calendar,
        },
      ],
    }
  ]

  const systemNavItems: NavItem[] = [
    {
      title: t('staff.sidebar.settings'),
      url: '/staff/settings',
      icon: Settings2,
    },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/staff" className="flex items-center">
                <img
                  src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
                  alt="FutureMe Staff"
                  style={{ paddingLeft: "10px" }}
                  className="h-9 w-auto object-contain"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild 
                tooltip={t('staff.common.dashboard')}
                isActive={isPathActive('/staff/dashboard')}
              >
                <Link to="/staff/dashboard">
                  <LayoutDashboard className="text-black"/>
                  <span className="text-black">{t('staff.common.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Staff Navigation Groups */}
        {staffNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title} 
                    isActive={isPathActive(item.url)}
                  >
                    <Link to={item.url}>
                      <item.icon className="text-black"/>
                      <span className="text-black">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* System Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('staff.sidebar.system')}</SidebarGroupLabel>
          <SidebarMenu>
            {systemNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  isActive={isPathActive(item.url)}
                >
                  <Link to={item.url}>
                    <item.icon className="text-black"/>
                    <span className="text-black">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
} 