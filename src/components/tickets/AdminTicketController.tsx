import { useEffect, useState } from 'react';
import { 
  Ticket as TicketIcon, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  UserPlus,
  Eye,
  FileText,
  Paperclip
} from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useAppSelector } from '@/redux/hooks';
import { 
  type Ticket,
  type TicketStatus,
} from '@/pages/protected/ticket/Models';
import { type Account } from '@/pages/protected/admin/account/Models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketManagementSkeleton } from '@/components/ui/TicketManagementSkeleton';
import { toast } from 'react-toastify';
import api from '@/lib/axios';

interface AdminTicketControllerProps {
  className?: string;
}

// Add this helper function before the AdminTicketController component
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export function AdminTicketController({ className }: AdminTicketControllerProps) {
  //@ts-ignore:user is not defined in the state
  const { user } = useAppSelector(state => state.auth);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus>('PENDING');
  const [staffMembers, setStaffMembers] = useState<Account[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 50,
    totalPages: 1,
    totalItems: 0
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Comment interface
  interface Comment {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorRole: 'user' | 'staff' | 'admin';
    content: string;
    createdAt: string;
    isInternal?: boolean;
    authorAvatar?: string;
  }

  useEffect(() => {
    loadTickets();
    loadStaffMembers();
  }, []);

  const loadTickets = async (filters = {}) => {
    try {
      const defaultParams = {
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        sortBy: 'createdAt',
        orderBy: 'DESC'
      };

      const response = await api.get('/id/manager/ticket', {
        params: { ...defaultParams, ...filters }
      });
      
      // Handle the paginated API response structure
      const responseData = response.data.data;
      const ticketsData = responseData?.items || [];
      
      // Update pagination info
      setPagination({
        pageNumber: responseData?.pageNumber || 1,
        pageSize: responseData?.pageSize || 50,
        totalPages: responseData?.totalPages || 1,
        totalItems: responseData?.totalItems || 0
      });
      
      setTickets(ticketsData);
    } catch (error) {
      console.error('Failed to load tickets:', error);
      toast.error('Failed to load tickets');
      // Set empty array as fallback
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffMembers = async () => {
    try {
      const response = await api.get('/id/manager/account/role/staff');
      // The API response structure has data nested inside a data property
      setStaffMembers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load staff members:', error);
      toast.error('Failed to load staff members');
      // Set empty array as fallback to prevent map errors
      setStaffMembers([]);
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedStaff) return;

    try {
      const response = await api.put(`/id/manager/ticket/${selectedTicket.ticketId}/assign`, {
        assigneeId: selectedStaff
      });
      
      if (response.data) {
        // Update the ticket in the local state
        const updatedTicket = { ...selectedTicket, assigneeId: selectedStaff };
        setTickets(prev => prev.map(t => 
          t.ticketId === selectedTicket.ticketId ? updatedTicket : t
        ));
      }
      
      toast.success('Ticket assigned successfully');
      setIsAssignDialogOpen(false);
      setSelectedTicket(null);
      setSelectedStaff('');
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      toast.error('Failed to assign ticket');
    }
  };

  const handleViewTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
    await loadTicketComments(ticket.ticketId);
  };

  const loadTicketComments = async (ticketId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await api.get(`/id/ticket/${ticketId}/comment`);
      if (response.data?.result === 'OK' && Array.isArray(response.data.data)) {
        setComments(response.data.data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;
    
    try {
      const response = await api.post(`/id/ticket/${selectedTicket.ticketId}/comment`, {
        content: newComment.trim(),
        attachments: []
      });
      
      if (response.data?.result === 'OK') {
        // Reload comments to get the latest data
        await loadTicketComments(selectedTicket.ticketId);
        setNewComment('');
        toast.success('Comment added successfully');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCreatorDisplayName = (creatorId: string) => {
    // Extract the meaningful part from AC-f4a8445b-e411-4f10-852d-95af53b58249
    const shortId = creatorId.replace('AC-', '').split('-')[0];
    return `User-${shortId}`;
  };

  const getAssigneeDisplayName = (assigneeId: string | null) => {
    if (!assigneeId) return null;
    const shortId = assigneeId.replace('AC-', '').split('-')[0];
    return `Staff-${shortId}`;
  };

  const getStatusBadge = (status: TicketStatus) => {
    const statusConfig = {
      PENDING: { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800', 
        label: 'Pending' 
      },
      PROCESSING: { 
        className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800', 
        label: 'Processing' 
      },
      COMPLETED: { 
        className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800', 
        label: 'Completed' 
      },
      CANCELLED: { 
        className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800', 
        label: 'Cancelled' 
      },
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PROCESSING': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'CANCELLED': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Handle filtering through API instead of client-side filtering
  const handleFilterChange = async (newStatusFilter: TicketStatus | 'ALL') => {
    setStatusFilter(newStatusFilter);
    const filters: any = {};
    
    if (newStatusFilter !== 'ALL') {
      filters.status = newStatusFilter;
    }
    
    setIsLoading(true);
    await loadTickets(filters);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch; // Status filtering is now handled by API
  });

  const statsData = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'PENDING').length,
    processing: tickets.filter(t => t.status === 'PROCESSING').length,
    completed: tickets.filter(t => t.status === 'COMPLETED').length,
    cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
  };

  // Add helper function to get initials
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = async () => {
    if (!selectedTicket) return;

    try {
      const response = await api.put(`/id/manager/ticket/${selectedTicket.ticketId}/status`, {
        status: newStatus
      });
      
      if (response.data) {
        const updatedTicket = { ...selectedTicket, status: newStatus };
        setTickets(prev => prev.map(t => 
          t.ticketId === selectedTicket.ticketId ? updatedTicket : t
        ));
        toast.success('Ticket status updated successfully');
      }
      
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
    }
  };

  // Add this function to handle image transformations reset
  const resetImageTransforms = () => {
    setImageScale(1);
    setRotation(0);
  };

  if (isLoading) {
    return <TicketManagementSkeleton itemCount={5} />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <TicketIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Ticket Management</CardTitle>
                <CardDescription className="text-lg">
                  Manage and monitor all support tickets
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{statsData.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{statsData.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Processing</p>
                <p className="text-2xl font-bold text-blue-700">{statsData.processing}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{statsData.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-700">{statsData.cancelled}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange(value as TicketStatus | 'ALL')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.ticketId} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {/* Main Content */}
                <div className="flex-1">
                  {/* Header with title and status badge */}
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{ticket.title}</h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-xs text-gray-500 text-left">Assignee</p>
                        <div className="flex items-center space-x-2">
                          {ticket.assigneeId ? (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarImage 
                                  src={ticket.assigneeAvatar || undefined} 
                                  alt={ticket.assigneeName || getAssigneeDisplayName(ticket.assigneeId) || undefined} 
                                />
                                <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                                  {getInitials(ticket.assigneeName || getAssigneeDisplayName(ticket.assigneeId) || '')}
                                </AvatarFallback>
                              </Avatar>
                              <Badge variant="outline" className="hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200">
                                {ticket.assigneeName || getAssigneeDisplayName(ticket.assigneeId)}
                              </Badge>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 text-left">Unassigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div>
                        <p className="text-xs text-gray-500 text-left">Created</p>
                        <p className="text-sm font-medium text-gray-900 text-left">{formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                    
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div>
                          <p className="text-xs text-gray-500 text-left">Attachments</p>
                          <p className="text-sm font-medium text-gray-900 text-left">{ticket.attachments.length} file(s)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions - in one line */}
                <div className="flex space-x-2 ml-6">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewTicket(ticket)}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  {ticket.status !== 'CANCELLED' && (
                    <>
                      {ticket.status === 'PENDING' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsAssignDialogOpen(true);
                          }}
                          disabled={!!ticket.assigneeId}
                          className="flex items-center space-x-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>{ticket.assigneeId ? 'Assigned' : 'Assign'}</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setNewStatus(ticket.status);
                          setIsStatusModalOpen(true);
                        }}
                        className="flex items-center space-x-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>Update Status</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTickets.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-500">No tickets match your current filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Ticket Details Modal */}
      {isViewDialogOpen && selectedTicket && (
        <Modal
          isOpen={isViewDialogOpen}
          onClose={() => setIsViewDialogOpen(false)}
          title="Ticket Details"
          maxWidth="max-w-6xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
            {/* Left Column - Ticket Information */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 text-left">{selectedTicket.title}</h2>

              </div>

              {/* Description and Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={selectedTicket.creatorAvatar} 
                        alt={selectedTicket.creatorName || getCreatorDisplayName(selectedTicket.creatorId)} 
                      />
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                        {getInitials(selectedTicket.creatorName || getCreatorDisplayName(selectedTicket.creatorId))}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-500 text-left">Created by</p>
                      <p className="font-medium text-left">{selectedTicket.creatorName || getCreatorDisplayName(selectedTicket.creatorId)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {selectedTicket.assigneeId ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={selectedTicket.assigneeAvatar || undefined} 
                          alt={selectedTicket.assigneeName || getAssigneeDisplayName(selectedTicket.assigneeId) || undefined} 
                        />
                        <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                          {getInitials(selectedTicket.assigneeName || getAssigneeDisplayName(selectedTicket.assigneeId) || '')}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-gray-100 text-gray-700">
                          NA
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 text-left">Assigned to</p>
                      {selectedTicket.assigneeId ? (
                        <p className="font-medium text-left">{selectedTicket.assigneeName || getAssigneeDisplayName(selectedTicket.assigneeId)}</p>
                      ) : (
                        <p className="text-gray-400 text-left">Unassigned</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedTicket.status)}
                  <div>
                    <p className="text-sm text-gray-500 text-left">Status</p>
                    <div className="text-left">{getStatusBadge(selectedTicket.status)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 text-left">Last updated</p>
                    <p className="font-medium text-left">{formatDate(selectedTicket.updatedAt)}</p>
                  </div>
                </div>

                {/* Description - Full Width */}
                <div className="col-span-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900 text-left">Description</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap text-left">{selectedTicket.description}</p>
                  </div>
                </div>
              </div>
                            {/* Attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Paperclip className="h-5 w-5 text-gray-400" />
                    <h3 className="font-medium text-gray-900">Attachments ({String(selectedTicket.attachments.length)})</h3>
                  </div>
                  <PhotoProvider>
                    <div className="flex flex-wrap gap-4">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className="group relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
                        >
                          {isImageUrl(attachment) ? (
                            <PhotoView src={attachment}>
                              <div className="w-full h-full cursor-pointer">
                                <img 
                                  src={attachment} 
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center">
                                  <Eye className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            </PhotoView>
                          ) : (
                            <div className="w-full h-full p-2 bg-gray-50 flex flex-col items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400 mb-1" />
                              <a 
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline text-center line-clamp-2"
                              >
                                {decodeURIComponent(attachment.split('/').pop() || attachment)}
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </PhotoProvider>
                </div>
              )}

              {/* Image Preview Modal */}
              {previewImage && (
                <Modal
                  isOpen={!!previewImage}
                  onClose={() => {
                    setPreviewImage(null);
                    resetImageTransforms();
                  }}
                  title="Image Preview"
                  maxWidth="max-w-5xl"
                >
                  <div className="relative flex flex-col space-y-4">
                    {/* Preview Container */}
                    <div className="relative overflow-hidden bg-gray-100 rounded-lg min-h-[400px] flex items-center justify-center">
                      <img 
                        src={previewImage} 
                        alt="Preview" 
                        className="max-w-full max-h-[600px] object-contain"
                        style={{
                          transform: `scale(${imageScale}) rotate(${rotation}deg)`,
                          transition: 'transform 0.2s ease-in-out'
                        }}
                      />
                    </div>

                    {/* Toolbar */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 space-x-4">
                      {/* Zoom Out */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={() => setImageScale(scale => Math.max(0.5, scale - 0.1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </Button>

                      {/* Reset Zoom */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={resetImageTransforms}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
                          <path d="M21 3v5h-5"/>
                        </svg>
                      </Button>

                      {/* Zoom In */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={() => setImageScale(scale => Math.min(3, scale + 0.1))}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          <line x1="11" y1="8" x2="11" y2="14"/>
                          <line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </Button>

                      <div className="w-px h-6 bg-gray-600"/>

                      {/* Rotate Left */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={() => setRotation(r => r - 90)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12a10 10 0 1 1 10 10"/>
                          <path d="M2 12h10"/>
                          <path d="m2 12 4-4"/>
                          <path d="m2 12 4 4"/>
                        </svg>
                      </Button>

                      {/* Rotate Right */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={() => setRotation(r => r + 90)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 12a10 10 0 1 1-10-10"/>
                          <path d="M22 12H12"/>
                          <path d="m22 12-4-4"/>
                          <path d="m22 12-4 4"/>
                        </svg>
                      </Button>

                      <div className="w-px h-6 bg-gray-600"/>

                      {/* Download */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-gray-700"
                        onClick={() => window.open(previewImage, '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </Modal>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {selectedTicket.status !== 'CANCELLED' && (
                  <>
                    {selectedTicket.status === 'PENDING' && (
                      <Button 
                        onClick={() => {
                          setIsViewDialogOpen(false);
                          setIsAssignDialogOpen(true);
                        }}
                        disabled={!!selectedTicket.assigneeId}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {selectedTicket.assigneeId ? 'Already Assigned' : 'Assign to Staff'}
                      </Button>
                    )}
                    <Button 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setNewStatus(selectedTicket.status);
                        setIsStatusModalOpen(true);
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column - Comments Section */}
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <FileText className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">Comments & Communication</h3>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {isLoadingComments ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className={`border rounded-lg p-4 ${
                        comment.isInternal 
                          ? 'bg-amber-50 border-amber-200' 
                          : comment.authorRole === 'user' 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage 
                              src={comment.authorAvatar} 
                              alt={comment.authorName} 
                            />
                            <AvatarFallback className={`text-xs ${
                              comment.authorRole === 'user'
                                ? 'bg-blue-100 text-blue-700'
                                : comment.authorRole === 'staff'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}>
                              {getInitials(comment.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <Badge 
                            className={
                              comment.authorRole === 'user'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800'
                                : comment.authorRole === 'staff'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800'
                            }
                          >
                            {comment.authorRole}
                          </Badge>
                          {comment.isInternal && (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800">
                              Internal
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No comments yet</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Add Comment</label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="min-h-[80px] resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      This comment will be visible to all participants
                    </span>
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      Add Comment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Ticket Modal */}
      {isAssignDialogOpen && (
        <Modal
          isOpen={isAssignDialogOpen}
          onClose={() => setIsAssignDialogOpen(false)}
          title="Assign Ticket to Staff"
        >
          <div className="space-y-4">
            {selectedTicket && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{selectedTicket.description}</p>
                <Badge className="mt-2 text-xs font-mono bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800">
                  #{selectedTicket.ticketId.slice(0, 8)}...
                </Badge>
              </div>
            )}
            
            <div>
              <label htmlFor="staff-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Staff Member
              </label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a staff member to assign this ticket" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.accountId} value={staff.accountId}>
                      <div className="flex items-center space-x-2">
                        <span>{staff.firstName} {staff.lastName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {staffMembers.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">No staff members available. Please add staff members first.</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTicket} disabled={!selectedStaff || staffMembers.length === 0}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Ticket
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Change Modal */}
      {isStatusModalOpen && (
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title="Change Ticket Status"
        >
          <div className="space-y-4">
            {selectedTicket && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedTicket.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{selectedTicket.description}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TicketStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PROCESSING">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      <span>Processing</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Cancelled</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
} 