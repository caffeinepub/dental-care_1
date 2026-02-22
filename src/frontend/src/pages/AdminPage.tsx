import { useState, useMemo, useEffect } from 'react';
import { useAllAppointments, useGetClinicOpen, useSetClinicOpen, useGetAllOpeningHours, useSetOpeningHours } from '@/hooks/useQueries';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, Calendar, Phone, User, Stethoscope, Search, ArrowUpDown, LogOut, Power, Clock, Save, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceType } from '../backend';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AdminLoginForm from '@/components/AdminLoginForm';
import { toast } from 'sonner';

// Map backend ServiceType enum to user-friendly names
function serviceTypeToText(serviceType: ServiceType): string {
  const mapping: Record<ServiceType, string> = {
    [ServiceType.FirstExamAndXray]: 'First Exam & X-ray',
    [ServiceType.Hygiene]: 'Hygiene',
    [ServiceType.HygieneAndExam]: 'Hygiene + Exam',
    [ServiceType.PeriodontalScaling]: 'Periodontal Scaling (Deep Cleaning)',
    [ServiceType.PediatricExamAndCleaning]: 'Pediatric Exam + Cleaning',
    [ServiceType.CrownAndExam]: 'Crown + Exam',
    [ServiceType.ExtractionConsult]: 'Extraction Consult',
    [ServiceType.Extraction]: 'Extraction',
    [ServiceType.InvisalignConsult]: 'Invisalign Consult',
    [ServiceType.BotoxConsultForMigraines]: 'Botox Consult for Migraines',
    [ServiceType.BotoxConsultForCosmetic]: 'Botox Consult for Cosmetic',
  };
  return mapping[serviceType] || 'Unknown Service';
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminPage() {
  // Admin authentication using custom hook
  const { isAuthenticated: isAdminAuthenticated, logoutAdmin } = useAdminAuth();

  const { data: appointments, isLoading: appointmentsLoading, error } = useAllAppointments();
  
  // Clinic status and opening hours
  const { data: clinicOpen, isLoading: clinicOpenLoading } = useGetClinicOpen();
  const { mutate: setClinicOpen, isPending: isSettingClinicOpen } = useSetClinicOpen();
  const { data: openingHours, isLoading: openingHoursLoading } = useGetAllOpeningHours();
  const { mutate: setOpeningHours, isPending: isSettingOpeningHours } = useSetOpeningHours();

  const [searchName, setSearchName] = useState('');
  const [filterService, setFilterService] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingHours, setEditingHours] = useState<Record<string, { openTime: string; closeTime: string }>>({});

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: tableRef, isVisible: tableVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });

  // Initialize editing hours from backend data
  useEffect(() => {
    if (openingHours && openingHours.length > 0) {
      const hoursMap: Record<string, { openTime: string; closeTime: string }> = {};
      openingHours.forEach(([day, hours]) => {
        hoursMap[day] = {
          openTime: String(Number(hours.openTime)),
          closeTime: String(Number(hours.closeTime)),
        };
      });
      setEditingHours(hoursMap);
    }
  }, [openingHours]);

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    let filtered = [...appointments];

    // Filter by patient name
    if (searchName) {
      filtered = filtered.filter((apt) =>
        apt.patientName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by service type
    if (filterService !== 'all') {
      filtered = filtered.filter((apt) => apt.serviceType === filterService);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime() * 1000000;
      filtered = filtered.filter((apt) => Number(apt.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() * 1000000;
      filtered = filtered.filter((apt) => Number(apt.date) <= end);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = Number(a.date);
      const dateB = Number(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [appointments, searchName, filterService, sortOrder, startDate, endDate]);

  const handleAdminLoginSuccess = () => {
    // Force re-render after successful login
    window.location.reload();
  };

  const handleToggleClinicOpen = () => {
    const newStatus = !clinicOpen;
    setClinicOpen(newStatus, {
      onSuccess: () => {
        toast.success(newStatus ? 'Clinic is now open for bookings' : 'Clinic is now closed for bookings');
      },
      onError: (error) => {
        toast.error('Failed to update clinic status', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      },
    });
  };

  const handleSaveOpeningHours = (day: string) => {
    const hours = editingHours[day];
    if (!hours) return;

    const openTime = parseInt(hours.openTime, 10);
    const closeTime = parseInt(hours.closeTime, 10);

    if (isNaN(openTime) || isNaN(closeTime)) {
      toast.error('Invalid time values');
      return;
    }

    if (openTime >= closeTime) {
      toast.error('Opening time must be before closing time');
      return;
    }

    if (openTime < 0 || openTime > 23 || closeTime < 0 || closeTime > 23) {
      toast.error('Hours must be between 0 and 23');
      return;
    }

    setOpeningHours(
      { day, openTime, closeTime },
      {
        onSuccess: () => {
          toast.success(`Updated hours for ${day}`);
        },
        onError: (error) => {
          toast.error('Failed to update hours', {
            description: error instanceof Error ? error.message : 'Unknown error',
          });
        },
      }
    );
  };

  const handleHoursChange = (day: string, field: 'openTime' | 'closeTime', value: string) => {
    setEditingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  // Show admin login form if not admin authenticated
  if (!isAdminAuthenticated) {
    return <AdminLoginForm onLoginSuccess={handleAdminLoginSuccess} />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              Error Loading Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold text-destructive mb-2">
                {error instanceof Error ? error.message : String(error)}
              </p>
              <p className="text-sm text-muted-foreground">
                You may not have the required permissions. Please contact the system administrator.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Retry
              </Button>
              <Button
                onClick={() => {
                  logoutAdmin();
                  window.location.href = '/';
                }}
                variant="destructive"
                className="flex-1"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (appointmentsLoading || clinicOpenLoading || openingHoursLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div
          ref={headerRef}
          className={`mb-8 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage appointments, clinic status, and operating hours
              </p>
            </div>
            <Button
              onClick={() => {
                logoutAdmin();
                window.location.href = '/';
              }}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1">
              <User className="w-3 h-3" />
              Admin
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {filteredAppointments.length} Appointments
            </Badge>
          </div>
        </div>

        {/* Clinic Status Control */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Power className="w-5 h-5" />
              Clinic Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  Clinic is currently {clinicOpen ? 'OPEN' : 'CLOSED'} for new bookings
                </p>
                <p className="text-sm text-muted-foreground">
                  {clinicOpen
                    ? 'Patients can book appointments online'
                    : 'New appointment bookings are disabled'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="clinic-status" className="text-sm font-medium">
                  {clinicOpen ? 'Open' : 'Closed'}
                </Label>
                <Switch
                  id="clinic-status"
                  checked={clinicOpen || false}
                  onCheckedChange={handleToggleClinicOpen}
                  disabled={isSettingClinicOpen}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours Management */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const hours = editingHours[day];
                return (
                  <div key={day} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="w-28 font-medium">{day}</div>
                    <div className="flex items-center gap-2 flex-1">
                      <Label htmlFor={`${day}-open`} className="text-sm w-12">
                        Open:
                      </Label>
                      <Input
                        id={`${day}-open`}
                        type="number"
                        min="0"
                        max="23"
                        value={hours?.openTime || '9'}
                        onChange={(e) => handleHoursChange(day, 'openTime', e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">:00</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Label htmlFor={`${day}-close`} className="text-sm w-12">
                        Close:
                      </Label>
                      <Input
                        id={`${day}-close`}
                        type="number"
                        min="0"
                        max="23"
                        value={hours?.closeTime || '17'}
                        onChange={(e) => handleHoursChange(day, 'closeTime', e.target.value)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">:00</span>
                    </div>
                    <Button
                      onClick={() => handleSaveOpeningHours(day)}
                      disabled={isSettingOpeningHours}
                      size="sm"
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="search-name" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search by Name
                </Label>
                <Input
                  id="search-name"
                  placeholder="Patient name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-service" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Filter by Service
                </Label>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger id="filter-service">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {Object.values(ServiceType).map((service) => (
                      <SelectItem key={service} value={service}>
                        {serviceTypeToText(service)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredAppointments.length} of {appointments?.length || 0} appointments
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort by Date ({sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})
              </Button>
            </div>

            {/* Appointments Table */}
            <div
              ref={tableRef}
              className={`transition-all duration-700 ${
                tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Patient Name</TableHead>
                      <TableHead className="font-semibold">Contact Info</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Service Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAppointments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAppointments.map((appointment, index) => (
                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {appointment.patientName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {appointment.contactInfo.includes('@') ? (
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                ) : null}
                                <span className="text-muted-foreground">{appointment.contactInfo}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(new Date(Number(appointment.date) / 1000000), 'PPp')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="gap-1">
                              <Stethoscope className="w-3 h-3" />
                              {serviceTypeToText(appointment.serviceType)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
