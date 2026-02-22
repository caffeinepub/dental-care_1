import { useState, useMemo, useEffect } from 'react';
import { useAllAppointments, useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useActor } from '@/hooks/useActor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Calendar, Phone, User, Stethoscope, Search, ArrowUpDown, Lock, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ServiceType } from '../backend';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import AdminLoginForm from '@/components/AdminLoginForm';

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

export default function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Admin authentication using custom hook
  const { isAuthenticated: isAdminAuthenticated, logoutAdmin } = useAdminAuth();

  const { actor } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending: isSavingProfile } = useSaveCallerUserProfile();
  const { data: appointments, isLoading: appointmentsLoading, error } = useAllAppointments();

  const [searchName, setSearchName] = useState('');
  const [filterService, setFilterService] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [profileName, setProfileName] = useState('');

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>();
  const { ref: tableRef, isVisible: tableVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.05 });

  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Log component mount and state changes
  useEffect(() => {
    console.log('[AdminPage] ===== COMPONENT STATE UPDATE =====');
    console.log('[AdminPage] Component state:', {
      timestamp: new Date().toISOString(),
      isAuthenticated,
      isAdminAuthenticated,
      hasActor: !!actor,
      principal: identity?.getPrincipal().toString() || 'none',
      appointmentsLoading,
      hasAppointments: !!appointments,
      appointmentsCount: appointments?.length || 0,
      error: error ? (error instanceof Error ? error.message : String(error)) : null,
      errorStack: error instanceof Error ? error.stack : undefined,
      sessionStorage: {
        adminAuth: sessionStorage.getItem('admin_authenticated'),
        caffeineToken: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
      },
    });
  }, [isAuthenticated, isAdminAuthenticated, actor, identity, appointmentsLoading, appointments, error]);

  // Log when ready to fetch appointments
  useEffect(() => {
    if (isAuthenticated && isAdminAuthenticated && actor) {
      console.log('[AdminPage] ===== READY TO FETCH APPOINTMENTS =====');
      console.log('[AdminPage] All conditions met for fetching:', {
        timestamp: new Date().toISOString(),
        actorAvailable: !!actor,
        principal: identity?.getPrincipal().toString(),
        adminAuthFromSession: sessionStorage.getItem('admin_authenticated'),
        caffeineTokenFromSession: sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent',
        actorMethods: actor ? Object.keys(actor).filter(k => typeof (actor as any)[k] === 'function').slice(0, 10) : [],
      });
    }
  }, [isAuthenticated, isAdminAuthenticated, actor, identity]);

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

  const handleSaveProfile = () => {
    if (profileName.trim()) {
      saveProfile({ name: profileName.trim() });
    }
  };

  const handleAdminLoginSuccess = () => {
    console.log('[AdminPage] Admin login successful, component will re-render with updated auth state');
    // The component will automatically re-render when isAdminAuthenticated changes
    // No additional action needed here
  };

  // Show Internet Identity login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Access Required</CardTitle>
            <p className="text-muted-foreground">
              Please authenticate with Internet Identity to access the admin panel
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
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

  // Show profile setup dialog if user doesn't have a profile
  if (showProfileSetup) {
    return (
      <Dialog open={true}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
            <DialogDescription>
              Please enter your name to complete your profile setup.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Your Name</Label>
              <Input
                id="profile-name"
                placeholder="Enter your full name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && profileName.trim()) {
                    handleSaveProfile();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSaveProfile}
              disabled={!profileName.trim() || isSavingProfile}
              className="w-full"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

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
              <Lock className="w-6 h-6" />
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
            
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">Debug Information:</p>
              <div className="text-xs font-mono space-y-1">
                <p><span className="text-muted-foreground">Principal:</span> {identity?.getPrincipal().toString()}</p>
                <p><span className="text-muted-foreground">Admin Auth (Frontend):</span> {isAdminAuthenticated ? 'true' : 'false'}</p>
                <p><span className="text-muted-foreground">Actor Available:</span> {actor ? 'Yes' : 'No'}</p>
                <p><span className="text-muted-foreground">Session Storage (admin_authenticated):</span> {sessionStorage.getItem('admin_authenticated') || 'null'}</p>
                <p><span className="text-muted-foreground">Session Storage (caffeineAdminToken):</span> {sessionStorage.getItem('caffeineAdminToken') ? 'present' : 'absent'}</p>
              </div>
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
  if (appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium text-muted-foreground">Loading appointments...</p>
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
                Manage appointments and patient information
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
              {userProfile?.name || 'Admin'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {filteredAppointments.length} Appointments
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Patient Name</Label>
                <Input
                  id="search-name"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter-service">Service Type</Label>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger id="filter-service">
                    <SelectValue />
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

            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchName('');
                  setFilterService('all');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear Filters
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Sort by Date ({sortOrder === 'asc' ? 'Oldest First' : 'Newest First'})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card
          ref={tableRef}
          className={`shadow-lg transition-all duration-700 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Appointments ({filteredAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No appointments found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchName || filterService !== 'all' || startDate || endDate
                    ? 'Try adjusting your filters'
                    : 'No appointments have been booked yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Patient Name
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date & Time
                        </div>
                      </TableHead>
                      <TableHead>
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
                        <TableRow key={index} className={isPast ? 'opacity-60' : ''}>
                          <TableCell className="font-medium">{appointment.patientName}</TableCell>
                          <TableCell>{appointment.contactInfo}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {format(appointmentDate, 'MMM dd, yyyy')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {format(appointmentDate, 'hh:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPast ? 'outline' : 'default'}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
