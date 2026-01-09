import { useEffect, useState } from 'react';
import { 
  Ticket as TicketIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search, 
  Eye,
  Calendar,
  FileText,
  Paperclip,
  X
} from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useAppSelector } from '@/redux/hooks';
import { 
  type Ticket,
  type TicketStatus,
} from '@/pages/protected/ticket/Models';
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
import StoreManager from '@/pages/protected/Store';
import api from '@/lib/axios';

interface StaffTicketControllerProps {
  className?: string;
}

// Comment interface that matches the API response
interface Comment {
  commentId: string;
  ticketId: string;
  creatorId: string;
  creatorName: string;
  roleName: string;
  content: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

// Update the FileUpload interface
interface FileUpload {
  file: File;
  preview?: string;
  uploadedUrl?: string;
}

// Add helper function to check if URL is an image
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
};

export function StaffTicketController({ className }: StaffTicketControllerProps) {
  const { user } = useAppSelector(state => state.auth);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentAttachments, setCommentAttachments] = useState<FileUpload[]>([]);
  const [newStatus, setNewStatus] = useState<TicketStatus>('PENDING');

  // Comments Loading Skeleton
  const CommentsLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <div className={`flex items-start space-x-2 max-w-xs ${i % 2 === 0 ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Adding Comment Skeleton
  const AddingCommentSkeleton = () => (
    <div className="flex justify-end">
      <div className="flex items-start space-x-2 max-w-xs flex-row-reverse space-x-reverse">
        <div className="w-8 h-8 bg-green-200 rounded-full animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-green-200 rounded animate-pulse"></div>
          <div className="h-12 bg-green-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    StoreManager.initStore("tickets", null, "ticketId");
    loadAssignedTickets();
  }, []);

  const loadAssignedTickets = async (filters = {}) => {
    try {
      setIsLoading(true);
      const response = await api.get('/id/operation/ticket/assigned', {
        params: { 
          pageNumber: 1,
          pageSize: 50,
          ...filters 
        }
      });
      
      if (response.data?.result === 'OK' && Array.isArray(response.data.data.items)) {
        setTickets(response.data.data.items);
      } else {
        setTickets([]);
      }
    } catch (error) {
      console.error('Failed to load assigned tickets:', error);
      toast.error('Failed to load assigned tickets');
      setTickets([]);
    } finally {
      setIsLoading(false);
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

  // Upload comment file
  const uploadCommentFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/storage/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.result === 'OK') {
        return response.data.data;
      }
      throw new Error('File upload failed');
    } catch (error) {
      console.error('Failed to upload comment file:', error);
      throw new Error('File upload failed');
    }
  };

  // Handle comment file selection
  const handleCommentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Filter files that are too large
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    // Only allow up to 3 files
    if (commentAttachments.length + validFiles.length > 3) {
      toast.error('You can only upload up to 3 files per comment.');
      return;
    }

    // Create file uploads with previews
    const newFiles = validFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setCommentAttachments(prev => [...prev, ...newFiles]);
  };

  // Remove comment file
  const removeCommentFile = (index: number) => {
    setCommentAttachments(prev => {
      const newFiles = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTicket) return;
    
    setIsAddingComment(true);
    try {
      // Upload all attachments first
      const attachmentUrls: string[] = [];
      if (commentAttachments.length > 0) {
        for (const fileUpload of commentAttachments) {
          const uploadedUrl = await uploadCommentFile(fileUpload.file);
          attachmentUrls.push(uploadedUrl);
        }
      }

      const response = await api.post(`/id/ticket/${selectedTicket.ticketId}/comment`, {
        content: newComment.trim(),
        attachments: attachmentUrls
      });
      
      if (response.data?.result === 'OK') {
        // Reload comments to get the latest data
        await loadTicketComments(selectedTicket.ticketId);
        setNewComment('');
        // Clear comment attachments
        commentAttachments.forEach(file => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        setCommentAttachments([]);
        toast.success('Comment added successfully');
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedTicket) return;

    try {
      const response = await api.put(`/id/operation/ticket/${selectedTicket.ticketId}/status`, {
        status: newStatus
      });
      
      if (response.data?.result === 'OK') {
        const updatedTicket = { ...selectedTicket, status: newStatus };
        setTickets(prev => prev.map(t => 
          t.ticketId === selectedTicket.ticketId ? updatedTicket : t
        ));
        setSelectedTicket(updatedTicket);
        setIsStatusModalOpen(false);
        toast.success('Ticket status updated successfully');
      } else {
        throw new Error('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      toast.error('Failed to update ticket status');
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
    const shortId = creatorId.replace('AC-', '').split('-')[0];
    return `User-${shortId}`;
  };

  // const getAssigneeDisplayName = (assigneeId: string | null) => {
  //   if (!assigneeId) return null;
  //   const shortId = assigneeId.replace('AC-', '').split('-')[0];
  //   return `Staff-${shortId}`;
  // };

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

  const handleFilterChange = async (newStatusFilter: TicketStatus | 'ALL') => {
    setStatusFilter(newStatusFilter);
    const filters: any = {};
    
    if (newStatusFilter !== 'ALL') {
      filters.status = newStatusFilter;
    }
    
    if (searchTerm.trim()) {
      filters.search = searchTerm.trim();
    }
    
    await loadAssignedTickets(filters);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!ticket) return false;
    const matchesSearch = (ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statsData = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'PENDING').length,
    processing: tickets.filter(t => t.status === 'PROCESSING').length,
    completed: tickets.filter(t => t.status === 'COMPLETED').length,
    cancelled: tickets.filter(t => t.status === 'CANCELLED').length,
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name || typeof name !== 'string') {
      return 'U'; // Default to 'U' for User if name is undefined/null
    }
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Add this function to handle image transformations reset
  // Remove image transforms functionality for simplicity

  if (isLoading) {
    return <TicketManagementSkeleton itemCount={4} />;
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
                <CardTitle className="text-3xl font-bold">My Assigned Tickets</CardTitle>
                <CardDescription className="text-lg">
                  Handle tickets assigned to you and provide excellent support
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
              <TicketIcon className="h-8 w-8 text-gray-500" />
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
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage 
                            src={user?.avatar || undefined} 
                            alt={user?.accountId || 'Staff'} 
                          />
                          <AvatarFallback className="text-xs bg-green-100 text-green-700">
                            {getInitials(user?.accountId || 'Staff')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs text-gray-500 text-left">Assignee</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700">
                            Me
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 text-left">Created</p>
                        <p className="text-sm font-medium text-gray-900 text-left">{formatDate(ticket.createdAt)}</p>
                      </div>
                    </div>
                    
                    {ticket.attachments && ticket.attachments.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Paperclip className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500 text-left">Attachments</p>
                          <p className="text-sm font-medium text-gray-900 text-left">{ticket.attachments.length} file(s)</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
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
              <p className="text-gray-500">
                {statusFilter === 'ALL' 
                  ? "You don't have any assigned tickets yet." 
                  : `No ${statusFilter.toLowerCase()} tickets found.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Ticket Details Modal */}
      {isViewDialogOpen && selectedTicket && (
        <Modal
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            // Clear comment attachments when closing modal
            commentAttachments.forEach(file => {
              if (file.preview) {
                URL.revokeObjectURL(file.preview);
              }
            });
            setCommentAttachments([]);
            setNewComment('');
          }}
          title="Ticket Details"
          maxWidth="max-w-6xl"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
            {/* Left Column - Ticket Information */}
            <div className="space-y-6">
              {/* Header */}
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900 text-left">{selectedTicket.title}</h2>               
              </div>

              {/* Description and Status Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={selectedTicket.creatorAvatar || undefined} 
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
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={user?.avatar || undefined} 
                        alt={user?.accountId || 'Staff'} 
                      />
                      <AvatarFallback className="text-xs bg-green-100 text-green-700">
                        {getInitials(user?.accountId || 'Staff')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-gray-500 text-left">Assigned to</p>
                      <p className="font-medium text-green-600 text-left">Me</p>
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

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                {selectedTicket.status !== 'CANCELLED' && (
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
                )}
              </div>
            </div>

            {/* Right Column - Comments Section */}
            <div className="flex flex-col h-full">
              <div className="flex items-center space-x-2 mb-4 pb-3 border-b">
                <FileText className="h-5 w-5 text-gray-400" />
                <h3 className="font-medium text-gray-900">Comments & Communication</h3>
              </div>

              {/* Comments List - Messenger Style */}
              <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-3">
                {isLoadingComments ? (
                  <CommentsLoadingSkeleton />
                ) : comments.length > 0 ? (
                  <>
                    {comments.map((comment) => {
                      const isCurrentUser = comment.creatorId === user?.accountId;
                      return (
                        <div 
                          key={comment.commentId} 
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                            isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                          }`}>
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-xs ${
                                  isCurrentUser 
                                    ? 'bg-green-100 text-green-700' 
                                    : comment.roleName === 'STAFF' || comment.roleName === 'ADMIN'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {getInitials(comment.creatorName)}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className="flex-1">
                              {/* Author info */}
                              <div className={`flex items-center space-x-2 mb-1 ${
                                isCurrentUser ? 'justify-end' : 'justify-start'
                              }`}>
                                {!isCurrentUser && (
                                  <>
                                    <span className="text-xs font-medium text-gray-600">{comment.creatorName}</span>                                   
                                  </>
                                )}
                                <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                              </div>
                              
                              {/* Message Content */}
                              <div className={`rounded-2xl px-4 py-2 ${
                                isCurrentUser 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                                
                                {/* Comment Attachments */}
                                {comment.attachments && comment.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    <PhotoProvider>
                                      {comment.attachments.map((attachment, index) => (
                                        <div key={index} className="relative">
                                          {isImageUrl(attachment) ? (
                                            <PhotoView src={attachment}>
                                              <div className="cursor-pointer max-w-xs">
                                                <img 
                                                  src={attachment} 
                                                  alt={`Attachment ${index + 1}`}
                                                  className="rounded-lg max-w-full h-auto"
                                                />
                                              </div>
                                            </PhotoView>
                                          ) : (
                                            <a 
                                              href={attachment}
                                              target="_blank"
                                              rel="noopener noreferrer" 
                                              className={`flex items-center space-x-2 p-2 rounded border ${
                                                isCurrentUser 
                                                  ? 'bg-green-600 border-green-400 text-green-100 hover:bg-green-700' 
                                                  : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                                              }`}
                                            >
                                              <Paperclip className="h-4 w-4" />
                                              <span className="text-sm">
                                                {decodeURIComponent(attachment.split('/').pop() || attachment)}
                                              </span>
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </PhotoProvider>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show adding comment skeleton */}
                    {isAddingComment && <AddingCommentSkeleton />}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No comments yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t pt-4">
                <div className="space-y-3 text-left">
                  <label className="text-sm font-medium text-gray-700">Add Comment</label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    className="min-h-[80px] resize-none"
                  />
                  
                  {/* Comment Attachments */}
                  {commentAttachments.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Attachments</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {commentAttachments.map((fileUpload, index) => (
                          <div
                            key={index}
                            className="relative group border rounded-lg p-2 hover:border-blue-500 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Paperclip className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium truncate">
                                {fileUpload.file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCommentFile(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload Button */}
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleCommentFileSelect}
                      multiple
                      className="hidden"
                      id="comment-file-upload"
                    />
                    <label
                      htmlFor="comment-file-upload"
                      className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Paperclip className="h-4 w-4 mr-1" />
                      Add Files
                    </label>
                    <span className="text-xs text-gray-500">
                      Up to 3 files, max 10MB each
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      This comment will be visible to all participants
                    </span>
                    <Button 
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isAddingComment}
                      size="sm"
                    >
                      {isAddingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Add Comment'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
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