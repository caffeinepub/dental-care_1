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
import { Loader2, Calendar, Phone, User, Stethoscope, Search, ArrowUpDown, LogOut, Power, Clock, Save, Mail, CheckCircle2, XCircle } from 'lucide-react';
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

  const handleSetClinicOpen = () => {
    setClinicOpen(true, {
      onSuccess: () => {
        toast.success('Clinic is now open for bookings');
      },
      onError: (error) => {
        toast.error('Failed to open clinic', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      },
    });
  };

  const handleSetClinicClosed = () => {
    setClinicOpen(false, {
      onSuccess: () => {
        toast.success('Clinic is now closed for bookings');
      },
      onError: (error) => {
        toast.error('Failed to close clinic', {
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
                There was an error loading the admin panel. Please try again.
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

        {/* Clinic Status Control - Prominent Card with Open/Close Buttons */}
        <Card className="mb-6 shadow-lg border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Power className="w-6 h-6 text-primary" />
              Clinic Status Control
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  {clinicOpen ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <p className="text-2xl font-bold">
                      {clinicOpen ? 'OPEN' : 'CLOSED'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {clinicOpen
                        ? 'Accepting new appointment bookings'
                        : 'Not accepting new bookings'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSetClinicOpen}
                  disabled={isSettingClinicOpen || clinicOpen === true}
                  size="lg"
                  className={`gap-2 min-w-[140px] ${
                    clinicOpen === true
                      ? 'bg-green-600 hover:bg-green-600 text-white'
                      : 'bg-green-600/20 hover:bg-green-600 text-green-700 hover:text-white'
                  }`}
                >
                  {isSettingClinicOpen && clinicOpen !== true ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Open
                </Button>
                <Button
                  onClick={handleSetClinicClosed}
                  disabled={isSettingClinicOpen || clinicOpen === false}
                  size="lg"
                  variant="destructive"
                  className={`gap-2 min-w-[140px] ${
                    clinicOpen === false
                      ? 'bg-red-600 hover:bg-red-600 text-white'
                      : 'bg-red-600/20 hover:bg-red-600 text-red-700 hover:text-white'
                  }`}
                >
                  {isSettingClinicOpen && clinicOpen !== false ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Close
                </Button>
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
                      <Label htmlFor={`${day}-close`} className="text-sm w-12 ml-4">
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
                      {isSettingOpeningHours ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
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
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </Button>
            </div>

            {/* Appointments Table */}
            <div
              ref={tableRef}
              className={`transition-all duration-700 ${
                tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No appointments found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {searchName || filterService !== 'all' || startDate || endDate
                      ? 'Try adjusting your filters'
                      : 'Appointments will appear here once patients book'}
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Patient Name
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Contact
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date & Time
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Service
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment, index) => {
                        const appointmentDate = new Date(Number(appointment.date) / 1000000);
                        const isPast = appointmentDate < new Date();

                        return (
                          <TableRow
                            key={index}
                            className={`hover:bg-muted/50 transition-colors ${
                              isPast ? 'opacity-60' : ''
                            }`}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-4 h-4 text-primary" />
                                </div>
                                {appointment.patientName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {appointment.contactInfo.includes('@') ? (
                                  <>
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <a
                                      href={`mailto:${appointment.contactInfo}`}
                                      className="text-primary hover:underline"
                                    >
                                      {appointment.contactInfo}
                                    </a>
                                  </>
                                ) : (
                                  <>
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <a
                                      href={`tel:${appointment.contactInfo}`}
                                      className="text-primary hover:underline"
                                    >
                                      {appointment.contactInfo}
                                    </a>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {format(appointmentDate, 'MMM dd, yyyy')}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(appointmentDate, 'hh:mm a')}
                                </div>
                                {isPast && (
                                  <Badge variant="outline" className="text-xs">
                                    Past
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-normal">
                                {serviceTypeToText(appointment.serviceType)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
