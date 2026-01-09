"use client"

import * as React from "react"
import {
  Settings2,
  Users,
  BookOpen,
  LayoutDashboard,
  HelpCircle,
  FileText,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import { NavUser } from "@/components/nav-user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { default as Link } from "@/components/ui/CustomLink"
import { useAppSelector } from "@/redux/hooks"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAppSelector((state) => state.auth)
  const { t } = useTranslation()
  const location = useLocation()
  
  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    return location.pathname === path
  }
  
  // Use current user data or fallback to default values
  const userData = {
    name: user?.fullName || user?.username || "Admin User",
    email: user?.email || "admin@futureme.com",
    avatar: user?.avatar || "/avatars/admin.jpg", 
  }

  // Admin navigation structure with improved icons
  const adminNavGroups: NavGroup[] = [
    {
      label: t('admin.sidebar.userManagement'),
      items: [
        {
          title: t('admin.sidebar.users'),
          url: '/admin/users',
          icon: Users,
        },
        {
          title: 'Create Tutor',
          url: '/admin/tutors/create',
          icon: Users,
        },
      ],
    },
    {
      label: t('admin.sidebar.satContent'),
      items: [
        {
          title: t('admin.sidebar.structure'),
          url: '/admin/modules',
          icon: BookOpen, // Changed from Layers to BookOpen for better representation
        },
        {
          title: t('admin.sidebar.questionBank'),
          url: '/admin/questions',
          icon: HelpCircle, // Changed from FileQuestion to HelpCircle for better representation
        },
        {
          title: 'Create Questions',
          url: '/admin/questions/create',
          icon: FileText, // Changed from Plus to FileText for better representation
        }
      ],
    },
    // {
    //   label: t('admin.sidebar.testManagement'),
    //   items: [
    //     {
    //       title: t('admin.sidebar.createTest'),
    //       url: '/admin/tests/create',
    //       icon: PlusCircle,
    //     },
    //     {
    //       title: t('admin.sidebar.manageTests'),
    //       url: '/admin/tests',
    //       icon: ClipboardList,
    //     },
    //     {
    //       title: t('admin.sidebar.testResults'),
    //       url: '/admin/test-results',
    //       icon: BarChart,
    //     },
    //   ],
    // },
    {
      label: t('admin.sidebar.support'),
      items: [
        {
          title: 'Ticket Management',
          url: '/admin/tickets',
          icon: HelpCircle,
        },
      ],
    }
  ]

  const systemNavItems: NavItem[] = [
    {
      title: t('admin.sidebar.settings'),
      url: '/admin/settings',
      icon: Settings2,
    },
  ]

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/admin" className="flex items-center">
                <img
                  src={`${import.meta.env.VITE_ASSETS_URL}/assets/images/header_logo.png`}
                  alt="FutureMe Admin"
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
                tooltip={t('admin.common.dashboard')}
                isActive={isPathActive('/admin/dashboard')}
              >
                <Link to="/admin/dashboard">
                  <LayoutDashboard className="text-black"/>
                  <span className="text-black">{t('admin.common.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Admin Navigation Groups */}
        {adminNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                  <SidebarMenuItem>
                    <div className="flex items-center w-full">
                      {item.items?.length ? (
                        // If item has sub-items, don't make it a link
                        <SidebarMenuButton tooltip={item.title} className="flex-1">
                          <item.icon className="text-black"/>
                          <span className="text-black">{item.title}</span>
                        </SidebarMenuButton>
                      ) : (
                        // If item has no sub-items, make it a link
                        <SidebarMenuButton 
                          asChild 
                          tooltip={item.title} 
                          className="flex-1"
                          isActive={isPathActive(item.url)}
                        >
                          <Link to={item.url}>
                            <item.icon className="text-black"/>
                            <span className="text-black">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                      {item.items?.length ? (
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRight className="text-black"/>
                            <span className="sr-only text-black">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                      ) : null}
                    </div>
                    {item.items?.length ? (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isPathActive(subItem.url)}>
                                <Link to={subItem.url} className="text-black">
                                  {subItem.icon && <subItem.icon className="h-4 w-4 text-black" />}
                                  <span className="text-black">{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
        

        {/* System Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('admin.sidebar.system')}</SidebarGroupLabel>
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