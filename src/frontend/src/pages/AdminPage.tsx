import { useState, useMemo, useEffect } from 'react';
import { useAllAppointments, useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminAuth } from '@/hooks/useAdminAuth';
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

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    if (!appointments) return [];

    let filtered = [...appointments];

    // Filter by patient name
    if (searchName.trim()) {
      filtered = filtered.filter(apt =>
        apt.patientName.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by service type
    if (filterService !== 'all') {
      filtered = filtered.filter(apt => apt.serviceType === filterService);
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate).getTime() * 1000000;
      filtered = filtered.filter(apt => Number(apt.date) >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() * 1000000 + (24 * 60 * 60 * 1000000000); // End of day
      filtered = filtered.filter(apt => Number(apt.date) <= end);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = Number(a.date);
      const dateB = Number(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [appointments, searchName, filterService, sortOrder, startDate, endDate]);

  const allServiceTypes = Object.values(ServiceType);

  const handleSaveProfile = () => {
    if (profileName.trim()) {
      saveProfile({ name: profileName.trim() });
    }
  };

  const handleAdminLoginSuccess = () => {
    // Authentication state is managed by useAdminAuth hook
  };

  const handleAdminLogout = () => {
    logoutAdmin();
  };

  // Show Internet Identity login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please log in to access the admin dashboard and view appointments.
            </p>
            <Button
              onClick={login}
              disabled={isLoggingIn}
              size="lg"
              className="w-full"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login to Continue'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show admin login form if not admin authenticated
  if (!isAdminAuthenticated) {
    return <AdminLoginForm onLoginSuccess={handleAdminLoginSuccess} />;
  }

  // Show profile setup dialog
  if (showProfileSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
              <DialogDescription>
                Please enter your name to complete your profile setup and access the admin dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && profileName.trim()) {
                      handleSaveProfile();
                    }
                  }}
                  disabled={isSavingProfile}
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
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show loading state while fetching profile or appointments
  if (profileLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {profileLoading ? 'Loading profile...' : 'Loading appointments...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error instanceof Error ? error.message : 'Failed to load appointments. Please try again later.'}
            </p>
            {error instanceof Error && error.message.includes('Unauthorized') && (
              <p className="text-sm text-muted-foreground mt-4">
                You may not have the required permissions. Please contact the system administrator.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-7xl">
        {/* Header with Logout Button */}
        <div
          ref={headerRef}
          className={`mb-8 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage and view all appointments
              </p>
            </div>
            <Button
              onClick={handleAdminLogout}
              variant="outline"
              size="lg"
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search by name */}
              <div className="space-y-2">
                <Label htmlFor="searchName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Patient Name
                </Label>
                <Input
                  id="searchName"
                  placeholder="Search by name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Filter by service */}
              <div className="space-y-2">
                <Label htmlFor="filterService" className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Service Type
                </Label>
                <Select value={filterService} onValueChange={setFilterService}>
                  <SelectTrigger id="filterService" className="h-11">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {allServiceTypes.map((service) => (
                      <SelectItem key={service} value={service}>
                        {serviceTypeToText(service)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort by date */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort by Date
                </Label>
                <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}>
                  <SelectTrigger id="sortOrder" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* End date */}
              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredAndSortedAppointments.length}</span> of{' '}
                <span className="font-semibold text-foreground">{appointments?.length || 0}</span> appointments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card
          ref={tableRef}
          className={`shadow-lg transition-all duration-700 ${
            tableVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAndSortedAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">No appointments found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {appointments?.length === 0
                    ? 'No appointments have been booked yet.'
                    : 'Try adjusting your filters.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Patient Name</TableHead>
                      <TableHead className="font-semibold">Contact Info</TableHead>
                      <TableHead className="font-semibold">Date & Time</TableHead>
                      <TableHead className="font-semibold">Service Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedAppointments.map((appointment, index) => {
                      const appointmentDate = new Date(Number(appointment.date) / 1000000);
                      const isPast = appointmentDate < new Date();
                      
                      return (
                        <TableRow
                          key={index}
                          className="hover:bg-muted/50 transition-colors"
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              {appointment.patientName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              {appointment.contactInfo}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {format(appointmentDate, 'PPP p')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-muted-foreground" />
                              {serviceTypeToText(appointment.serviceType)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isPast ? 'secondary' : 'default'}>
                              {isPast ? 'Completed' : 'Upcoming'}
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
