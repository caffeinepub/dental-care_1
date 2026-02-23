import { useState, useMemo, useEffect } from 'react';
import { useAllAppointments, useGetClinicOpen, useGetAllOpeningHours, useSetOpeningHours } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Phone, User, Stethoscope, Search, ArrowUpDown, LogOut, Clock, Save, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceType } from '../backend';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
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
  // Use Internet Identity for admin authentication
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: appointments, isLoading: appointmentsLoading, error } = useAllAppointments();
  
  // Clinic status and opening hours
  const { data: clinicOpen, isLoading: clinicOpenLoading } = useGetClinicOpen();
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

  const handleLogout = async () => {
    await clear();
    window.location.href = '/';
  };

  const handleLogin = async () => {
    try {
      await login();
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Please login with Internet Identity to access the admin panel
              </p>
            </div>
            <Button
              onClick={handleLogin}
              disabled={loginStatus === 'logging-in'}
              className="w-full"
              size="lg"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAuthError = errorMessage.toLowerCase().includes('unauthorized') || 
                        errorMessage.toLowerCase().includes('only admins');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              {isAuthError ? 'Access Denied' : 'Error Loading Admin Panel'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="font-semibold text-destructive mb-2">
                {errorMessage}
              </p>
              <p className="text-sm text-muted-foreground">
                {isAuthError 
                  ? 'Your account does not have admin privileges. Please contact the system administrator.'
                  : 'There was an error loading the admin panel. Please try again.'}
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
                onClick={handleLogout}
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
                Manage appointments and operating hours
              </p>
            </div>
            <Button
              onClick={handleLogout}
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
            {clinicOpen && (
              <Badge className="gap-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-3 h-3" />
                Clinic Open
              </Badge>
            )}
          </div>
        </div>

        {/* Clinic Status Info Banner - Read-only */}
        {clinicOpen && (
          <Card className="mb-6 shadow-lg border-2 border-green-500/20 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-green-800 dark:text-green-300">
                    Clinic is Open
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Currently accepting new appointments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Opening Hours Management */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Operating Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daysOfWeek.map((day) => {
                const hours = editingHours[day];
                return (
                  <div key={day} className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-sm">{day}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor={`${day}-open`} className="text-xs">
                          Open
                        </Label>
                        <Input
                          id={`${day}-open`}
                          type="number"
                          min="0"
                          max="23"
                          value={hours?.openTime || '9'}
                          onChange={(e) => handleHoursChange(day, 'openTime', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`${day}-close`} className="text-xs">
                          Close
                        </Label>
                        <Input
                          id={`${day}-close`}
                          type="number"
                          min="0"
                          max="23"
                          value={hours?.closeTime || '17'}
                          onChange={(e) => handleHoursChange(day, 'closeTime', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSaveOpeningHours(day)}
                      disabled={isSettingOpeningHours}
                      className="w-full"
                    >
                      {isSettingOpeningHours ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-3 h-3 mr-1" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <Card
          ref={tableRef}
          className={`shadow-lg transition-all duration-700 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="search-name" className="text-sm font-medium">
                  Search by Name
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search-name"
                    placeholder="Patient name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-service" className="text-sm font-medium">
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
                <Label htmlFor="start-date" className="text-sm font-medium">
                  Start Date
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date" className="text-sm font-medium">
                  End Date
                </Label>
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
                Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
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
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
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
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.patientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{appointment.contactInfo}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-xs">
                              {serviceTypeToText(appointment.serviceType)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {format(new Date(Number(appointment.date) / 1000000), 'PPp')}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
